'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import {
  GraduationCap,
  UserCheck,
  Inbox,
  Clock,
  BookOpen,
  CalendarRange,
  Briefcase,
  Award,
  UserPlus,
  FileText,
  UsersRound,
} from 'lucide-react';
import type { ElementType, ReactNode } from 'react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/auth.store';
import { dashboardApi } from '@/api/dashboard.api';
import { humanizeEnum } from '@/utils/statusTones';

const CHART_COLORS = ['#3b6ee5', '#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: number | null | undefined;
}) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50">
          <Icon className="h-5 w-5 text-brand-500" />
        </div>
        <div>
          <p className="text-xs font-medium text-ink/45">{label}</p>
          <p className="font-display text-xl font-semibold text-ink">
            {value === null || value === undefined ? '-' : value}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

const ACTIVITY_ICON: Record<string, ElementType> = {
  STUDENT_ADDED: UserPlus,
  NEW_ENQUIRY: Inbox,
  RESUME_UPLOADED: FileText,
  STUDENT_PLACED: Award,
  USER_CREATED: UsersRound,
};

export function DashboardPage(): ReactNode {
  const user = useAuthStore((s) => s.user);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.stats,
  });
  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ['dashboard', 'charts'],
    queryFn: dashboardApi.charts,
  });
  const { data: activity } = useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: dashboardApi.recentActivity,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">
          Welcome back{user ? `, ${user.firstName}` : ''}
        </h1>
        <p className="mt-1 text-sm text-ink/50">Here&apos;s what&apos;s happening at your institute.</p>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard icon={GraduationCap} label="Total Students" value={stats?.totalStudents} />
          <StatCard icon={UserCheck} label="Active Students" value={stats?.activeStudents} />
          <StatCard icon={Inbox} label="New Enquiries" value={stats?.newEnquiries} />
          <StatCard icon={Clock} label="Pending Follow-ups" value={stats?.pendingFollowUps} />
          <StatCard icon={BookOpen} label="Active Courses" value={stats?.activeCourses} />
          <StatCard icon={CalendarRange} label="Active Batches" value={stats?.activeBatches} />
          <StatCard icon={Briefcase} label="Looking for Jobs" value={stats?.studentsLookingForJobs} />
          <StatCard icon={Award} label="Placed Students" value={stats?.placedStudents} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Student Enrollment Trend</CardTitle></CardHeader>
          <CardBody className="h-64">
            {chartsLoading ? (
              <Skeleton className="h-full w-full" />
            ) : !charts?.studentEnrollmentTrend.length ? (
              <EmptyState title="No enrollment data yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.studentEnrollmentTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0a192f0d" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#0f172a66" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#0f172a66" />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#1b4ed8" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Course-wise Students</CardTitle></CardHeader>
          <CardBody className="h-64">
            {chartsLoading ? (
              <Skeleton className="h-full w-full" />
            ) : !charts?.courseWiseStudents.length ? (
              <EmptyState title="No students enrolled yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.courseWiseStudents} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0a192f0d" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="#0f172a66" />
                  <YAxis type="category" dataKey="course" width={100} tick={{ fontSize: 11 }} stroke="#0f172a66" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b6ee5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Placement Statistics</CardTitle></CardHeader>
          <CardBody className="h-64">
            {chartsLoading ? (
              <Skeleton className="h-full w-full" />
            ) : !charts?.placementStatistics.length ? (
              <EmptyState title="No placement data yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.placementStatistics}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {charts.placementStatistics.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, _n, p) => [v, humanizeEnum(String(p.payload.status))]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Enquiry Conversion</CardTitle></CardHeader>
          <CardBody className="h-64">
            {chartsLoading ? (
              <Skeleton className="h-full w-full" />
            ) : !charts?.enquiryConversion?.length ? (
              <EmptyState
                title={charts?.enquiryConversion === null ? 'Not visible to your role' : 'No enquiry data yet'}
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.enquiryConversion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0a192f0d" />
                  <XAxis
                    dataKey="status"
                    tickFormatter={(v) => humanizeEnum(v)}
                    tick={{ fontSize: 10 }}
                    stroke="#0f172a66"
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#0f172a66" />
                  <Tooltip labelFormatter={(v) => humanizeEnum(String(v))} />
                  <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardBody>
          {!activity?.length ? (
            <EmptyState title="No recent activity" description="Activity will appear here as your team works." />
          ) : (
            <div className="space-y-1">
              {activity.map((event, i) => {
                const Icon = ACTIVITY_ICON[event.type] || Inbox;
                return (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50">
                      <Icon className="h-4 w-4 text-brand-500" />
                    </div>
                    <p className="flex-1 text-sm text-ink/80">{event.message}</p>
                    <p className="shrink-0 text-xs text-ink/35">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
