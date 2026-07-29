import { create } from 'zustand';
import { User } from '../types/auth.types';
import api from '../api/axios';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setAuth: (accessToken: string, user: User) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: User) => void;
  initAuth: () => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  setAuth: (accessToken: string, user: User) =>
    set({
      accessToken,
      user,
      isAuthenticated: true,
      isInitializing: false,
    }),

  setAccessToken: (accessToken: string) =>
    set({
      accessToken,
      isAuthenticated: !!accessToken,
    }),

  setUser: (user: User) =>
    set({
      user,
    }),

  initAuth: async () => {
    // If already authenticated in RAM, initialization is complete
    if (get().isAuthenticated && get().accessToken) {
      set({ isInitializing: false });
      return true;
    }

    try {
      // Attempt silent session rehydration via HttpOnly Refresh Cookie
      const res = await api.post('/auth/refresh');
      const data = res.data?.data || res.data;

      if (data && data.accessToken && data.user) {
        set({
          accessToken: data.accessToken,
          user: data.user,
          isAuthenticated: true,
          isInitializing: false,
        });
        return true;
      }
    } catch (err) {
      // Refresh cookie invalid/expired -> Clear RAM store
    }

    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isInitializing: false,
    });
    return false;
  },

  logout: () =>
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isInitializing: false,
    }),
}));
