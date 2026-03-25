import { create } from 'zustand';
import { User, PermissionModule, PermissionAction } from '../types';
import { authService } from '../services/authService';
import { subscribeUnauthorized } from '../utils/authEvents';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasPermission: (module: PermissionModule, action: PermissionAction) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => {
  subscribeUnauthorized(() => {
    set({ user: null, isAuthenticated: false });
  });

  return {
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (email: string, password: string) => {
      try {
        const response = await authService.login({ email, password });
        set({ user: response.user, isAuthenticated: true });
      } catch (error) {
        throw error;
      }
    },

    register: async (email: string, password: string, name: string) => {
      try {
        const response = await authService.register({ email, password, name });
        set({ user: response.user, isAuthenticated: true });
      } catch (error) {
        throw error;
      }
    },

    logout: async () => {
      await authService.logout();
      set({ user: null, isAuthenticated: false });
    },

    checkAuth: async () => {
      try {
        const user = await authService.getStoredUser();
        const token = await authService.getStoredToken();
        if (user && token) {
          set({ user, isAuthenticated: true });
        } else {
          set({ user: null, isAuthenticated: false });
        }
      } catch (error) {
        set({ user: null, isAuthenticated: false });
      } finally {
        set({ isLoading: false });
      }
    },

    hasPermission: (module: PermissionModule, action: PermissionAction): boolean => {
      const { user } = get();
      if (!user) return false;
      if (user.role === 'SUPERADMIN') return true;
      const perms = user.permissions?.[module];
      if (!perms || !Array.isArray(perms)) return false;
      return perms.includes(action);
    },
  };
});
