'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Field, Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { coursesApi } from '@/api/courses.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import type { Course } from '@/types/academic.types';

const schema = z.object({
  name: z.string().min(2, 'Required'),
  code: z.string().min(2, 'Required').max(20),
  description: z.string().optional(),
  duration: z.string().min(1, 'Required'),
  fee: z.number().min(0, 'Must be 0 or more'),
  mode: z.enum(['ONLINE', 'OFFLINE', 'HYBRID']),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  modules: z.array(z.object({ value: z.string().min(1, 'Class name required') })),
});

type FormValues = z.infer<typeof schema>;

export function CourseFormModal({
  open,
  onClose,
  course,
}: {
  open: boolean;
  onClose: () => void;
  course?: Course | null;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!course;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: course
      ? {
          name: course.name,
          code: course.code,
          description: course.description || '',
          duration: course.duration,
          fee: course.fee,
          mode: course.mode,
          status: course.status,
          modules: (course.modules || []).map((m) => ({ value: m })),
        }
      : {
          name: '',
          code: '',
          description: '',
          duration: '',
          fee: 0,
          mode: 'OFFLINE',
          status: 'ACTIVE',
          modules: [],
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'modules' });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = { ...values, modules: values.modules.map((m) => m.value) };
      return isEdit ? coursesApi.update(course!._id, payload) : coursesApi.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Course updated' : 'Course created');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      onClose();
    },
    onError: (err) => toast.error('Could not save course', getErrorMessage(err)),
  });

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Course' : 'Add Course'} size="md">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Course Name" htmlFor="name" error={errors.name?.message} required>
            <Input id="name" {...register('name')} />
          </Field>
          <Field label="Course Code" htmlFor="code" error={errors.code?.message} required>
            <Input id="code" placeholder="e.g. FSD01" {...register('code')} />
          </Field>
        </div>
        <Field label="Description" htmlFor="description" error={errors.description?.message}>
          <textarea
            id="description"
            rows={3}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-300"
            {...register('description')}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Duration" htmlFor="duration" error={errors.duration?.message} required>
            <Input id="duration" placeholder="6 months" {...register('duration')} />
          </Field>
          <Field label="Fee (₹)" htmlFor="fee" error={errors.fee?.message} required>
            <Input id="fee" type="number" min={0} {...register('fee', { valueAsNumber: true })} />
          </Field>
          <Field label="Mode" htmlFor="mode" error={errors.mode?.message} required>
            <Select id="mode" {...register('mode')}>
              <option value="OFFLINE">Offline</option>
              <option value="ONLINE">Online</option>
              <option value="HYBRID">Hybrid</option>
            </Select>
          </Field>
        </div>
        <Field label="Status" htmlFor="status" error={errors.status?.message}>
          <Select id="status" {...register('status')}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </Field>
        <div>
          <p className="mb-1.5 text-sm font-medium text-ink/80">
            Classes / Modules <span className="font-normal text-ink/40">(e.g. HTML, CSS, JavaScript)</span>
          </p>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input
                  placeholder={`Class ${index + 1} name`}
                  {...register(`modules.${index}.value` as const)}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="shrink-0 rounded-lg p-2 text-ink/40 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove class ${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {errors.modules && (
              <p className="text-xs text-red-500">Every class needs a name, or remove the empty row.</p>
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '' })}>
              <Plus className="h-4 w-4" /> Add Class
            </Button>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {isEdit ? 'Save Changes' : 'Create Course'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
