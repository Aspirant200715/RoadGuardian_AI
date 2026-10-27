import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/user';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

type AuthSubscription = {
  unsubscribe: () => Promise<void> | void;
};

let authSubscription: AuthSubscription | null = null;
let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  initializeAuth: () => void;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  guestLogin: (role: 'citizen' | 'authority') => void;
  refreshUser: () => Promise<void>;
}

const syncUserWithBackend = async (token: string, fullName: string, role: 'citizen' | 'authority') => {
  try {
    const response = await api.post('/auth/sync', {
      full_name: fullName,
      role: role
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to sync auth state with backend:", error);
    return null;
  }
};

const applySession = (session: any, set: any) => {
  localStorage.removeItem('guest_token');
  localStorage.removeItem('guest_user');

  const intendedRole = localStorage.getItem('intended_role') || 'citizen';
  const localProfileData = JSON.parse(localStorage.getItem(`profile_${session.user.id}`) || '{}');
  const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Citizen';
  
  set({
    token: session.access_token,
    isAuthenticated: true,
    user: {
      id: session.user.id,
      email: session.user.email || '',
      fullName,
      role: intendedRole as 'citizen' | 'authority',
      points: 0,
      badges: [],
      ...localProfileData
    },
    isInitialized: true
  });
  
  // Sync with backend asynchronously
  syncUserWithBackend(session.access_token, fullName, intendedRole as 'citizen' | 'authority').then((dbUser) => {
    if (dbUser) {
      set((state: any) => ({
        user: state.user ? {
          ...state.user,
          fullName: dbUser.full_name || state.user.fullName,
          role: dbUser.role as 'citizen' | 'authority',
          points: dbUser.points ?? state.user.points,
          badges: dbUser.badges || state.user.badges || []
        } : null
      }));
      if (dbUser.role === 'citizen' && intendedRole === 'authority') {
        toast.error("Unauthorized! Your email does not have official department clearance.");
      }
    }
  });
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
  
  guestLogin: (role: 'citizen' | 'authority') => {
    const randomSuffix = Math.floor(Math.random() * 10000);
    const fullName = role === 'authority' ? `Hon'ble Head of State ${randomSuffix}` : `Strategic Citizen Observer ${randomSuffix}`;
    const mockToken = role === 'authority' ? `mock-guest-token-authority-${randomSuffix}` : `mock-guest-token-citizen-${randomSuffix}`;
    const guestUser = {
      id: role === 'authority' ? `mock-guest-authority-id-${randomSuffix}` : `mock-guest-citizen-id-${randomSuffix}`,
      email: role === 'authority' ? `president-${randomSuffix}@roadguardian.gov.in` : `citizen-${randomSuffix}@roadguardian.gov.in`,
      fullName: fullName,
      role: role,
      points: 9999,
      badges: [],
    };
    
    localStorage.setItem('guest_token', mockToken);
    localStorage.setItem('guest_user', JSON.stringify(guestUser));
    
    set({
      token: mockToken,
      isAuthenticated: true,
      user: guestUser,
      isInitialized: true
    });
    // Trigger sync for mock guest
    syncUserWithBackend(mockToken, fullName, role);
  },

  initializeAuth: () => {
    if (authSubscription) {
      authSubscription.unsubscribe();
      authSubscription = null;
    }
    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }

    const hasOAuthHash = typeof window !== 'undefined' && (
      window.location.hash.includes('access_token') ||
      window.location.hash.includes('refresh_token') ||
      window.location.search.includes('code=')
    );

    // Check for OAuth error in the hash
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const errorMsg = hashParams.get('error_description') || hashParams.get('error');
      if (errorMsg) {
        console.error("OAuth error received:", errorMsg);
        toast.error(`Authentication error: ${decodeURIComponent(errorMsg).replace(/\+/g, ' ')}`);
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }

    // Direct manual extraction if access_token is in hash
    if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('access_token=')) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || '';
      if (accessToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ data }) => {
            if (data?.session) {
              if (fallbackTimer) clearTimeout(fallbackTimer);
              applySession(data.session, set);
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
          })
          .catch((err) => {
            console.warn("Manual setSession non-fatal:", err);
          });
      }
    }

    // Hard safety timeout: guaranteed to resolve isInitialized within 2.5s
    fallbackTimer = setTimeout(() => {
      const currentState = useAuthStore.getState();
      if (!currentState.isInitialized) {
        console.warn("Auth initialization safety timer triggered.");
        const guestToken = localStorage.getItem('guest_token');
        const guestUserStr = localStorage.getItem('guest_user');
        if (guestToken && guestUserStr) {
          try {
            const guestUser = JSON.parse(guestUserStr);
            set({ token: guestToken, isAuthenticated: true, user: guestUser, isInitialized: true });
            return;
          } catch (_) {}
        }
        set({ isInitialized: true, isAuthenticated: false, user: null, token: null });
      }
    }, 2500);

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (fallbackTimer) clearTimeout(fallbackTimer);
        applySession(session, set);
        return;
      }

      // If no Supabase session, check for mock guest session
      const guestToken = localStorage.getItem('guest_token');
      const guestUserStr = localStorage.getItem('guest_user');
      
      if (guestToken && guestUserStr) {
        try {
          const guestUser = JSON.parse(guestUserStr);
          if (fallbackTimer) clearTimeout(fallbackTimer);
          set({
            token: guestToken,
            isAuthenticated: true,
            user: guestUser,
            isInitialized: true
          });
          syncUserWithBackend(guestToken, guestUser.fullName, guestUser.role);
          return;
        } catch (e) {
          console.error("Failed to restore guest session:", e);
        }
      }

      // If not parsing OAuth hash, finish initialization as unauthenticated
      if (!hasOAuthHash) {
        if (fallbackTimer) clearTimeout(fallbackTimer);
        set({ isInitialized: true, isAuthenticated: false, user: null, token: null });
      }
    }).catch((err) => {
      console.warn("supabase.auth.getSession failed:", err);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      set({ isInitialized: true, isAuthenticated: false, user: null, token: null });
    });

    // Listen for OAuth redirects and auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        if (fallbackTimer) clearTimeout(fallbackTimer);
        applySession(session, set);
      } else if (event === 'SIGNED_OUT') {
        if (fallbackTimer) clearTimeout(fallbackTimer);
        set({ user: null, token: null, isAuthenticated: false, isInitialized: true });
      } else {
        const guestToken = localStorage.getItem('guest_token');
        const guestUserStr = localStorage.getItem('guest_user');
        if (guestToken && guestUserStr) {
          try {
            const guestUser = JSON.parse(guestUserStr);
            if (fallbackTimer) clearTimeout(fallbackTimer);
            set({ user: guestUser, token: guestToken, isAuthenticated: true, isInitialized: true });
            return;
          } catch (_) {}
        }
        if (!hasOAuthHash) {
          if (fallbackTimer) clearTimeout(fallbackTimer);
          set({ user: null, token: null, isAuthenticated: false, isInitialized: true });
        }
      }
    });
    authSubscription = subscription;
  },

  logout: async () => {
    localStorage.removeItem('guest_token');
    localStorage.removeItem('guest_user');
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase signout failed, clearing store state directly", e);
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (data: Partial<User>) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...data };
      // Persist the extra details locally
      localStorage.setItem(`profile_${state.user.id}`, JSON.stringify({
        phone: updatedUser.phone,
        aadhaar: updatedUser.aadhaar,
        state: updatedUser.state,
        address: updatedUser.address,
        avatar: updatedUser.avatar
      }));
      return { user: updatedUser };
    });
  },

  refreshUser: async () => {
    const state = useAuthStore.getState();
    if (!state.token || !state.user) return;
    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      const dbUser = response.data;
      set((state) => ({
        user: state.user ? {
          ...state.user,
          fullName: dbUser.full_name || state.user.fullName,
          role: dbUser.role as 'citizen' | 'authority',
          points: dbUser.points ?? state.user.points,
          badges: dbUser.badges || state.user.badges || []
        } : null
      }));
    } catch (e) {
      console.error("Failed to refresh user:", e);
    }
  }
}));


