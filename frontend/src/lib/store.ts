import { create } from 'zustand';
import type { User, Notification } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => void;
  logout: () => void;
}

// IMPORTANT: initial state must be identical on server and client to avoid
// React hydration mismatches (#418, #423, #425). Hydrate from localStorage
// only AFTER mount via hydrate().
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isHydrated: false,
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) localStorage.setItem('user', JSON.stringify(user));
      else localStorage.removeItem('user');
    }
    set({ user });
  },
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('token', token);
      else localStorage.removeItem('token');
    }
    set({ token });
  },
  setLoading: (isLoading) => set({ isLoading }),
  hydrate: () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    set({
      token: stored,
      user: storedUser ? JSON.parse(storedUser) : null,
      isHydrated: true,
    });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ user: null, token: null });
  },
}));

interface UIState {
  sidebarOpen: boolean;
  searchOpen: boolean;
  uploadModalOpen: boolean;
  activeTab: string;
  setSidebarOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setUploadModalOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  searchOpen: false,
  uploadModalOpen: false,
  activeTab: 'home',
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setUploadModalOpen: (uploadModalOpen) => set({ uploadModalOpen }),
  setActiveTab: (activeTab) => set({ activeTab }),
}));

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
}));
