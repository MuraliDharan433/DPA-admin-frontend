'use client';

import { format } from 'date-fns';
import { Star } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { humanizeEnum } from '@/utils/statusTones';
import { cn } from '@/utils/cn';
import type { MockSession } from '@/types/placement.types';
import type { Course, Student } from '@/types/academic.types';
import type { UserRef } from '@/types/enquiry.types';

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} aria-hidden className={cn('h-4 w-4', n <= value ? 'fill-amber-400 text-amber-400' : 'text-black/15')} />
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink/40">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value ?? <span className="text-ink/30">-</span>}</dd>
    </div>
  );
}

export function MockSessionDetailModal({
  open,
  onClose,
  session,
}: {
  open: boolean;
  onClose: () => void;
  session: MockSession | null;
}) {
  if (!session) return null;

  const student = typeof session.student === 'string' ? null : (session.student as Student);
  const trainer = typeof session.trainer === 'string' ? null : (session.trainer as UserRef);
  const courseName = student && typeof student.course !== 'string' ? (student.course as Course).name : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={student ? `${student.firstName} ${student.lastName}` : 'Mock Session'}
      description={student?.studentId}
      size="lg"
    >
      <div className="space-y-6">
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Session Details</p>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Row
              label="Type"
              value={
                <Badge tone={session.type === 'MOCK_INTERVIEW' ? 'brand' : 'cyan'}>
                  {session.type === 'MOCK_INTERVIEW' ? 'Mock Interview' : 'Mock Test'}
                </Badge>
              }
            />
            <Row label="Session Date" value={format(new Date(session.date), 'dd MMM yyyy')} />
            <Row label="Trainer" value={trainer ? `${trainer.firstName} ${trainer.lastName}` : undefined} />
            <Row label="Rating" value={<StarRating value={session.rating} />} />
            <Row label="Logged On" value={format(new Date(session.createdAt), 'dd MMM yyyy, h:mm a')} />
            <Row label="Course" value={courseName} />
          </dl>
          {session.feedback && (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-ink/40">Feedback</p>
              <p className="mt-1 text-sm text-ink/80">{session.feedback}</p>
            </div>
          )}
        </section>

        {student && (
          <section className="border-t border-black/[0.06] pt-5">
            <div className="mb-2 flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Candidate Experience</p>
              <Badge tone={student.studentType === 'EXPERIENCED' ? 'brand' : 'neutral'}>
                {student.studentType === 'EXPERIENCED' ? 'Experienced' : 'Fresher'}
              </Badge>
            </div>
            {student.studentType === 'EXPERIENCED' ? (
              <>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Row label="Last Company" value={student.lastCompany} />
                  <Row
                    label="Total Experience"
                    value={student.totalYearsExperience !== undefined ? `${student.totalYearsExperience} yrs` : undefined}
                  />
                  <Row label="PF Status" value={student.pfStatus === undefined ? undefined : student.pfStatus ? 'Yes' : 'No'} />
                </dl>
                {!!student.workHistory?.length && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-ink/40">Companies Worked</p>
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
              </>
            ) : (
              <p className="text-sm text-ink/50">This candidate has no prior work experience.</p>
            )}
          </section>
        )}

        {student && (
          <section className="border-t border-black/[0.06] pt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Training Status</p>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Row label="Training Status" value={humanizeEnum(student.trainingStatus)} />
              <Row label="Placement Status" value={humanizeEnum(student.placementStatus)} />
              <Row
                label="Classes Completed"
                value={
                  courseName && typeof student.course !== 'string'
                    ? `${student.completedModules?.length || 0}/${(student.course as Course).modules?.length || 0}`
                    : undefined
                }
              />
            </dl>
          </section>
        )}
      </div>
    </Modal>
  );
}
