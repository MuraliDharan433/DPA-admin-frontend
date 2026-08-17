import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { cn } from '@/utils/cn';
import type { Pagination } from '@/types/common.types';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (key: string) => void;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  isLoading,
  isError,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyAction,
  pagination,
  onPageChange,
  sortBy,
  sortOrder,
  onSortChange,
  onRowClick,
}: DataTableProps<T>) {
  if (isError) return <ErrorState onRetry={onRetry} />;

  const isEmpty = !isLoading && data.length === 0;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] text-left">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink/40',
                    col.hideOnMobile && 'hidden sm:table-cell',
                    col.className,
                  )}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => onSortChange?.(col.key)}
                      className="inline-flex items-center gap-1 hover:text-ink/70"
                    >
                      {col.header}
                      {sortBy === col.key ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-30" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.06]" aria-busy={isLoading || undefined}>
            {isLoading && <tr className="sr-only"><td>Loading results…</td></tr>}
            {isLoading &&
              Array.from({ length: 6 }).map((_, r) => (
                <tr key={r}>
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-5 py-3.5', col.hideOnMobile && 'hidden sm:table-cell')}>
                      <Skeleton className="h-4 w-full max-w-40" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading &&
              data.map((row) => (
                <tr
                  key={getRowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn('transition-colors', onRowClick && 'cursor-pointer hover:bg-brand-50/50')}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-5 py-3.5 align-middle text-ink/80',
                        col.hideOnMobile && 'hidden sm:table-cell',
                        col.className,
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {isEmpty && <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-black/[0.06] px-5 py-3">
          <p className="text-xs text-ink/45">
            Page {pagination.page} of {pagination.totalPages} &middot; {pagination.total} total
          </p>
          <div className="flex gap-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-ink/60 transition-colors hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-ink/60 transition-colors hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
