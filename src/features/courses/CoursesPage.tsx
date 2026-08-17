'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Toolbar } from '@/components/ui/Toolbar';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { coursesApi } from '@/api/courses.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import { usePermission } from '@/hooks/usePermission';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { PERMISSIONS } from '@/constants/permissions';
import { COURSE_STATUS_TONE, humanizeEnum } from '@/utils/statusTones';
import type { Course } from '@/types/academic.types';
import { CourseFormModal } from './CourseFormModal';

export function CoursesPage() {
  const { can } = usePermission();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState<Course | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['courses', { page, search: debouncedSearch, status }],
    queryFn: () =>
      coursesApi.list({ page, limit: 10, search: debouncedSearch || undefined, status: status || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => coursesApi.remove(id),
    onSuccess: () => {
      toast.success('Course deleted');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setDeleting(null);
    },
    onError: (err) => toast.error('Could not delete course', getErrorMessage(err)),
  });

  const columns: Column<Course>[] = [
    {
      key: 'name',
      header: 'Course',
      render: (c) => (
        <div>
          <p className="font-medium text-ink">{c.name}</p>
          <p className="text-xs text-ink/45">{c.code}</p>
        </div>
      ),
    },
    { key: 'duration', header: 'Duration', render: (c) => c.duration, hideOnMobile: true },
    {
      key: 'modules',
      header: 'Classes',
      render: (c) => (
        <span className="text-ink/60">{c.modules?.length ? `${c.modules.length} classes` : '-'}</span>
      ),
      hideOnMobile: true,
    },
    { key: 'fee', header: 'Fee', render: (c) => `₹${c.fee.toLocaleString('en-IN')}`, hideOnMobile: true },
    { key: 'mode', header: 'Mode', render: (c) => humanizeEnum(c.mode), hideOnMobile: true },
    {
      key: 'status',
      header: 'Status',
      render: (c) => <Badge tone={COURSE_STATUS_TONE[c.status]}>{humanizeEnum(c.status)}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      render: (c) => (
        <div className="flex justify-end gap-1">
          {can(PERMISSIONS.COURSES_EDIT) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(c);
                setFormOpen(true);
              }}
              className="rounded-lg p-1.5 text-ink/40 hover:bg-black/[0.04] hover:text-ink/70"
              aria-label="Edit course"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {can(PERMISSIONS.COURSES_DELETE) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleting(c);
              }}
              className="rounded-lg p-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete course"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Courses</h1>
          <p className="mt-1 text-sm text-ink/50">Manage the courses your institute offers.</p>
        </div>
      </div>

      <Card>
        <Toolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search courses..."
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
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          }
          actions={
            can(PERMISSIONS.COURSES_CREATE) && (
              <Button
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Add Course
              </Button>
            )
          }
        />
        <DataTable
          columns={columns}
          data={data?.data || []}
          getRowKey={(c) => c._id}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyTitle="No courses found"
          emptyDescription="Add your first course to get started."
          emptyAction={
            can(PERMISSIONS.COURSES_CREATE) && (
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4" /> Add Course
              </Button>
            )
          }
          pagination={data?.pagination}
          onPageChange={setPage}
        />
      </Card>

      <CourseFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        course={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete course?"
        description={`"${deleting?.name}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting._id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
