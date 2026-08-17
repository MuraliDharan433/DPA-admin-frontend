import { apiClient } from './client';
import type { ApiResponse, ListQueryParams, PaginatedResponse } from '@/types/common.types';

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  list: async (params: ListQueryParams) => {
    const { data } = await apiClient.get<PaginatedResponse<AppNotification>>('/notifications', { params });
    return data;
  },
  unreadCount: async () => {
    const { data } = await apiClient.get<ApiResponse<number>>('/notifications/unread-count');
    return data.data;
  },
  markAsRead: async (id: string) => {
    const { data } = await apiClient.patch<ApiResponse<AppNotification>>(`/notifications/${id}/read`);
    return data.data;
  },
  markAllAsRead: async () => {
    await apiClient.patch('/notifications/read-all');
  },
};
