'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, Trash2, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { mockSessionsApi, type MockSessionPayload } from '@/api/mockSessions.api';
import { usersApi } from '@/api/users.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';
import type { UserRef } from '@/types/enquiry.types';

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex items-center gap-0.5" role={onChange ? 'radiogroup' : undefined} aria-label={onChange ? 'Rating' : `Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={cn(!onChange && 'cursor-default', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded')}
          aria-label={onChange ? `Rate ${n} out of 5` : undefined}
          aria-pressed={onChange ? n <= value : undefined}
          tabIndex={onChange ? 0 : -1}
        >
          <Star
            className={cn('h-4 w-4', n <= value ? 'fill-amber-400 text-amber-400' : 'text-black/15')}
          />
        </button>
      ))}
    </div>
  );
}

export function MockSessionsTab({ studentId }: { studentId: string }) {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(3);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['mock-sessions', studentId],
    queryFn: () => mockSessionsApi.listForStudent(studentId),
  });

  const { data: trainers } = useQuery({
    queryKey: ['users', 'lookup', 'TRAINER'],
    queryFn: () => usersApi.lookup('TRAINER'),
    enabled: can(PERMISSIONS.MOCK_CREATE),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MockSessionPayload>({
    defaultValues: { type: 'MOCK_INTERVIEW' },
  });

  const createMutation = useMutation({
    mutationFn: (values: MockSessionPayload) => mockSessionsApi.createForStudent(studentId, { ...values, rating }),
    onSuccess: () => {
      toast.success('Mock session added');
      reset({ type: 'MOCK_INTERVIEW', date: '', trainer: '', feedback: '' });
      setRating(3);
      queryClient.invalidateQueries({ queryKey: ['mock-sessions', studentId] });
    },
    onError: (err) => toast.error('Could not add mock session', getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mockSessionsApi.remove(id),
    onSuccess: () => {
      toast.success('Mock session deleted');
      queryClient.invalidateQueries({ queryKey: ['mock-sessions', studentId] });
    },
    onError: (err) => toast.error('Could not delete mock session', getErrorMessage(err)),
  });

  const trainerName = (t: UserRef | string) => (typeof t === 'string' ? '-' : `${t.firstName} ${t.lastName}`);

  return (
    <div className="space-y-4">
      {can(PERMISSIONS.MOCK_CREATE) && (
        <form
          onSubmit={handleSubmit((v) => createMutation.mutate(v))}
          className="space-y-3 rounded-xl border border-black/[0.06] p-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Type" htmlFor="type">
              <Select id="type" {...register('type')}>
                <option value="MOCK_INTERVIEW">Mock Interview</option>
                <option value="MOCK_TEST">Mock Test</option>
              </Select>
            </Field>
            <Field label="Date" htmlFor="date" error={errors.date?.message}>
              <Input id="date" type="date" {...register('date', { required: 'Required' })} />
            </Field>
            <Field label="Trainer" htmlFor="trainer" error={errors.trainer?.message}>
              <Select id="trainer" {...register('trainer', { required: 'Required' })}>
                <option value="">Select trainer</option>
                {trainers?.map((t) => (
                  <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Feedback" htmlFor="feedback">
            <textarea
              id="feedback"
              rows={2}
              placeholder="How did the student perform?"
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-300"
              {...register('feedback')}
            />
          </Field>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-ink/80">Rating</p>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <Button type="submit" isLoading={createMutation.isPending}>
              Add Session
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No mock sessions yet"
          description="Mock interviews and tests logged for this student will appear here."
        />
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s._id} className="rounded-xl border border-black/[0.06] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge tone={s.type === 'MOCK_INTERVIEW' ? 'brand' : 'cyan'}>
                      {s.type === 'MOCK_INTERVIEW' ? 'Mock Interview' : 'Mock Test'}
                    </Badge>
                    <span className="text-xs text-ink/40">{format(new Date(s.date), 'dd MMM yyyy')}</span>
                  </div>
                  {s.feedback && <p className="mt-2 text-sm text-ink/70">{s.feedback}</p>}
                  <p className="mt-1.5 text-xs text-ink/40">Trainer: {trainerName(s.trainer)}</p>
                  <p className="mt-0.5 text-[11px] text-ink/35">Logged {format(new Date(s.createdAt), 'dd MMM yyyy, h:mm a')}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StarRating value={s.rating} />
                  {can(PERMISSIONS.MOCK_DELETE) && (
                    <button
                      onClick={() => deleteMutation.mutate(s._id)}
                      className="rounded-lg p-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete mock session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
