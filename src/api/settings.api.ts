import { apiClient } from './client';
import type { ApiResponse } from '@/types/common.types';

export interface InstituteSettings {
  _id: string;
  instituteName: string;
  instituteEmail?: string;
  institutePhone?: string;
  instituteAddress?: string;
}

export interface SettingsPayload {
  instituteName?: string;
  instituteEmail?: string;
  institutePhone?: string;
  instituteAddress?: string;
}

export const settingsApi = {
  get: async () => {
    const { data } = await apiClient.get<ApiResponse<InstituteSettings>>('/settings');
    return data.data;
  },
  update: async (payload: SettingsPayload) => {
    const { data } = await apiClient.patch<ApiResponse<InstituteSettings>>('/settings', payload);
    return data.data;
  },
};
