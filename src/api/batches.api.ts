import { apiClient } from './client';
import type { ApiResponse, ListQueryParams, PaginatedResponse } from '@/types/common.types';
import type { Batch } from '@/types/academic.types';

export interface BatchPayload {
  name: string;
  course: string;
  trainer?: string;
  startDate: string;
  endDate: string;
  timing?: string;
  capacity: number;
  status?: string;
}

export const batchesApi = {
  list: async (params: ListQueryParams) => {
    const { data } = await apiClient.get<PaginatedResponse<Batch>>('/batches', { params });
    return data;
  },
  listActive: async () => {
    const { data } = await apiClient.get<ApiResponse<Batch[]>>('/batches/active');
    return data.data;
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<Batch>>(`/batches/${id}`);
    return data.data;
  },
  create: async (payload: BatchPayload) => {
    const { data } = await apiClient.post<ApiResponse<Batch>>('/batches', payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<BatchPayload>) => {
    const { data } = await apiClient.patch<ApiResponse<Batch>>(`/batches/${id}`, payload);
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/batches/${id}`);
  },
};
