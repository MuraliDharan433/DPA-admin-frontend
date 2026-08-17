'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { ArrowLeft, Pencil, Plus } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { studentsApi } from '@/api/students.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { TRAINING_STATUS_TONE, PLACEMENT_STATUS_TONE, humanizeEnum } from '@/utils/statusTones';
import { cn } from '@/utils/cn';
import type { Course, Batch } from '@/types/academic.types';
import { ResumeTab } from './ResumeTab';
import { MockSessionsTab } from './MockSessionsTab';
import { ProgressTab } from './ProgressTab';
import { FeesTab } from './FeesTab';

const TABS = [
  'Overview',
  'Personal Details',
  'Education',
  'Course',
  'Progress',
  'Fees',
  'Experience',
  'Resume',
  'Mock Sessions',
  'Placement',
  'Notes',
] as const;
type Tab = (typeof TABS)[number];

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink/40">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value || <span className="text-ink/30">-</span>}</dd>
    </div>
  );
}

export function StudentProfilePage({ studentId }: { studentId: string }) {
  const router = useRouter();
  const { can } = usePermission();
  const [tab, setTab] = useState<Tab>('Overview');
  const queryClient = useQueryClient();

  const { data: student, isLoading, isError, refetch } = useQuery({
    queryKey: ['students', studentId],
    queryFn: () => studentsApi.getById(studentId),
  });

  const { register, handleSubmit, reset } = useForm<{ text: string }>();
  const addNoteMutation = useMutation({
    mutationFn: (text: string) => studentsApi.addNote(studentId, text),
    onSuccess: () => {
      toast.success('Note added');
      reset();
      queryClient.invalidateQueries({ queryKey: ['students', studentId] });
    },
    onError: (err) => toast.error('Could not add note', getErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardBody className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (isError || !student) {
    return <ErrorState message="Could not load this student." onRetry={refetch} />;
  }

  const courseName = (course: Course | string) => (typeof course === 'string' ? '-' : course.name);
  const batchName = (batch?: Batch | string) => (!batch ? undefined : typeof batch === 'string' ? '-' : batch.name);

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.push('/students')}
        className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink/80"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Students
      </button>

      <Card>
        <CardBody className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-semibold text-ink">
                {student.firstName} {student.lastName}
              </h1>
              <span className="text-sm text-ink/40">{student.studentId}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="brand">{courseName(student.course)}</Badge>
              {batchName(student.batch) && <Badge tone="cyan">{batchName(student.batch)}</Badge>}
              <Badge tone={TRAINING_STATUS_TONE[student.trainingStatus]}>
                {humanizeEnum(student.trainingStatus)}
              </Badge>
              <Badge tone={PLACEMENT_STATUS_TONE[student.placementStatus]}>
                {humanizeEnum(student.placementStatus)}
              </Badge>
            </div>
          </div>
          {can(PERMISSIONS.STUDENTS_EDIT) && (
            <Button variant="outline" onClick={() => router.push(`/students/${student._id}/edit`)}>
              <Pencil className="h-4 w-4" /> Edit Student
            </Button>
          )}
        </CardBody>
      </Card>

      <Card>
        <div className="scrollbar-thin flex gap-1 overflow-x-auto border-b border-black/[0.06] px-4">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'shrink-0 border-b-2 px-3 py-3 text-sm font-medium transition-colors',
                tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink/50 hover:text-ink/80',
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <CardBody>
          {tab === 'Overview' && (
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <InfoRow label="Email" value={student.email} />
              <InfoRow label="Mobile" value={student.mobile} />
              <InfoRow label="City" value={student.city} />
              <InfoRow label="Course" value={courseName(student.course)} />
              <InfoRow label="Batch" value={batchName(student.batch)} />
              <InfoRow
                label="Joining Date"
                value={student.joiningDate && format(new Date(student.joiningDate), 'dd MMM yyyy')}
              />
              <InfoRow label="Skills" value={student.skills?.join(', ')} />
              <InfoRow
                label="Placement"
                value={student.currentCompany ? `${student.jobTitle} at ${student.currentCompany}` : undefined}
              />
            </dl>
          )}

          {tab === 'Personal Details' && (
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <InfoRow label="Date of Birth" value={student.dob && format(new Date(student.dob), 'dd MMM yyyy')} />
              <InfoRow label="Gender" value={student.gender && humanizeEnum(student.gender)} />
              <InfoRow label="Email" value={student.email} />
              <InfoRow label="Mobile" value={student.mobile} />
              <InfoRow label="Alternate Mobile" value={student.alternateMobile} />
              <InfoRow label="Address" value={student.address} />
              <InfoRow label="City" value={student.city} />
              <InfoRow label="State" value={student.state} />
              <InfoRow label="Country" value={student.country} />
              <InfoRow label="Pincode" value={student.pincode} />
            </dl>
          )}

          {tab === 'Education' && (
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <InfoRow label="Highest Qualification" value={student.highestQualification} />
              <InfoRow label="College" value={student.college} />
              <InfoRow label="University" value={student.university} />
              <InfoRow label="Graduation Year" value={student.graduationYear} />
              <InfoRow label="Percentage / CGPA" value={student.percentage} />
              <InfoRow label="Skills" value={student.skills?.join(', ')} />
            </dl>
          )}

          {tab === 'Course' && (
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <InfoRow label="Course" value={courseName(student.course)} />
              <InfoRow label="Batch" value={batchName(student.batch)} />
              <InfoRow
                label="Joining Date"
                value={student.joiningDate && format(new Date(student.joiningDate), 'dd MMM yyyy')}
              />
              <InfoRow
                label="Course Start Date"
                value={student.courseStartDate && format(new Date(student.courseStartDate), 'dd MMM yyyy')}
              />
              <InfoRow
                label="Course End Date"
                value={student.courseEndDate && format(new Date(student.courseEndDate), 'dd MMM yyyy')}
              />
              <InfoRow label="Training Status" value={humanizeEnum(student.trainingStatus)} />
            </dl>
          )}

          {tab === 'Progress' && <ProgressTab student={student} />}

          {tab === 'Fees' && <FeesTab student={student} />}

          {tab === 'Experience' && (
            <div className="space-y-4">
              <Badge tone={student.studentType === 'EXPERIENCED' ? 'brand' : 'neutral'}>
                {student.studentType === 'EXPERIENCED' ? 'Experienced' : 'Fresher'}
              </Badge>
              {student.studentType === 'EXPERIENCED' ? (
                <>
                  <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <InfoRow label="Last Company" value={student.lastCompany} />
                    <InfoRow
                      label="Total Experience"
                      value={student.totalYearsExperience !== undefined ? `${student.totalYearsExperience} yrs` : undefined}
                    />
                    <InfoRow label="PF Status" value={student.pfStatus === undefined ? undefined : student.pfStatus ? 'Yes' : 'No'} />
                  </dl>
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/40">Work History</p>
                    {!student.workHistory?.length ? (
                      <p className="text-sm text-ink/40">No previous companies added.</p>
                    ) : (
                      <div className="space-y-2">
                        {student.workHistory.map((w, i) => (
                          <div key={i} className="rounded-xl border border-black/[0.06] p-3 text-sm">
                            <p className="font-medium text-ink">{w.company}</p>
                            <p className="text-xs text-ink/45">
                              {w.role || 'Role not specified'}
                              {w.years !== undefined ? ` · ${w.years} yrs` : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-ink/50">This student has no prior work experience.</p>
              )}
            </div>
          )}

          {tab === 'Resume' && <ResumeTab studentId={student._id} />}

          {tab === 'Mock Sessions' && <MockSessionsTab studentId={student._id} />}

          {tab === 'Placement' && (
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <InfoRow label="Placement Status" value={humanizeEnum(student.placementStatus)} />
              <InfoRow label="Current Company" value={student.currentCompany} />
              <InfoRow label="Job Title" value={student.jobTitle} />
              <InfoRow label="Package" value={student.package ? `₹${student.package.toLocaleString('en-IN')}` : undefined} />
              <InfoRow
                label="Placement Date"
                value={student.placementDate && format(new Date(student.placementDate), 'dd MMM yyyy')}
              />
            </dl>
          )}

          {tab === 'Notes' && (
            <div className="space-y-4">
              {can(PERMISSIONS.STUDENTS_EDIT) && (
                <form
                  onSubmit={handleSubmit((v) => v.text.trim() && addNoteMutation.mutate(v.text))}
                  className="flex gap-2"
                >
                  <input
                    {...register('text')}
                    placeholder="Add a note about this student..."
                    className="h-10 flex-1 rounded-lg border border-black/10 px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-300"
                  />
                  <Button type="submit" isLoading={addNoteMutation.isPending}>
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </form>
              )}
              {student.notes.length === 0 ? (
                <EmptyState title="No notes yet" description="Notes added by your team will appear here." />
              ) : (
                <div className="space-y-3">
                  {[...student.notes].reverse().map((note, i) => (
                    <div key={i} className="rounded-xl border border-black/[0.06] p-3">
                      <p className="text-sm text-ink">{note.text}</p>
                      <p className="mt-1.5 text-xs text-ink/40">
                        {typeof note.createdBy === 'string'
                          ? ''
                          : `${note.createdBy.firstName} ${note.createdBy.lastName}`}{' '}
                        &middot; {format(new Date(note.createdAt), 'dd MMM yyyy, h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
