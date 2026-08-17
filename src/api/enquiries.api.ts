import { apiClient } from './client';
import type { ApiResponse, ListQueryParams, PaginatedResponse } from '@/types/common.types';
import type { Enquiry, FollowUp } from '@/types/enquiry.types';

export interface EnquiryPayload {
  name: string;
  email: string;
  mobile: string;
  course?: string;
  message?: string;
  source?: string;
  status?: string;
}

export interface FollowUpPayload {
  followUpDate: string;
  followUpTime?: string;
  notes?: string;
  status?: string;
  assignedUser: string;
}

export const enquiriesApi = {
  list: async (params: ListQueryParams) => {
    const { data } = await apiClient.get<PaginatedResponse<Enquiry>>('/enquiries', { params });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<Enquiry>>(`/enquiries/${id}`);
    return data.data;
  },
  create: async (payload: EnquiryPayload) => {
    const { data } = await apiClient.post<ApiResponse<Enquiry>>('/enquiries', payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<EnquiryPayload>) => {
    const { data } = await apiClient.patch<ApiResponse<Enquiry>>(`/enquiries/${id}`, payload);
    return data.data;
  },
  updateStatus: async (id: string, status: string) => {
    const { data } = await apiClient.patch<ApiResponse<Enquiry>>(`/enquiries/${id}/status`, { status });
    return data.data;
  },
  assign: async (id: string, assignedTo: string) => {
    const { data } = await apiClient.patch<ApiResponse<Enquiry>>(`/enquiries/${id}/assign`, { assignedTo });
    return data.data;
  },
  convert: async (id: string, course: string, batch?: string) => {
    const { data } = await apiClient.post<ApiResponse<{ enquiry: Enquiry; studentId: string }>>(
      `/enquiries/${id}/convert`,
      { course, batch },
    );
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/enquiries/${id}`);
  },
  listFollowUps: async (enquiryId: string) => {
    const { data } = await apiClient.get<ApiResponse<FollowUp[]>>(`/enquiries/${enquiryId}/follow-ups`);
    return data.data;
  },
  addFollowUp: async (enquiryId: string, payload: FollowUpPayload) => {
    const { data } = await apiClient.post<ApiResponse<FollowUp>>(
      `/enquiries/${enquiryId}/follow-ups`,
      payload,
    );
    return data.data;
  },
};

export const followUpsApi = {
  list: async (params: ListQueryParams & { scope?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<FollowUp>>('/follow-ups', { params });
    return data;
  },
  update: async (id: string, payload: Partial<FollowUpPayload>) => {
    const { data } = await apiClient.patch<ApiResponse<FollowUp>>(`/follow-ups/${id}`, payload);
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/follow-ups/${id}`);
  },
};
