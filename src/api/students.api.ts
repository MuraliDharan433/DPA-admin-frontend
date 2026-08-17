import { apiClient } from './client';
import type { ApiResponse, ListQueryParams, PaginatedResponse } from '@/types/common.types';
import type { Student } from '@/types/academic.types';

export type StudentPayload = Partial<
  Omit<
    Student,
    '_id' | 'studentId' | 'notes' | 'createdAt' | 'course' | 'batch' | 'completedModules' | 'feePayments'
  >
> & {
  course: string;
  batch?: string;
  /** Desired set of completed class names; the server keeps each one's original completion date. */
  completedModules?: string[];
};

export interface FeePaymentPayload {
  amount: number;
  term?: string;
  account?: string;
  paymentDate: string;
  notes?: string;
}

export const studentsApi = {
  list: async (params: ListQueryParams) => {
    const { data } = await apiClient.get<PaginatedResponse<Student>>('/students', { params });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<Student>>(`/students/${id}`);
    return data.data;
  },
  create: async (payload: StudentPayload) => {
    const { data } = await apiClient.post<ApiResponse<Student>>('/students', payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<StudentPayload>) => {
    const { data } = await apiClient.patch<ApiResponse<Student>>(`/students/${id}`, payload);
    return data.data;
  },
  addNote: async (id: string, text: string) => {
    const { data } = await apiClient.post<ApiResponse<Student>>(`/students/${id}/notes`, { text });
    return data.data;
  },
  addFeePayment: async (id: string, payload: FeePaymentPayload) => {
    const { data } = await apiClient.post<ApiResponse<Student>>(`/students/${id}/fee-payments`, payload);
    return data.data;
  },
  removeFeePayment: async (id: string, paymentId: string) => {
    const { data } = await apiClient.delete<ApiResponse<Student>>(
      `/students/${id}/fee-payments/${paymentId}`,
    );
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/students/${id}`);
  },
};
