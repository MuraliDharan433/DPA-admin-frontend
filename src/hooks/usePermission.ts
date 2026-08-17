import { useAuthStore } from '@/store/auth.store';
import type { PermissionKey } from '@/constants/permissions';

export function usePermission() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const hasAnyPermission = useAuthStore((s) => s.hasAnyPermission);
  const user = useAuthStore((s) => s.user);

  return {
    can: (permission: PermissionKey) => hasPermission(permission),
    canAny: (permissions: PermissionKey[]) => hasAnyPermission(permissions),
    isOwner: user?.roleName === 'OWNER',
    role: user?.roleName,
  };
}
