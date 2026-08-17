'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Users, CheckCircle2, CircleDot, Circle } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { batchesApi } from '@/api/batches.api';
import { studentsApi } from '@/api/students.api';
import { BATCH_STATUS_TONE, TRAINING_STATUS_TONE, humanizeEnum } from '@/utils/statusTones';
import { cn } from '@/utils/cn';
import type { Batch, Course, Student } from '@/types/academic.types';

function ProgressCell({ student }: { student: Student }) {
  const course = student.course;
  const total = typeof course === 'string' ? 0 : course.modules?.length || 0;
  const done = student.completedModules?.length || 0;

  if (!total) return <span className="text-xs text-ink/35">No classes defined</span>;

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-black/[0.06]">
        <div
          className={cn('h-full rounded-full', done === total ? 'bg-success' : 'bg-brand-600')}
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>
      <span className="text-xs text-ink/60">{done}/{total} classes</span>
    </div>
  );
}

function ClassScheduleCard({ course, batch, students }: { course: Course; batch: Batch; students: Student[] }) {
  const modules = course.modules || [];
  if (!modules.length) return null;

  let nextUpFound = false;

  return (
    <Card>
      <div className="border-b border-black/[0.06] px-5 py-4">
        <h2 className="font-display text-sm font-semibold text-ink">Classes in this Batch</h2>
        <p className="mt-0.5 text-xs text-ink/45">
          {course.name} &middot; starts {format(new Date(batch.startDate), 'dd MMM yyyy')}
        </p>
      </div>
      <div className="divide-y divide-black/[0.06]">
        {modules.map((moduleName, index) => {
          const completions = students
            .map((s) => s.completedModules?.find((m) => m.module === moduleName)?.completedAt)
            .filter((d): d is string => !!d);
          const doneCount = completions.length;
          const allDone = students.length > 0 && doneCount === students.length;
          const isNextUp = !allDone && !nextUpFound;
          if (isNextUp) nextUpFound = true;
          const earliestStart = completions.length
            ? completions.reduce((a, b) => (a < b ? a : b))
            : undefined;

          return (
            <div key={moduleName} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex items-center gap-2.5">
                {allDone ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                ) : isNextUp ? (
                  <CircleDot className="h-4 w-4 shrink-0 text-brand-600" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-ink/25" />
                )}
                <span className="text-sm font-medium text-ink">
                  {index + 1}. {moduleName}
                </span>
                {isNextUp && <Badge tone="brand">Next Up</Badge>}
              </div>
              <span className="text-xs text-ink/50">
                {allDone
                  ? `Completed by all · started ${earliestStart ? format(new Date(earliestStart), 'dd MMM yyyy') : '-'}`
                  : `${doneCount}/${students.length} students done`}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function BatchDetailPage({ batchId }: { batchId: string }) {
  const router = useRouter();

  const { data: batch, isLoading: batchLoading, isError: batchError, refetch: refetchBatch } = useQuery({
    queryKey: ['batches', batchId],
    queryFn: () => batchesApi.getById(batchId),
  });

  const { data: students, isLoading: studentsLoading, isError: studentsError, refetch: refetchStudents } = useQuery({
    queryKey: ['students', { batch: batchId }],
    queryFn: () => studentsApi.list({ batch: batchId, limit: 100 }),
  });

  const courseName = (course: Course | string) => (typeof course === 'string' ? '-' : course.name);
  const trainerName = (trainer?: Batch['trainer']) =>
    !trainer ? '-' : typeof trainer === 'string' ? '-' : `${trainer.firstName} ${trainer.lastName}`;

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
      key: 'trainingStatus',
      header: 'Training',
      render: (s) => <Badge tone={TRAINING_STATUS_TONE[s.trainingStatus]}>{humanizeEnum(s.trainingStatus)}</Badge>,
      hideOnMobile: true,
    },
    { key: 'progress', header: 'Classes Completed', render: (s) => <ProgressCell student={s} /> },
  ];

  if (batchLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Card><CardBody className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></CardBody></Card>
      </div>
    );
  }

  if (batchError || !batch) {
    return <ErrorState message="Could not load this batch." onRetry={refetchBatch} />;
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.push('/batches')}
        className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink/80"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Batches
      </button>

      <Card>
        <CardBody className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-semibold text-ink">{batch.name}</h1>
              <Badge tone={BATCH_STATUS_TONE[batch.status]}>{humanizeEnum(batch.status)}</Badge>
            </div>
            <p className="mt-1 text-sm text-ink/50">
              {courseName(batch.course)} &middot; {format(new Date(batch.startDate), 'dd MMM yyyy')} - {format(new Date(batch.endDate), 'dd MMM yyyy')}
              {batch.timing ? ` · ${batch.timing}` : ''}
            </p>
            <p className="mt-1 text-xs text-ink/40">Trainer: {trainerName(batch.trainer)}</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-black/[0.06] px-4 py-2">
            <Users className="h-4 w-4 text-brand-500" />
            <span className="text-sm font-medium text-ink">{students?.data.length ?? 0} / {batch.capacity} students</span>
          </div>
        </CardBody>
      </Card>

      {typeof batch.course !== 'string' && (
        <ClassScheduleCard course={batch.course} batch={batch} students={students?.data || []} />
      )}

      <Card>
        <div className="border-b border-black/[0.06] px-5 py-4">
          <h2 className="font-display text-sm font-semibold text-ink">Students in this batch</h2>
          <p className="mt-0.5 text-xs text-ink/45">Click a student to view their full profile.</p>
        </div>
        <DataTable
          columns={columns}
          data={students?.data || []}
          getRowKey={(s) => s._id}
          isLoading={studentsLoading}
          isError={studentsError}
          onRetry={refetchStudents}
          onRowClick={(s) => router.push(`/students/${s._id}`)}
          emptyTitle="No students assigned yet"
          emptyDescription="Students assigned to this batch will appear here."
        />
      </Card>
    </div>
  );
}
