'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Globe } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Toolbar } from '@/components/ui/Toolbar';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { companiesApi } from '@/api/placements.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import { usePermission } from '@/hooks/usePermission';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { PERMISSIONS } from '@/constants/permissions';
import type { Company } from '@/types/placement.types';
import { CompanyFormModal } from './CompanyFormModal';

export function CompaniesPage() {
  const { can } = usePermission();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState<Company | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['companies', { page, search: debouncedSearch }],
    queryFn: () => companiesApi.list({ page, limit: 10, search: debouncedSearch || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => companiesApi.remove(id),
    onSuccess: () => {
      toast.success('Company deleted');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setDeleting(null);
    },
    onError: (err) => toast.error('Could not delete company', getErrorMessage(err)),
  });

  const columns: Column<Company>[] = [
    {
      key: 'name',
      header: 'Company',
      render: (c) => (
        <div>
          <p className="font-medium text-ink">{c.name}</p>
          {c.industry && <p className="text-xs text-ink/45">{c.industry}</p>}
        </div>
      ),
    },
    { key: 'location', header: 'Location', render: (c) => c.location || '-', hideOnMobile: true },
    {
      key: 'contact',
      header: 'Contact',
      render: (c) => c.contactPerson || c.contactEmail || '-',
      hideOnMobile: true,
    },
    {
      key: 'website',
      header: 'Website',
      hideOnMobile: true,
      render: (c) =>
        c.website ? (
          <a
            href={c.website}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-brand-600 hover:underline"
          >
            <Globe className="h-3.5 w-3.5" /> Visit
          </a>
        ) : (
          '-'
        ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (c) => (
        <div className="flex justify-end gap-1">
          {can(PERMISSIONS.PLACEMENTS_EDIT) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(c);
                setFormOpen(true);
              }}
              className="rounded-lg p-1.5 text-ink/40 hover:bg-black/[0.04] hover:text-ink/70"
              aria-label="Edit company"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {can(PERMISSIONS.PLACEMENTS_DELETE) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleting(c);
              }}
              className="rounded-lg p-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete company"
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
        <h1 className="font-display text-xl font-semibold text-ink">Companies</h1>
        <p className="mt-1 text-sm text-ink/50">Hiring partners you place students with.</p>
      </div>

      <Card>
        <Toolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search companies..."
          actions={
            can(PERMISSIONS.PLACEMENTS_CREATE) && (
              <Button
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Add Company
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
          emptyTitle="No companies yet"
          emptyDescription="Add hiring partners to start tracking applications."
          pagination={data?.pagination}
          onPageChange={setPage}
        />
      </Card>

      <CompanyFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        company={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete company?"
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
