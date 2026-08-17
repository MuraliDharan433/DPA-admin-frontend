import { apiClient } from './client';
import type { ApiResponse, ListQueryParams, PaginatedResponse } from '@/types/common.types';
import type { Company, Interview, JobApplication, Resume } from '@/types/placement.types';

export interface CompanyPayload {
  name: string;
  website?: string;
  industry?: string;
  location?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
}

export interface JobApplicationPayload {
  student: string;
  company: string;
  jobTitle: string;
  package?: number;
  applicationDate: string;
  status?: string;
  offerDate?: string;
  joiningDate?: string;
  notes?: string;
}

export interface InterviewPayload {
  application: string;
  student: string;
  interviewDate: string;
  round?: string;
  status?: string;
  result?: string;
  interviewer?: string;
  feedback?: string;
}

export const companiesApi = {
  list: async (params: ListQueryParams) => {
    const { data } = await apiClient.get<PaginatedResponse<Company>>('/companies', { params });
    return data;
  },
  listLite: async () => {
    const { data } = await apiClient.get<ApiResponse<Company[]>>('/companies/lite');
    return data.data;
  },
  create: async (payload: CompanyPayload) => {
    const { data } = await apiClient.post<ApiResponse<Company>>('/companies', payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<CompanyPayload>) => {
    const { data } = await apiClient.patch<ApiResponse<Company>>(`/companies/${id}`, payload);
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/companies/${id}`);
  },
};

export const jobApplicationsApi = {
  list: async (params: ListQueryParams) => {
    const { data } = await apiClient.get<PaginatedResponse<JobApplication>>('/applications', { params });
    return data;
  },
  create: async (payload: JobApplicationPayload) => {
    const { data } = await apiClient.post<ApiResponse<JobApplication>>('/applications', payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<JobApplicationPayload>) => {
    const { data } = await apiClient.patch<ApiResponse<JobApplication>>(`/applications/${id}`, payload);
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/applications/${id}`);
  },
};

export const interviewsApi = {
  list: async (params: ListQueryParams) => {
    const { data } = await apiClient.get<PaginatedResponse<Interview>>('/interviews', { params });
    return data;
  },
  create: async (payload: InterviewPayload) => {
    const { data } = await apiClient.post<ApiResponse<Interview>>('/interviews', payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<InterviewPayload>) => {
    const { data } = await apiClient.patch<ApiResponse<Interview>>(`/interviews/${id}`, payload);
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/interviews/${id}`);
  },
};

export const resumesApi = {
  listVersions: async (studentId: string) => {
    const { data } = await apiClient.get<ApiResponse<Resume[]>>(`/students/${studentId}/resumes`);
    return data.data;
  },
  upload: async (studentId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<ApiResponse<Resume>>(
      `/students/${studentId}/resumes`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/resumes/${id}`);
  },
  /** Auth is required for file bytes, so we fetch as a blob rather than linking a raw URL. */
  fetchBlobUrl: async (id: string, download: boolean) => {
    const { data } = await apiClient.get(`/resumes/${id}/file`, {
      params: download ? { download: 'true' } : undefined,
      responseType: 'blob',
    });
    return URL.createObjectURL(data as Blob);
  },
};
