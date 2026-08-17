'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CheckCircle2, Circle, ListChecks } from 'lucide-react';
import { coursesApi } from '@/api/courses.api';
import { studentsApi } from '@/api/students.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';
import type { CompletedModule, Course, Student } from '@/types/academic.types';

export function ProgressTab({ student }: { student: Student }) {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const courseId = typeof student.course === 'string' ? student.course : student.course._id;

  const { data: course, isLoading } = useQuery({
    queryKey: ['courses', courseId],
    queryFn: () => coursesApi.getById(courseId),
  });

  const toggleMutation = useMutation({
    mutationFn: (completedModules: string[]) => studentsApi.update(student._id, { completedModules }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', student._id] });
    },
    onError: (err) => toast.error('Could not update progress', getErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const modules = course?.modules || [];
  if (!modules.length) {
    return (
      <EmptyState
        icon={ListChecks}
        title="No classes defined for this course"
        description="Add a class breakdown (e.g. HTML, CSS, JavaScript) on the course to track student progress."
      />
    );
  }

  const completedByName = new Map((student.completedModules || []).map((m) => [m.module, m.completedAt]));
  const canEdit = can(PERMISSIONS.STUDENTS_EDIT);

  const toggle = (moduleName: string) => {
    if (!canEdit) return;
    const names = new Set(completedByName.keys());
    if (names.has(moduleName)) names.delete(moduleName);
    else names.add(moduleName);
    toggleMutation.mutate(Array.from(names));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink/60">
          {completedByName.size} of {modules.length} classes completed
        </p>
        <div className="h-2 w-40 overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${modules.length ? (completedByName.size / modules.length) * 100 : 0}%` }}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        {modules.map((m) => {
          const completedAt = completedByName.get(m);
          const done = !!completedAt;
          return (
            <button
              key={m}
              type="button"
              onClick={() => toggle(m)}
              disabled={!canEdit || toggleMutation.isPending}
              className={cn(
                'flex w-full items-center justify-between gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors',
                done ? 'border-brand-200 bg-brand-50/60 text-brand-800' : 'border-black/[0.06] text-ink/70',
                canEdit && 'hover:bg-black/[0.02]',
              )}
            >
              <span className="flex items-center gap-2.5">
                {done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-ink/25" />
                )}
                <span className={cn('font-medium', done && 'text-brand-800')}>{m}</span>
              </span>
              {done && <span className="shrink-0 text-xs text-brand-700/70">Completed {format(new Date(completedAt), 'dd MMM yyyy')}</span>}
            </button>
          );
        })}
      </div>
      {!canEdit && <p className="text-xs text-ink/40">You don&apos;t have permission to update progress.</p>}
    </div>
  );
}

/** Compact summary used outside the profile page (e.g. batch roster) - "2/4 classes". */
export function moduleProgressLabel(course: Course | string | undefined, completedModules: CompletedModule[]): string {
  if (!course || typeof course === 'string') return '-';
  const total = course.modules?.length || 0;
  if (!total) return '-';
  return `${completedModules?.length || 0}/${total} classes`;
}
