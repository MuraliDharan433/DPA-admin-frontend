import type { PermissionKey } from '@/constants/permissions';

export interface AuthUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  roleName: string;
  permissions: PermissionKey[];
}

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  role: { _id: string; name: string; permissions: PermissionKey[] };
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  permissionOverrides: { grant: PermissionKey[]; revoke: PermissionKey[] };
  lastLoginAt?: string;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}
