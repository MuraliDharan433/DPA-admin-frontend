'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Toolbar } from '@/components/ui/Toolbar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { enquiriesApi } from '@/api/enquiries.api';
import { usersApi } from '@/api/users.api';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { ENQUIRY_STATUS_TONE, ENQUIRY_SOURCE_TONE, humanizeEnum } from '@/utils/statusTones';
import { cn } from '@/utils/cn';
import type { Enquiry, EnquiryStatus, UserRef } from '@/types/enquiry.types';
import { EnquiryFormModal } from './EnquiryFormModal';

const SOURCES = ['WEBSITE', 'WALK_IN', 'PHONE', 'REFERRAL', 'SOCIAL_MEDIA', 'OTHER'];

const STATUS_TABS: { label: string; value: EnquiryStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'New', value: 'NEW' },
  { label: 'Contacted', value: 'CONTACTED' },
  { label: 'Follow Up', value: 'FOLLOW_UP' },
  { label: 'Interested', value: 'INTERESTED' },
  { label: 'Not Interested', value: 'NOT_INTERESTED' },
  { label: 'Converted', value: 'CONVERTED' },
  { label: 'Lost', value: 'LOST' },
];

export function EnquiriesListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { can } = usePermission();
  const status = (searchParams.get('status') as EnquiryStatus | null) || '';
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [source, setSource] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['enquiries', { page, search: debouncedSearch, status, source, assignedTo }],
    queryFn: () =>
      enquiriesApi.list({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        status: status || undefined,
        source: source || undefined,
        assignedTo: assignedTo || undefined,
      }),
  });

  const { data: assignees } = useQuery({
    queryKey: ['users', 'lookup', 'COUNSELOR,ADMIN'],
    queryFn: () => usersApi.lookup('COUNSELOR,ADMIN'),
    enabled: can(PERMISSIONS.ENQUIRIES_ASSIGN),
  });

  const setStatus = (value: string) => {
    setPage(1);
    router.push(value ? `/enquiries?status=${value}` : '/enquiries');
  };

  const assignedName = (assignedTo?: UserRef | string) => {
    if (!assignedTo) return <span className="text-ink/30">Unassigned</span>;
    if (typeof assignedTo === 'string') return '-';
    return `${assignedTo.firstName} ${assignedTo.lastName}`;
  };

  const columns: Column<Enquiry>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (e) => (
        <div>
          <p className="font-medium text-ink">{e.name}</p>
          <p className="text-xs text-ink/45">{e.email}</p>
        </div>
      ),
    },
    { key: 'mobile', header: 'Mobile', render: (e) => e.mobile, hideOnMobile: true },
    { key: 'course', header: 'Course', render: (e) => e.course || '-', hideOnMobile: true },
    {
      key: 'source',
      header: 'How They Found Us',
      render: (e) => <Badge tone={ENQUIRY_SOURCE_TONE[e.source]}>{humanizeEnum(e.source)}</Badge>,
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (e) => <Badge tone={ENQUIRY_STATUS_TONE[e.status]}>{humanizeEnum(e.status)}</Badge>,
    },
    { key: 'assignedTo', header: 'Assigned To', render: (e) => assignedName(e.assignedTo), hideOnMobile: true },
    {
      key: 'createdAt',
      header: 'Received',
      render: (e) => format(new Date(e.createdAt), 'dd MMM yyyy'),
      hideOnMobile: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Enquiries</h1>
          <p className="mt-1 text-sm text-ink/50">Track and follow up on leads from your website and walk-ins.</p>
        </div>
        {can(PERMISSIONS.ENQUIRIES_CREATE) && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> Add Enquiry
          </Button>
        )}
      </div>

      <div className="scrollbar-thin flex gap-1 overflow-x-auto">
        {STATUS_TABS.map((t) => (
          <button
            key={t.label}
            onClick={() => setStatus(t.value)}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              status === t.value ? 'bg-brand-600 text-white' : 'bg-white text-ink/60 hover:bg-black/[0.04]',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        <Toolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search by name, email, mobile..."
          filters={
            <>
              <Select
                value={source}
                onChange={(e) => {
                  setSource(e.target.value);
                  setPage(1);
                }}
                className="w-44"
              >
                <option value="">All Sources</option>
                {SOURCES.map((s) => (
                  <option key={s} value={s}>{humanizeEnum(s)}</option>
                ))}
              </Select>
              {can(PERMISSIONS.ENQUIRIES_ASSIGN) && (
                <Select
                  value={assignedTo}
                  onChange={(e) => {
                    setAssignedTo(e.target.value);
                    setPage(1);
                  }}
                  className="w-44"
                >
                  <option value="">All Assignees</option>
                  {assignees?.map((a) => (
                    <option key={a._id} value={a._id}>{a.firstName} {a.lastName}</option>
                  ))}
                </Select>
              )}
            </>
          }
        />
        <DataTable
          columns={columns}
          data={data?.data || []}
          getRowKey={(e) => e._id}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          onRowClick={(e) => router.push(`/enquiries/${e._id}`)}
          emptyTitle="No enquiries found"
          emptyDescription="New enquiries from your website will show up here."
          pagination={data?.pagination}
          onPageChange={setPage}
        />
      </Card>

      <EnquiryFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
