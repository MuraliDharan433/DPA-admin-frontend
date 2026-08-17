import { apiClient } from './client';
import type { ApiResponse } from '@/types/common.types';

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  activeCourses: number;
  activeBatches: number;
  studentsLookingForJobs: number;
  placedStudents: number;
  newEnquiries: number | null;
  pendingFollowUps: number | null;
}

export interface DashboardCharts {
  studentEnrollmentTrend: { label: string; count: number }[];
  courseWiseStudents: { course: string; count: number }[];
  placementStatistics: { status: string; count: number }[];
  enquiryConversion: { status: string; count: number }[] | null;
  monthlyEnquiries: { label: string; count: number }[] | null;
}

export interface ActivityEvent {
  type: string;
  message: string;
  timestamp: string;
}

export const dashboardApi = {
  stats: async () => {
    const { data } = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return data.data;
  },
  charts: async () => {
    const { data } = await apiClient.get<ApiResponse<DashboardCharts>>('/dashboard/charts');
    return data.data;
  },
  recentActivity: async () => {
    const { data } = await apiClient.get<ApiResponse<ActivityEvent[]>>('/dashboard/recent-activity');
    return data.data;
  },
};
