import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface UiState {
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  notifications: Notification[];
  toggleTheme: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: false,
      notifications: [],
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
      addNotification: (notif) => set((state) => ({
        notifications: [...state.notifications, { ...notif, id: Date.now().toString() }]
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }))
    }),
    {
      name: 'ui-storage', // name of item in the storage (must be unique)
      partialize: (state) => ({ theme: state.theme }), // Only persist the theme
    }
  )
);
