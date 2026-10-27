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

function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  initializeAuth: () => void;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  guestLogin: (role: 'citizen' | 'authority') => void;
  registerUser: (data: { fullName: string; email: string; role: 'citizen' | 'authority' }) => void;
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
  
  const userObj = {
    id: session.user.id,
    email: session.user.email || '',
    fullName,
    role: intendedRole as 'citizen' | 'authority',
    points: 0,
    badges: [],
    ...localProfileData
  };

  localStorage.setItem('auth_token', session.access_token);
  localStorage.setItem('auth_user', JSON.stringify(userObj));

  set({
    token: session.access_token,
    isAuthenticated: true,
    user: userObj,
    isInitialized: true
  });
  
  // Sync with backend asynchronously
  syncUserWithBackend(session.access_token, fullName, intendedRole as 'citizen' | 'authority').then((dbUser) => {
    if (dbUser) {
      set((state: any) => {
        if (!state.user) return state;
        const updatedUser = {
          ...state.user,
          fullName: dbUser.full_name || state.user.fullName,
          role: dbUser.role as 'citizen' | 'authority',
          points: dbUser.points ?? state.user.points,
          badges: dbUser.badges || state.user.badges || []
        };
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        return { user: updatedUser };
      });
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
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
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

  registerUser: ({ fullName, email, role }: { fullName: string; email: string; role: 'citizen' | 'authority' }) => {
    const randomSuffix = Math.floor(Math.random() * 10000);
    const cleanEmail = email.trim() || `${role}-${randomSuffix}@roadguardian.gov.in`;
    const cleanName = fullName.trim() || (role === 'authority' ? `Department Official ${randomSuffix}` : `Registered Citizen ${randomSuffix}`);
    const token = `auth-reg-token-${role}-${randomSuffix}`;
    const user = {
      id: `user-${role}-${randomSuffix}`,
      email: cleanEmail,
      fullName: cleanName,
      role: role,
      points: role === 'authority' ? 9999 : 50,
      badges: [],
    };

    localStorage.removeItem('guest_token');
    localStorage.removeItem('guest_user');
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));

    set({
      token,
      isAuthenticated: true,
      user,
      isInitialized: true
    });

    syncUserWithBackend(token, cleanName, role);
    toast.success(`Welcome ${cleanName}! Registration successful.`, { icon: '🇮🇳' });
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

    // 1. Immediately restore existing persisted OAuth session if available
    const savedToken = localStorage.getItem('auth_token');
    const savedUserStr = localStorage.getItem('auth_user');
    if (savedToken && savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        set({
          token: savedToken,
          user: savedUser,
          isAuthenticated: true,
          isInitialized: true
        });
      } catch (e) {
        console.warn("Failed to parse saved auth_user:", e);
      }
    }

    // 2. Immediately restore existing guest session if available
    const guestToken = localStorage.getItem('guest_token');
    const guestUserStr = localStorage.getItem('guest_user');
    if (guestToken && guestUserStr && !savedToken) {
      try {
        const guestUser = JSON.parse(guestUserStr);
        set({
          token: guestToken,
          isAuthenticated: true,
          user: guestUser,
          isInitialized: true
        });
      } catch (e) {
        console.warn("Failed to parse guest_user:", e);
      }
    }

    const hasOAuthHash = typeof window !== 'undefined' && (
      window.location.hash.includes('access_token') ||
      window.location.hash.includes('refresh_token') ||
      window.location.search.includes('code=')
    );

    // 3. Direct synchronous extraction from OAuth hash in URL (zero network latency)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const errorMsg = hashParams.get('error_description') || hashParams.get('error');
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (errorMsg) {
        console.error("OAuth error received:", errorMsg);
        toast.error(`Authentication error: ${decodeURIComponent(errorMsg).replace(/\+/g, ' ')}`);
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } else if (accessToken) {
        const claims = parseJwt(accessToken);
        if (claims && claims.sub) {
          const intendedRole = localStorage.getItem('intended_role') || 'citizen';
          const localProfileData = JSON.parse(localStorage.getItem(`profile_${claims.sub}`) || '{}');
          const fullName = claims.user_metadata?.full_name || claims.user_metadata?.name || 'Citizen';
          const userObj = {
            id: claims.sub,
            email: claims.email || claims.user_metadata?.email || '',
            fullName,
            role: intendedRole as 'citizen' | 'authority',
            points: 0,
            badges: [],
            ...localProfileData
          };

          localStorage.removeItem('guest_token');
          localStorage.removeItem('guest_user');
          localStorage.setItem('auth_token', accessToken);
          localStorage.setItem('auth_user', JSON.stringify(userObj));

          set({
            token: accessToken,
            user: userObj,
            isAuthenticated: true,
            isInitialized: true
          });

          // Clean up URL hash so reload doesn't re-parse
          window.history.replaceState(null, '', window.location.pathname + window.location.search);

          // Asynchronously sync with backend database
          syncUserWithBackend(accessToken, fullName, intendedRole as 'citizen' | 'authority');

          // If refresh token exists, also provide it to Supabase in the background
          if (refreshToken) {
            supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).catch((err) => {
              console.warn("Background setSession non-fatal:", err);
            });
          }
          return;
        }
      }
    }

    // 4. Hard safety fallback timer
    fallbackTimer = setTimeout(() => {
      const currentState = useAuthStore.getState();
      if (!currentState.isInitialized) {
        if (currentState.isAuthenticated && currentState.user) {
          set({ isInitialized: true });
          return;
        }
        const activeGuest = localStorage.getItem('guest_token');
        const activeAuth = localStorage.getItem('auth_token');
        if (activeGuest || activeAuth) {
          set({ isInitialized: true, isAuthenticated: true });
          return;
        }
        set({ isInitialized: true, isAuthenticated: false, user: null, token: null });
      }
    }, 2000);

    // 5. Initial Supabase session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (fallbackTimer) clearTimeout(fallbackTimer);
        applySession(session, set);
        return;
      }

      const currentState = useAuthStore.getState();
      if (currentState.isAuthenticated && currentState.user) {
        if (fallbackTimer) clearTimeout(fallbackTimer);
        set({ isInitialized: true });
        return;
      }

      if (!hasOAuthHash) {
        if (fallbackTimer) clearTimeout(fallbackTimer);
        set({ isInitialized: true, isAuthenticated: false, user: null, token: null });
      }
    }).catch((err) => {
      console.warn("supabase.auth.getSession non-fatal:", err);
      const currentState = useAuthStore.getState();
      if (currentState.isAuthenticated && currentState.user) {
        if (fallbackTimer) clearTimeout(fallbackTimer);
        set({ isInitialized: true });
        return;
      }
      if (fallbackTimer) clearTimeout(fallbackTimer);
      set({ isInitialized: true, isAuthenticated: false, user: null, token: null });
    });

    // 6. Supabase OAuth change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        if (fallbackTimer) clearTimeout(fallbackTimer);
        applySession(session, set);
      } else if (event === 'SIGNED_OUT') {
        // Only drop session if user doesn't have an active verified auth_token or guest_token
        const hasToken = localStorage.getItem('auth_token') || localStorage.getItem('guest_token');
        if (!hasToken) {
          if (fallbackTimer) clearTimeout(fallbackTimer);
          set({ user: null, token: null, isAuthenticated: false, isInitialized: true });
        }
      } else {
        const currentState = useAuthStore.getState();
        if (currentState.isAuthenticated && currentState.user) {
          if (fallbackTimer) clearTimeout(fallbackTimer);
          set({ isInitialized: true });
          return;
        }
      }
    });
    authSubscription = subscription;
  },

  logout: async () => {
    localStorage.removeItem('guest_token');
    localStorage.removeItem('guest_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
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
      localStorage.setItem(`profile_${state.user.id}`, JSON.stringify({
        phone: updatedUser.phone,
        aadhaar: updatedUser.aadhaar,
        state: updatedUser.state,
        address: updatedUser.address,
        avatar: updatedUser.avatar
      }));
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
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
      console.warn("Failed to refresh user:", e);
    }
  }
}));


