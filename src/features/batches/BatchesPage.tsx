'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Toolbar } from '@/components/ui/Toolbar';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { batchesApi } from '@/api/batches.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import { usePermission } from '@/hooks/usePermission';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { PERMISSIONS } from '@/constants/permissions';
import { BATCH_STATUS_TONE, humanizeEnum } from '@/utils/statusTones';
import type { Batch, Course } from '@/types/academic.types';
import { BatchFormModal } from './BatchFormModal';

export function BatchesPage() {
  const { can } = usePermission();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Batch | null>(null);
  const [deleting, setDeleting] = useState<Batch | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['batches', { page, search: debouncedSearch, status }],
    queryFn: () =>
      batchesApi.list({ page, limit: 10, search: debouncedSearch || undefined, status: status || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => batchesApi.remove(id),
    onSuccess: () => {
      toast.success('Batch deleted');
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setDeleting(null);
    },
    onError: (err) => toast.error('Could not delete batch', getErrorMessage(err)),
  });

  const courseName = (course: Course | string) => (typeof course === 'string' ? '-' : course.name);

  const columns: Column<Batch>[] = [
    {
      key: 'name',
      header: 'Batch',
      render: (b) => (
        <div>
          <p className="font-medium text-ink">{b.name}</p>
          <p className="text-xs text-ink/45">{courseName(b.course)}</p>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Schedule',
      hideOnMobile: true,
      render: (b) => (
        <span className="text-xs">
          {format(new Date(b.startDate), 'dd MMM yyyy')} - {format(new Date(b.endDate), 'dd MMM yyyy')}
        </span>
      ),
    },
    { key: 'capacity', header: 'Capacity', render: (b) => b.capacity, hideOnMobile: true },
    {
      key: 'status',
      header: 'Status',
      render: (b) => <Badge tone={BATCH_STATUS_TONE[b.status]}>{humanizeEnum(b.status)}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (b) => (
        <div className="flex justify-end gap-1">
          {can(PERMISSIONS.BATCHES_EDIT) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(b);
                setFormOpen(true);
              }}
              className="rounded-lg p-1.5 text-ink/40 hover:bg-black/[0.04] hover:text-ink/70"
              aria-label="Edit batch"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {can(PERMISSIONS.BATCHES_DELETE) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleting(b);
              }}
              className="rounded-lg p-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete batch"
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
        <h1 className="font-display text-xl font-semibold text-ink">Batches</h1>
        <p className="mt-1 text-sm text-ink/50">Schedule and manage training batches.</p>
      </div>

      <Card>
        <Toolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search batches..."
          filters={
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-40"
            >
              <option value="">All Status</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          }
          actions={
            can(PERMISSIONS.BATCHES_CREATE) && (
              <Button
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Add Batch
              </Button>
            )
          }
        />
        <DataTable
          columns={columns}
          data={data?.data || []}
          getRowKey={(b) => b._id}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          onRowClick={(b) => router.push(`/batches/${b._id}`)}
          emptyTitle="No batches found"
          emptyDescription="Create a batch to start scheduling students."
          pagination={data?.pagination}
          onPageChange={setPage}
        />
      </Card>

      <BatchFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        batch={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete batch?"
        description={`"${deleting?.name}" will be permanently removed.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting._id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
