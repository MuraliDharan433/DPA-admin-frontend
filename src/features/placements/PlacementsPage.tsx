'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Toolbar } from '@/components/ui/Toolbar';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { studentsApi } from '@/api/students.api';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { PLACEMENT_STATUS_TONE, humanizeEnum } from '@/utils/statusTones';
import type { Student } from '@/types/academic.types';
import { PlacementEditModal } from './PlacementEditModal';

export function PlacementsPage() {
  const router = useRouter();
  const { can } = usePermission();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [placementStatus, setPlacementStatus] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Student | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['students', 'placements', { page, search: debouncedSearch, placementStatus }],
    queryFn: () =>
      studentsApi.list({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        placementStatus: placementStatus || undefined,
        sortBy: 'placementDate',
      }),
  });

  const columns: Column<Student>[] = [
    {
      key: 'name',
      header: 'Student',
      render: (s) => (
        <div>
          <p className="font-medium text-ink">{s.firstName} {s.lastName}</p>
          <p className="text-xs text-ink/45">{s.studentId}</p>
        </div>
      ),
    },
    {
      key: 'placementStatus',
      header: 'Status',
      render: (s) => <Badge tone={PLACEMENT_STATUS_TONE[s.placementStatus]}>{humanizeEnum(s.placementStatus)}</Badge>,
    },
    { key: 'currentCompany', header: 'Company', render: (s) => s.currentCompany || '-', hideOnMobile: true },
    { key: 'jobTitle', header: 'Job Title', render: (s) => s.jobTitle || '-', hideOnMobile: true },
    {
      key: 'package',
      header: 'Package',
      render: (s) => (s.package ? `₹${s.package.toLocaleString('en-IN')}` : '-'),
      hideOnMobile: true,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (s) =>
        can(PERMISSIONS.PLACEMENTS_EDIT) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditing(s);
            }}
            className="rounded-lg p-1.5 text-ink/40 hover:bg-black/[0.04] hover:text-ink/70"
            title="Edit Placement"
          >
            <Pencil className="h-4 w-4" />
          </button>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Placements</h1>
        <p className="mt-1 text-sm text-ink/50">Students who are job-seeking, interviewing, or placed.</p>
      </div>

      <Card>
        <Toolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search students..."
          filters={
            <Select
              value={placementStatus}
              onChange={(e) => {
                setPlacementStatus(e.target.value);
                setPage(1);
              }}
              className="w-48"
            >
              <option value="">All Placement Status</option>
              <option value="LOOKING_FOR_JOB">Looking for Job</option>
              <option value="INTERVIEWING">Interviewing</option>
              <option value="PLACED">Placed</option>
              <option value="NOT_PLACED">Not Placed</option>
            </Select>
          }
        />
        <DataTable
          columns={columns}
          data={data?.data || []}
          getRowKey={(s) => s._id}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          onRowClick={(s) => router.push(`/students/${s._id}`)}
          emptyTitle="No students found"
          emptyDescription="Students looking for jobs or placed will show up here."
          pagination={data?.pagination}
          onPageChange={setPage}
        />
      </Card>

      <PlacementEditModal open={!!editing} onClose={() => setEditing(null)} student={editing} />
    </div>
  );
}
