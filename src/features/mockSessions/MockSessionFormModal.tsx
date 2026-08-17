'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Field, Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { mockSessionsApi, type MockSessionPayload } from '@/api/mockSessions.api';
import { studentsApi } from '@/api/students.api';
import { usersApi } from '@/api/users.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import { cn } from '@/utils/cn';

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-0.5" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`Rate ${n} out of 5`}
          aria-pressed={n <= value}
          className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
        >
          <Star className={cn('h-5 w-5', n <= value ? 'fill-amber-400 text-amber-400' : 'text-black/15')} />
        </button>
      ))}
    </div>
  );
}

export function MockSessionFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(3);

  const { data: students } = useQuery({
    queryKey: ['students', 'for-select'],
    queryFn: () => studentsApi.list({ limit: 100, sortBy: 'firstName', sortOrder: 'asc' }),
    enabled: open,
  });
  const { data: trainers } = useQuery({
    queryKey: ['users', 'lookup', 'TRAINER'],
    queryFn: () => usersApi.lookup('TRAINER'),
    enabled: open,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MockSessionPayload & { student: string }>({
    defaultValues: { type: 'MOCK_INTERVIEW' },
  });

  const mutation = useMutation({
    mutationFn: (values: MockSessionPayload & { student: string }) =>
      mockSessionsApi.create({ ...values, rating }),
    onSuccess: () => {
      toast.success('Mock session added');
      queryClient.invalidateQueries({ queryKey: ['mock-sessions'] });
      reset({ type: 'MOCK_INTERVIEW', date: '', trainer: '', student: '', feedback: '' });
      setRating(3);
      onClose();
    },
    onError: (err) => toast.error('Could not add mock session', getErrorMessage(err)),
  });

  return (
    <Modal open={open} onClose={onClose} title="Add Mock Session" size="md">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Student" htmlFor="student" error={errors.student?.message} required>
            <Select id="student" {...register('student', { required: 'Required' })}>
              <option value="">Select student</option>
              {students?.data.map((s) => (
                <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.studentId})</option>
              ))}
            </Select>
          </Field>
          <Field label="Type" htmlFor="type">
            <Select id="type" {...register('type')}>
              <option value="MOCK_INTERVIEW">Mock Interview</option>
              <option value="MOCK_TEST">Mock Test</option>
            </Select>
          </Field>
          <Field label="Date" htmlFor="date" error={errors.date?.message} required>
            <Input id="date" type="date" {...register('date', { required: 'Required' })} />
          </Field>
          <Field label="Trainer" htmlFor="trainer" error={errors.trainer?.message} required>
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
            rows={3}
            placeholder="How did the student perform?"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-300"
            {...register('feedback')}
          />
        </Field>
        <div>
          <p className="mb-1 text-sm font-medium text-ink/80">Rating</p>
          <StarRating value={rating} onChange={setRating} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Add Session</Button>
        </div>
      </form>
    </Modal>
  );
}
