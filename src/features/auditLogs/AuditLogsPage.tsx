'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Toolbar } from '@/components/ui/Toolbar';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { auditLogsApi, type AuditLogEntry } from '@/api/auditLogs.api';
import { humanizeEnum } from '@/utils/statusTones';

const ACTIONS = [
  'LOGIN', 'LOGOUT', 'USER_CREATED', 'USER_UPDATED', 'USER_ACTIVATED', 'USER_DEACTIVATED', 'USER_DELETED',
  'PERMISSION_CHANGED', 'PASSWORD_RESET', 'STUDENT_CREATED', 'STUDENT_UPDATED', 'STUDENT_DELETED',
  'RESUME_UPLOADED', 'RESUME_DELETED', 'ENQUIRY_CREATED', 'ENQUIRY_UPDATED', 'ENQUIRY_ASSIGNED',
  'ENQUIRY_DELETED', 'PLACEMENT_UPDATED', 'COURSE_CREATED', 'COURSE_UPDATED', 'COURSE_DELETED',
  'BATCH_CREATED', 'BATCH_UPDATED', 'BATCH_DELETED',
];

const MODULE_TONE: Record<string, 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'cyan'> = {
  auth: 'cyan',
  users: 'brand',
  students: 'success',
  enquiries: 'warning',
  resumes: 'neutral',
  placements: 'danger',
  courses: 'brand',
  batches: 'brand',
};

export function AuditLogsPage() {
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['audit-logs', { page, action }],
    queryFn: () => auditLogsApi.list({ page, limit: 15, action: action || undefined }),
  });

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'user',
      header: 'User',
      render: (e) => (e.user ? `${e.user.firstName} ${e.user.lastName}` : 'System / Public'),
    },
    { key: 'action', header: 'Action', render: (e) => humanizeEnum(e.action) },
    {
      key: 'module',
      header: 'Module',
      render: (e) => <Badge tone={MODULE_TONE[e.module] || 'neutral'}>{e.module}</Badge>,
      hideOnMobile: true,
    },
    { key: 'recordId', header: 'Record', render: (e) => e.recordId || '-', hideOnMobile: true },
    { key: 'ipAddress', header: 'IP Address', render: (e) => e.ipAddress || '-', hideOnMobile: true },
    {
      key: 'createdAt',
      header: 'When',
      render: (e) => format(new Date(e.createdAt), 'dd MMM yyyy, h:mm a'),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Audit Logs</h1>
        <p className="mt-1 text-sm text-ink/50">A record of important actions taken across the system.</p>
      </div>

      <Card>
        <Toolbar
          filters={
            <Select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} className="w-56">
              <option value="">All Actions</option>
              {ACTIONS.map((a) => (
                <option key={a} value={a}>{humanizeEnum(a)}</option>
              ))}
            </Select>
          }
        />
        <DataTable
          columns={columns}
          data={data?.data || []}
          getRowKey={(e) => e._id}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyTitle="No audit log entries"
          emptyDescription="Actions taken across the system will appear here."
          pagination={data?.pagination}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
