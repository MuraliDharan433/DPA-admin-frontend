import { apiClient } from './client';
import type { ListQueryParams, PaginatedResponse } from '@/types/common.types';

export interface AuditLogEntry {
  _id: string;
  user?: { _id: string; firstName: string; lastName: string; email: string };
  action: string;
  module: string;
  recordId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export const auditLogsApi = {
  list: async (params: ListQueryParams & { action?: string; module?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<AuditLogEntry>>('/audit-logs', { params });
    return data;
  },
};
