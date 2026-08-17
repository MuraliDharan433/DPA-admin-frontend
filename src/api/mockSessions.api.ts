import { apiClient } from './client';
import type { ApiResponse, ListQueryParams, PaginatedResponse } from '@/types/common.types';
import type { MockSession } from '@/types/placement.types';

export interface MockSessionPayload {
  type: string;
  date: string;
  trainer: string;
  feedback?: string;
  rating: number;
}

export const mockSessionsApi = {
  list: async (params: ListQueryParams & { student?: string; trainer?: string; type?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<MockSession>>('/mock-sessions', { params });
    return data;
  },
  create: async (payload: MockSessionPayload & { student: string }) => {
    const { data } = await apiClient.post<ApiResponse<MockSession>>('/mock-sessions', payload);
    return data.data;
  },
  listForStudent: async (studentId: string) => {
    const { data } = await apiClient.get<ApiResponse<MockSession[]>>(`/students/${studentId}/mock-sessions`);
    return data.data;
  },
  createForStudent: async (studentId: string, payload: MockSessionPayload) => {
    const { data } = await apiClient.post<ApiResponse<MockSession>>(
      `/students/${studentId}/mock-sessions`,
      payload,
    );
    return data.data;
  },
  update: async (id: string, payload: Partial<MockSessionPayload>) => {
    const { data } = await apiClient.patch<ApiResponse<MockSession>>(`/mock-sessions/${id}`, payload);
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/mock-sessions/${id}`);
  },
};
