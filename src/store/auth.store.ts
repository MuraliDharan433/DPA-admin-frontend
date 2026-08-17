import { create } from 'zustand';
import type { AuthUser } from '@/types/auth.types';
import type { PermissionKey } from '@/constants/permissions';

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isHydrating: boolean;
  isAuthenticated: boolean;
  setSession: (accessToken: string, user: AuthUser) => void;
  clearSession: () => void;
  setHydrating: (value: boolean) => void;
  hasPermission: (permission: PermissionKey) => boolean;
  hasAnyPermission: (permissions: PermissionKey[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  isHydrating: true,
  isAuthenticated: false,
  setSession: (accessToken, user) =>
    set({ accessToken, user, isAuthenticated: true, isHydrating: false }),
  clearSession: () =>
    set({ accessToken: null, user: null, isAuthenticated: false, isHydrating: false }),
  setHydrating: (value) => set({ isHydrating: value }),
  hasPermission: (permission) => {
    const { user } = get();
    if (!user) return false;
    if (user.roleName === 'OWNER') return true;
    return user.permissions.includes(permission);
  },
  hasAnyPermission: (permissions) => {
    const { user } = get();
    if (!user) return false;
    if (user.roleName === 'OWNER') return true;
    return permissions.some((p) => user.permissions.includes(p));
  },
}));

/** Non-hook accessor for use outside React components (e.g. the axios interceptor). */
export const authStore = {
  getAccessToken: () => useAuthStore.getState().accessToken,
  setSession: useAuthStore.getState().setSession,
  clearSession: useAuthStore.getState().clearSession,
};
