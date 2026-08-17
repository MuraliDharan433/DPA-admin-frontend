'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Field, Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { batchesApi } from '@/api/batches.api';
import { coursesApi } from '@/api/courses.api';
import { usersApi } from '@/api/users.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import type { Batch, Course } from '@/types/academic.types';

const schema = z.object({
  name: z.string().min(2, 'Required'),
  course: z.string().min(1, 'Required'),
  trainer: z.string().optional(),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().min(1, 'Required'),
  timing: z.string().optional(),
  capacity: z.number().min(1, 'Must be at least 1'),
  status: z.enum(['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
});

type FormValues = z.infer<typeof schema>;

function toDateInput(value?: string) {
  return value ? value.slice(0, 10) : '';
}

export function BatchFormModal({
  open,
  onClose,
  batch,
}: {
  open: boolean;
  onClose: () => void;
  batch?: Batch | null;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!batch;

  const { data: courses } = useQuery({
    queryKey: ['courses', 'active'],
    queryFn: coursesApi.listActive,
    enabled: open,
  });
  const { data: trainers } = useQuery({
    queryKey: ['users', 'lookup', 'TRAINER'],
    queryFn: () => usersApi.lookup('TRAINER'),
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: batch
      ? {
          name: batch.name,
          course: typeof batch.course === 'string' ? batch.course : batch.course._id,
          trainer: batch.trainer
            ? typeof batch.trainer === 'string'
              ? batch.trainer
              : batch.trainer._id
            : '',
          startDate: toDateInput(batch.startDate),
          endDate: toDateInput(batch.endDate),
          timing: batch.timing || '',
          capacity: batch.capacity,
          status: batch.status,
        }
      : {
          name: '',
          course: '',
          trainer: '',
          startDate: '',
          endDate: '',
          timing: '',
          capacity: 20,
          status: 'UPCOMING',
        },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = { ...values, trainer: values.trainer || undefined };
      return isEdit ? batchesApi.update(batch!._id, payload) : batchesApi.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Batch updated' : 'Batch created');
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      onClose();
    },
    onError: (err) => toast.error('Could not save batch', getErrorMessage(err)),
  });

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Batch' : 'Add Batch'} size="md">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <Field label="Batch Name" htmlFor="name" error={errors.name?.message} required>
          <Input id="name" {...register('name')} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Course" htmlFor="course" error={errors.course?.message} required>
            <Select id="course" {...register('course')}>
              <option value="">Select course</option>
              {courses?.map((c: Course) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Trainer" htmlFor="trainer" error={errors.trainer?.message}>
            <Select id="trainer" {...register('trainer')}>
              <option value="">Unassigned</option>
              {trainers?.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Start Date" htmlFor="startDate" error={errors.startDate?.message} required>
            <Input id="startDate" type="date" {...register('startDate')} />
          </Field>
          <Field label="End Date" htmlFor="endDate" error={errors.endDate?.message} required>
            <Input id="endDate" type="date" {...register('endDate')} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Timing" htmlFor="timing" error={errors.timing?.message}>
            <Input id="timing" placeholder="7:00 PM - 9:00 PM" {...register('timing')} />
          </Field>
          <Field label="Capacity" htmlFor="capacity" error={errors.capacity?.message} required>
            <Input id="capacity" type="number" min={1} {...register('capacity', { valueAsNumber: true })} />
          </Field>
        </div>
        <Field label="Status" htmlFor="status" error={errors.status?.message}>
          <Select id="status" {...register('status')}>
            <option value="UPCOMING">Upcoming</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {isEdit ? 'Save Changes' : 'Create Batch'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
