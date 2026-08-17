'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { followUpsApi } from '@/api/enquiries.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import { cn } from '@/utils/cn';
import { humanizeEnum } from '@/utils/statusTones';
import type { Enquiry, FollowUp, UserRef } from '@/types/enquiry.types';

const SCOPES = [
  { label: 'Today', value: 'today' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'All', value: '' },
];

export function FollowUpsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [scope, setScope] = useState('today');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['follow-ups', { scope, page }],
    queryFn: () => followUpsApi.list({ page, limit: 10, scope: scope || undefined }),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => followUpsApi.update(id, { status: 'COMPLETED' }),
    onSuccess: () => {
      toast.success('Marked as completed');
      queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
    },
    onError: (err) => toast.error('Could not update follow-up', getErrorMessage(err)),
  });

  const nameOf = (v?: UserRef | Enquiry | string) => {
    if (!v) return '-';
    if (typeof v === 'string') return '-';
    if ('firstName' in v) return `${v.firstName} ${v.lastName}`;
    return v.name;
  };

  const columns: Column<FollowUp>[] = [
    {
      key: 'enquiry',
      header: 'Enquiry',
      render: (f) => (
        <button
          className="font-medium text-brand-700 hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            const enq = f.enquiry;
            if (typeof enq !== 'string') router.push(`/enquiries/${enq._id}`);
          }}
        >
          {nameOf(f.enquiry)}
        </button>
      ),
    },
    {
      key: 'date',
      header: 'Scheduled',
      render: (f) => (
        <span>
          {format(new Date(f.followUpDate), 'dd MMM yyyy')} {f.followUpTime}
        </span>
      ),
    },
    { key: 'assignedUser', header: 'Assigned To', render: (f) => nameOf(f.assignedUser), hideOnMobile: true },
    { key: 'notes', header: 'Notes', render: (f) => f.notes || '-', hideOnMobile: true },
    {
      key: 'status',
      header: 'Status',
      render: (f) => <Badge tone={f.status === 'COMPLETED' ? 'success' : 'warning'}>{humanizeEnum(f.status)}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (f) =>
        f.status === 'PENDING' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              completeMutation.mutate(f._id);
            }}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-success hover:bg-success/10"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Mark Done
          </button>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Follow-ups</h1>
        <p className="mt-1 text-sm text-ink/50">Stay on top of scheduled enquiry follow-ups.</p>
      </div>

      <div className="flex gap-1">
        {SCOPES.map((s) => (
          <button
            key={s.label}
            onClick={() => {
              setScope(s.value);
              setPage(1);
            }}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              scope === s.value ? 'bg-brand-600 text-white' : 'bg-white text-ink/60 hover:bg-black/[0.04]',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={data?.data || []}
          getRowKey={(f) => f._id}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyTitle="No follow-ups here"
          emptyDescription="You're all caught up."
          pagination={data?.pagination}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
