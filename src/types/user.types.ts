import type { PermissionKey } from '@/constants/permissions';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: PermissionKey[];
  isSystem: boolean;
}

export interface ManagedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  role: Role;
  status: UserStatus;
  permissionOverrides: { grant: PermissionKey[]; revoke: PermissionKey[] };
  lastLoginAt?: string;
  createdAt: string;
}

export interface UserLookupItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}
