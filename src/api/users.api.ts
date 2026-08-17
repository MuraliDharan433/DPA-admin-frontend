import { apiClient } from './client';
import type { ApiResponse, ListQueryParams, PaginatedResponse } from '@/types/common.types';
import type { ManagedUser, Role, UserLookupItem } from '@/types/user.types';
import type { PermissionKey } from '@/constants/permissions';

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  role: string;
  password: string;
  status?: string;
  permissionGrants?: PermissionKey[];
  permissionRevokes?: PermissionKey[];
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'password'>>;

export const usersApi = {
  list: async (params: ListQueryParams) => {
    const { data } = await apiClient.get<PaginatedResponse<ManagedUser>>('/users', { params });
    return data;
  },
  lookup: async (role: string) => {
    const { data } = await apiClient.get<ApiResponse<UserLookupItem[]>>('/users/lookup', {
      params: { role },
    });
    return data.data;
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<ManagedUser>>(`/users/${id}`);
    return data.data;
  },
  create: async (payload: CreateUserPayload) => {
    const { data } = await apiClient.post<ApiResponse<ManagedUser>>('/users', payload);
    return data.data;
  },
  update: async (id: string, payload: UpdateUserPayload) => {
    const { data } = await apiClient.patch<ApiResponse<ManagedUser>>(`/users/${id}`, payload);
    return data.data;
  },
  updatePermissions: async (id: string, grant: PermissionKey[], revoke: PermissionKey[]) => {
    const { data } = await apiClient.patch<ApiResponse<ManagedUser>>(`/users/${id}/permissions`, {
      grant,
      revoke,
    });
    return data.data;
  },
  activate: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse<ManagedUser>>(`/users/${id}/activate`);
    return data.data;
  },
  deactivate: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse<ManagedUser>>(`/users/${id}/deactivate`);
    return data.data;
  },
  resetPassword: async (id: string, newPassword?: string) => {
    const { data } = await apiClient.post<ApiResponse<{ temporaryPassword: string }>>(
      `/users/${id}/reset-password`,
      { newPassword },
    );
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/users/${id}`);
  },
};

export const rolesApi = {
  list: async () => {
    const { data } = await apiClient.get<ApiResponse<Role[]>>('/roles');
    return data.data;
  },
  create: async (payload: { name: string; description?: string; permissions: PermissionKey[] }) => {
    const { data } = await apiClient.post<ApiResponse<Role>>('/roles', payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<{ name: string; description?: string; permissions: PermissionKey[] }>) => {
    const { data } = await apiClient.patch<ApiResponse<Role>>(`/roles/${id}`, payload);
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/roles/${id}`);
  },
};
