import { apiClient } from './client';
import type { ApiResponse, ListQueryParams, PaginatedResponse } from '@/types/common.types';
import type { Course } from '@/types/academic.types';

export interface CoursePayload {
  name: string;
  code: string;
  description?: string;
  duration: string;
  fee: number;
  mode: string;
  status?: string;
  modules?: string[];
}

export const coursesApi = {
  list: async (params: ListQueryParams) => {
    const { data } = await apiClient.get<PaginatedResponse<Course>>('/courses', { params });
    return data;
  },
  listActive: async () => {
    const { data } = await apiClient.get<ApiResponse<Course[]>>('/courses/active');
    return data.data;
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<Course>>(`/courses/${id}`);
    return data.data;
  },
  create: async (payload: CoursePayload) => {
    const { data } = await apiClient.post<ApiResponse<Course>>('/courses', payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<CoursePayload>) => {
    const { data } = await apiClient.patch<ApiResponse<Course>>(`/courses/${id}`, payload);
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/courses/${id}`);
  },
};
