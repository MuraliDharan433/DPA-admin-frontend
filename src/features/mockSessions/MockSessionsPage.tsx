'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Star, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Toolbar } from '@/components/ui/Toolbar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { mockSessionsApi } from '@/api/mockSessions.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { cn } from '@/utils/cn';
import type { MockSession } from '@/types/placement.types';
import type { Student } from '@/types/academic.types';
import type { UserRef } from '@/types/enquiry.types';
import { MockSessionFormModal } from './MockSessionFormModal';
import { MockSessionDetailModal } from './MockSessionDetailModal';

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} aria-hidden className={cn('h-3.5 w-3.5', n <= value ? 'fill-amber-400 text-amber-400' : 'text-black/15')} />
      ))}
    </div>
  );
}

export function MockSessionsPage() {
  const { can } = usePermission();
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<MockSession | null>(null);
  const [viewing, setViewing] = useState<MockSession | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['mock-sessions', { page }],
    queryFn: () => mockSessionsApi.list({ page, limit: 10 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mockSessionsApi.remove(id),
    onSuccess: () => {
      toast.success('Mock session deleted');
      queryClient.invalidateQueries({ queryKey: ['mock-sessions'] });
      setDeleting(null);
    },
    onError: (err) => toast.error('Could not delete mock session', getErrorMessage(err)),
  });

  const studentInfo = (s: Student | string) => (typeof s === 'string' ? null : s);
  const trainerName = (t: UserRef | string) => (typeof t === 'string' ? '-' : `${t.firstName} ${t.lastName}`);

  const columns: Column<MockSession>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (m) => {
        const s = studentInfo(m.student);
        return s ? (
          <span className="font-medium text-ink">{s.firstName} {s.lastName}</span>
        ) : (
          <span className="text-ink/40">-</span>
        );
      },
    },
    {
      key: 'type',
      header: 'Type',
      render: (m) => <Badge tone={m.type === 'MOCK_INTERVIEW' ? 'brand' : 'cyan'}>{m.type === 'MOCK_INTERVIEW' ? 'Mock Interview' : 'Mock Test'}</Badge>,
    },
    { key: 'date', header: 'Session Date', render: (m) => format(new Date(m.date), 'dd MMM yyyy'), hideOnMobile: true },
    { key: 'trainer', header: 'Trainer', render: (m) => trainerName(m.trainer), hideOnMobile: true },
    { key: 'rating', header: 'Rating', render: (m) => <StarRating value={m.rating} /> },
    {
      key: 'createdAt',
      header: 'Created',
      render: (m) => <span className="text-xs text-ink/50">{format(new Date(m.createdAt), 'dd MMM yyyy')}</span>,
      hideOnMobile: true,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (m) =>
        can(PERMISSIONS.MOCK_DELETE) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleting(m);
            }}
            className="rounded-lg p-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600"
            aria-label="Delete mock session"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Mock Sessions</h1>
        <p className="mt-1 text-sm text-ink/50">Mock interviews and tests logged across all students.</p>
      </div>

      <Card>
        <Toolbar
          actions={
            can(PERMISSIONS.MOCK_CREATE) && (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4" /> Add Mock Session
              </Button>
            )
          }
        />
        <DataTable
          columns={columns}
          data={data?.data || []}
          getRowKey={(m) => m._id}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          onRowClick={(m) => setViewing(m)}
          emptyTitle="No mock sessions yet"
          emptyDescription="Log a mock interview or test to see it appear here."
          pagination={data?.pagination}
          onPageChange={setPage}
        />
      </Card>

      <MockSessionFormModal open={formOpen} onClose={() => setFormOpen(false)} />

      <MockSessionDetailModal open={!!viewing} onClose={() => setViewing(null)} session={viewing} />

      <ConfirmDialog
        open={!!deleting}
        title="Delete mock session?"
        description="This will permanently remove this mock session record."
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting._id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
