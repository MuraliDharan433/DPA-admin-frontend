import { apiClient } from './client';
import type { AuthUser, LoginPayload, UserProfile } from '@/types/auth.types';

interface LoginResponseData {
  accessToken: string;
  user: AuthUser;
}

export const authApi = {
  login: async (payload: LoginPayload) => {
    const { data } = await apiClient.post<{ data: LoginResponseData }>(
      '/auth/login',
      payload,
    );
    return data.data;
  },
  refresh: async () => {
    const { data } = await apiClient.post<{ data: LoginResponseData }>('/auth/refresh');
    return data.data;
  },
  logout: async () => {
    await apiClient.post('/auth/logout');
  },
  me: async () => {
    const { data } = await apiClient.get<{ data: UserProfile }>('/auth/me');
    return data.data;
  },
  forgotPassword: async (email: string) => {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
  },
  resetPassword: async (token: string, newPassword: string) => {
    const { data } = await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return data;
  },
};
