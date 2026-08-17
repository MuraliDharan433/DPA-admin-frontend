'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Toolbar } from '@/components/ui/Toolbar';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { jobApplicationsApi } from '@/api/placements.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { humanizeEnum } from '@/utils/statusTones';
import type { JobApplication } from '@/types/placement.types';
import type { Student } from '@/types/academic.types';
import type { Company } from '@/types/placement.types';
import { ApplicationFormModal } from './ApplicationFormModal';

const STATUS_TONE: Record<string, 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'cyan'> = {
  APPLIED: 'cyan',
  SHORTLISTED: 'brand',
  INTERVIEW: 'warning',
  SELECTED: 'success',
  REJECTED: 'danger',
  OFFER_RECEIVED: 'success',
  JOINED: 'success',
};

export function ApplicationsPage() {
  const { can } = usePermission();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<JobApplication | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['applications', { page, status }],
    queryFn: () => jobApplicationsApi.list({ page, limit: 10, status: status || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobApplicationsApi.remove(id),
    onSuccess: () => {
      toast.success('Application deleted');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setDeleting(null);
    },
    onError: (err) => toast.error('Could not delete application', getErrorMessage(err)),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, s }: { id: string; s: string }) => jobApplicationsApi.update(id, { status: s }),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (err) => toast.error('Could not update status', getErrorMessage(err)),
  });

  const studentName = (s: Student | string) => (typeof s === 'string' ? '-' : `${s.firstName} ${s.lastName}`);
  const companyName = (c: Company | string) => (typeof c === 'string' ? '-' : c.name);

  const columns: Column<JobApplication>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (a) => <span className="font-medium text-ink">{studentName(a.student)}</span>,
    },
    { key: 'company', header: 'Company', render: (a) => companyName(a.company) },
    { key: 'jobTitle', header: 'Job Title', render: (a) => a.jobTitle, hideOnMobile: true },
    {
      key: 'applicationDate',
      header: 'Applied',
      render: (a) => format(new Date(a.applicationDate), 'dd MMM yyyy'),
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (a) =>
        can(PERMISSIONS.PLACEMENTS_EDIT) ? (
          <Select
            value={a.status}
            onChange={(e) => statusMutation.mutate({ id: a._id, s: e.target.value })}
            className="h-8 w-40 text-xs"
          >
            {Object.keys(STATUS_TONE).map((s) => (
              <option key={s} value={s}>{humanizeEnum(s)}</option>
            ))}
          </Select>
        ) : (
          <Badge tone={STATUS_TONE[a.status]}>{humanizeEnum(a.status)}</Badge>
        ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (a) =>
        can(PERMISSIONS.PLACEMENTS_DELETE) && (
          <button
            onClick={() => setDeleting(a)}
            className="rounded-lg p-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600"
            aria-label="Delete application"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Job Applications</h1>
        <p className="mt-1 text-sm text-ink/50">Track student applications through to offer.</p>
      </div>

      <Card>
        <Toolbar
          filters={
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-44">
              <option value="">All Status</option>
              {Object.keys(STATUS_TONE).map((s) => (
                <option key={s} value={s}>{humanizeEnum(s)}</option>
              ))}
            </Select>
          }
          actions={
            can(PERMISSIONS.PLACEMENTS_CREATE) && (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4" /> Add Application
              </Button>
            )
          }
        />
        <DataTable
          columns={columns}
          data={data?.data || []}
          getRowKey={(a) => a._id}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyTitle="No applications yet"
          emptyDescription="Add a job application to start tracking a student's placement journey."
          pagination={data?.pagination}
          onPageChange={setPage}
        />
      </Card>

      <ApplicationFormModal open={formOpen} onClose={() => setFormOpen(false)} />

      <ConfirmDialog
        open={!!deleting}
        title="Delete application?"
        description="This will permanently remove this job application."
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting._id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
