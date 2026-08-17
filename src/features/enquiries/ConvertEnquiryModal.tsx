'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { coursesApi } from '@/api/courses.api';
import { batchesApi } from '@/api/batches.api';
import { enquiriesApi } from '@/api/enquiries.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';

interface FormValues {
  course: string;
  batch?: string;
}

export function ConvertEnquiryModal({
  open,
  onClose,
  enquiryId,
}: {
  open: boolean;
  onClose: () => void;
  enquiryId: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: courses } = useQuery({ queryKey: ['courses', 'active'], queryFn: coursesApi.listActive, enabled: open });
  const { data: batches } = useQuery({ queryKey: ['batches', 'active'], queryFn: batchesApi.listActive, enabled: open });

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const mutation = useMutation({
    mutationFn: (values: FormValues) => enquiriesApi.convert(enquiryId, values.course, values.batch || undefined),
    onSuccess: (result) => {
      toast.success('Converted to student');
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      onClose();
      router.push(`/students/${result.studentId}`);
    },
    onError: (err) => toast.error('Could not convert enquiry', getErrorMessage(err)),
  });

  return (
    <Modal open={open} onClose={onClose} title="Convert to Student" size="sm">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <Field label="Course" htmlFor="course" error={errors.course?.message} required>
          <Select id="course" {...register('course', { required: 'Required' })}>
            <option value="">Select course</option>
            {courses?.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Batch" htmlFor="batch">
          <Select id="batch" {...register('batch')}>
            <option value="">Unassigned</option>
            {batches?.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </Select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Convert</Button>
        </div>
      </form>
    </Modal>
  );
}
