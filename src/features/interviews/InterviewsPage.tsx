'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Toolbar } from '@/components/ui/Toolbar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { interviewsApi } from '@/api/placements.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { humanizeEnum } from '@/utils/statusTones';
import type { Interview } from '@/types/placement.types';
import type { Student } from '@/types/academic.types';
import { InterviewFormModal } from './InterviewFormModal';

const STATUS_TONE: Record<string, 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'cyan'> = {
  SCHEDULED: 'cyan',
  COMPLETED: 'success',
  RESCHEDULED: 'warning',
  CANCELLED: 'neutral',
  NO_SHOW: 'danger',
};

const RESULT_TONE: Record<string, 'success' | 'danger' | 'neutral'> = {
  PENDING: 'neutral',
  SELECTED: 'success',
  REJECTED: 'danger',
};

export function InterviewsPage() {
  const { can } = usePermission();
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Interview | null>(null);
  const [deleting, setDeleting] = useState<Interview | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['interviews', { page }],
    queryFn: () => interviewsApi.list({ page, limit: 10 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => interviewsApi.remove(id),
    onSuccess: () => {
      toast.success('Interview deleted');
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      setDeleting(null);
    },
    onError: (err) => toast.error('Could not delete interview', getErrorMessage(err)),
  });

  const studentName = (s: Student | string) => (typeof s === 'string' ? '-' : `${s.firstName} ${s.lastName}`);

  const columns: Column<Interview>[] = [
    { key: 'student', header: 'Student', render: (i) => <span className="font-medium text-ink">{studentName(i.student)}</span> },
    { key: 'round', header: 'Round', render: (i) => i.round || '-' },
    {
      key: 'interviewDate',
      header: 'Date',
      render: (i) => format(new Date(i.interviewDate), 'dd MMM yyyy'),
      hideOnMobile: true,
    },
    { key: 'interviewer', header: 'Interviewer', render: (i) => i.interviewer || '-', hideOnMobile: true },
    {
      key: 'status',
      header: 'Status',
      render: (i) => <Badge tone={STATUS_TONE[i.status]}>{humanizeEnum(i.status)}</Badge>,
    },
    {
      key: 'result',
      header: 'Result',
      render: (i) => <Badge tone={RESULT_TONE[i.result]}>{humanizeEnum(i.result)}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (i) => (
        <div className="flex justify-end gap-1">
          {can(PERMISSIONS.PLACEMENTS_EDIT) && (
            <button
              onClick={() => setEditing(i)}
              className="rounded-lg p-1.5 text-ink/40 hover:bg-brand-50 hover:text-brand-600"
              aria-label="Edit interview"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {can(PERMISSIONS.PLACEMENTS_DELETE) && (
            <button
              onClick={() => setDeleting(i)}
              className="rounded-lg p-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete interview"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Interviews</h1>
        <p className="mt-1 text-sm text-ink/50">Interview rounds scheduled for placement candidates.</p>
      </div>

      <Card>
        <Toolbar
          actions={
            can(PERMISSIONS.PLACEMENTS_CREATE) && (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4" /> Schedule Interview
              </Button>
            )
          }
        />
        <DataTable
          columns={columns}
          data={data?.data || []}
          getRowKey={(i) => i._id}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyTitle="No interviews scheduled"
          emptyDescription="Schedule an interview round for a job application."
          pagination={data?.pagination}
          onPageChange={setPage}
        />
      </Card>

      <InterviewFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      <InterviewFormModal open={!!editing} onClose={() => setEditing(null)} interview={editing} />

      <ConfirmDialog
        open={!!deleting}
        title="Delete interview?"
        description="This will permanently remove this interview record."
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting._id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
