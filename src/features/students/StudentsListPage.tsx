'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Toolbar } from '@/components/ui/Toolbar';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { studentsApi } from '@/api/students.api';
import { coursesApi } from '@/api/courses.api';
import { batchesApi } from '@/api/batches.api';
import { usePermission } from '@/hooks/usePermission';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { PERMISSIONS } from '@/constants/permissions';
import { TRAINING_STATUS_TONE, PLACEMENT_STATUS_TONE, humanizeEnum } from '@/utils/statusTones';
import type { Course, Student } from '@/types/academic.types';

export function StudentsListPage() {
  const { can } = usePermission();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [trainingStatus, setTrainingStatus] = useState('');
  const [placementStatus, setPlacementStatus] = useState('');
  const [course, setCourse] = useState('');
  const [batch, setBatch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['students', { page, search: debouncedSearch, trainingStatus, placementStatus, course, batch }],
    queryFn: () =>
      studentsApi.list({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        trainingStatus: trainingStatus || undefined,
        placementStatus: placementStatus || undefined,
        course: course || undefined,
        batch: batch || undefined,
      }),
  });

  const { data: courses } = useQuery({ queryKey: ['courses', 'active'], queryFn: coursesApi.listActive });
  const { data: batches } = useQuery({ queryKey: ['batches', 'active'], queryFn: batchesApi.listActive });
  const batchOptions = course ? (batches || []).filter((b) => (typeof b.course === 'string' ? b.course : b.course._id) === course) : batches;

  const courseName = (course: Course | string) => (typeof course === 'string' ? '-' : course.name);

  const columns: Column<Student>[] = [
    {
      key: 'name',
      header: 'Student',
      render: (s) => (
        <div>
          <p className="font-medium text-ink">
            {s.firstName} {s.lastName}
          </p>
          <p className="text-xs text-ink/45">{s.studentId}</p>
        </div>
      ),
    },
    { key: 'course', header: 'Course', render: (s) => courseName(s.course), hideOnMobile: true },
    { key: 'mobile', header: 'Mobile', render: (s) => s.mobile, hideOnMobile: true },
    {
      key: 'trainingStatus',
      header: 'Training',
      render: (s) => (
        <Badge tone={TRAINING_STATUS_TONE[s.trainingStatus]}>{humanizeEnum(s.trainingStatus)}</Badge>
      ),
    },
    {
      key: 'placementStatus',
      header: 'Placement',
      render: (s) => (
        <Badge tone={PLACEMENT_STATUS_TONE[s.placementStatus]}>{humanizeEnum(s.placementStatus)}</Badge>
      ),
      hideOnMobile: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Students</h1>
          <p className="mt-1 text-sm text-ink/50">Manage enrolled and prospective students.</p>
        </div>
      </div>

      <Card>
        <Toolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search by name, email, mobile, ID..."
          filters={
            <>
              <Select
                value={course}
                onChange={(e) => {
                  setCourse(e.target.value);
                  setBatch('');
                  setPage(1);
                }}
                className="w-44"
              >
                <option value="">All Courses</option>
                {courses?.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </Select>
              <Select
                value={batch}
                onChange={(e) => {
                  setBatch(e.target.value);
                  setPage(1);
                }}
                className="w-44"
              >
                <option value="">All Batches</option>
                {batchOptions?.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </Select>
              <Select
                value={trainingStatus}
                onChange={(e) => {
                  setTrainingStatus(e.target.value);
                  setPage(1);
                }}
                className="w-40"
              >
                <option value="">All Training</option>
                <option value="ENROLLED">Enrolled</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="DROPPED">Dropped</option>
                <option value="ON_HOLD">On Hold</option>
              </Select>
              <Select
                value={placementStatus}
                onChange={(e) => {
                  setPlacementStatus(e.target.value);
                  setPage(1);
                }}
                className="w-44"
              >
                <option value="">All Placement</option>
                <option value="NOT_LOOKING">Not Looking</option>
                <option value="LOOKING_FOR_JOB">Looking for Job</option>
                <option value="INTERVIEWING">Interviewing</option>
                <option value="PLACED">Placed</option>
                <option value="NOT_PLACED">Not Placed</option>
              </Select>
            </>
          }
          actions={
            can(PERMISSIONS.STUDENTS_CREATE) && (
              <Button onClick={() => router.push('/students/new')}>
                <Plus className="h-4 w-4" /> Add Student
              </Button>
            )
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
          emptyDescription="Add your first student to get started."
          emptyAction={
            can(PERMISSIONS.STUDENTS_CREATE) && (
              <Button size="sm" onClick={() => router.push('/students/new')}>
                <Plus className="h-4 w-4" /> Add Student
              </Button>
            )
          }
          pagination={data?.pagination}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
