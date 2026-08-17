'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Pencil, KeyRound, Ban, CheckCircle2, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Toolbar } from '@/components/ui/Toolbar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { usersApi } from '@/api/users.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import { usePermission } from '@/hooks/usePermission';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { PERMISSIONS } from '@/constants/permissions';
import { USER_STATUS_TONE, humanizeEnum } from '@/utils/statusTones';
import type { ManagedUser } from '@/types/user.types';
import { UserFormModal } from './UserFormModal';
import { ResetPasswordModal } from './ResetPasswordModal';

export function UsersPage() {
  const { can } = usePermission();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [resetting, setResetting] = useState<ManagedUser | null>(null);
  const [deleting, setDeleting] = useState<ManagedUser | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', { page, search: debouncedSearch }],
    queryFn: () => usersApi.list({ page, limit: 10, search: debouncedSearch || undefined }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] });

  const activateMutation = useMutation({
    mutationFn: (id: string) => usersApi.activate(id),
    onSuccess: () => {
      toast.success('User activated');
      invalidate();
    },
    onError: (err) => toast.error('Could not activate user', getErrorMessage(err)),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: () => {
      toast.success('User deactivated');
      invalidate();
    },
    onError: (err) => toast.error('Could not deactivate user', getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      toast.success('User deleted');
      invalidate();
      setDeleting(null);
    },
    onError: (err) => toast.error('Could not delete user', getErrorMessage(err)),
  });

  const columns: Column<ManagedUser>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (u) => (
        <div>
          <p className="font-medium text-ink">{u.firstName} {u.lastName}</p>
          <p className="text-xs text-ink/45">{u.email}</p>
        </div>
      ),
    },
    { key: 'role', header: 'Role', render: (u) => <Badge tone="brand">{u.role.name}</Badge> },
    {
      key: 'status',
      header: 'Status',
      render: (u) => <Badge tone={USER_STATUS_TONE[u.status]}>{humanizeEnum(u.status)}</Badge>,
    },
    {
      key: 'lastLoginAt',
      header: 'Last Login',
      render: (u) => (u.lastLoginAt ? format(new Date(u.lastLoginAt), 'dd MMM yyyy, h:mm a') : 'Never'),
      hideOnMobile: true,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (u) => format(new Date(u.createdAt), 'dd MMM yyyy'),
      hideOnMobile: true,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (u) => (
        <div className="flex justify-end gap-1">
          {can(PERMISSIONS.USERS_EDIT) && u.role.name !== 'OWNER' && (
            <button
              onClick={() => {
                setEditing(u);
                setFormOpen(true);
              }}
              className="rounded-lg p-1.5 text-ink/40 hover:bg-black/[0.04] hover:text-ink/70"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {can(PERMISSIONS.USERS_EDIT) && u.role.name !== 'OWNER' && (
            <button
              onClick={() => setResetting(u)}
              className="rounded-lg p-1.5 text-ink/40 hover:bg-black/[0.04] hover:text-ink/70"
              title="Reset Password"
            >
              <KeyRound className="h-4 w-4" />
            </button>
          )}
          {u.status === 'ACTIVE' && can(PERMISSIONS.USERS_DEACTIVATE) && u.role.name !== 'OWNER' && (
            <button
              onClick={() => deactivateMutation.mutate(u._id)}
              className="rounded-lg p-1.5 text-ink/40 hover:bg-amber-50 hover:text-amber-600"
              title="Deactivate"
            >
              <Ban className="h-4 w-4" />
            </button>
          )}
          {u.status !== 'ACTIVE' && can(PERMISSIONS.USERS_ACTIVATE) && u.role.name !== 'OWNER' && (
            <button
              onClick={() => activateMutation.mutate(u._id)}
              className="rounded-lg p-1.5 text-ink/40 hover:bg-emerald-50 hover:text-emerald-600"
              title="Activate"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
          {can(PERMISSIONS.USERS_DELETE) && u.role.name !== 'OWNER' && (
            <button
              onClick={() => setDeleting(u)}
              className="rounded-lg p-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600"
              title="Delete"
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
        <h1 className="font-display text-xl font-semibold text-ink">Users</h1>
        <p className="mt-1 text-sm text-ink/50">Manage who has access to your admin dashboard.</p>
      </div>

      <Card>
        <Toolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search users..."
          actions={
            can(PERMISSIONS.USERS_CREATE) && (
              <Button
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Create User
              </Button>
            )
          }
        />
        <DataTable
          columns={columns}
          data={data?.data || []}
          getRowKey={(u) => u._id}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyTitle="No users found"
          emptyDescription="Create your first team member to get started."
          pagination={data?.pagination}
          onPageChange={setPage}
        />
      </Card>

      <UserFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        user={editing}
      />

      <ResetPasswordModal open={!!resetting} onClose={() => setResetting(null)} user={resetting} />

      <ConfirmDialog
        open={!!deleting}
        title="Delete user?"
        description={`"${deleting?.firstName} ${deleting?.lastName}" will be permanently removed.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting._id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
