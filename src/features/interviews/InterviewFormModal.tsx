'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Field, Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { interviewsApi, jobApplicationsApi, type InterviewPayload } from '@/api/placements.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import type { Student } from '@/types/academic.types';
import type { Company, Interview } from '@/types/placement.types';

function toDateInput(value?: string) {
  return value ? value.slice(0, 10) : '';
}

export function InterviewFormModal({
  open,
  onClose,
  interview,
}: {
  open: boolean;
  onClose: () => void;
  interview?: Interview | null;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!interview;
  const { data: applications } = useQuery({
    queryKey: ['applications', 'for-select'],
    queryFn: () => jobApplicationsApi.list({ limit: 100 }),
    enabled: open,
  });

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<InterviewPayload>({
    defaultValues: { status: 'SCHEDULED', result: 'PENDING' },
  });
  const applicationId = watch('application');

  useEffect(() => {
    if (interview) {
      reset({
        application: typeof interview.application === 'string' ? interview.application : interview.application._id,
        student: typeof interview.student === 'string' ? interview.student : interview.student._id,
        interviewDate: toDateInput(interview.interviewDate),
        round: interview.round || '',
        status: interview.status,
        result: interview.result,
        interviewer: interview.interviewer || '',
        feedback: interview.feedback || '',
      });
    } else if (open) {
      reset({ status: 'SCHEDULED', result: 'PENDING' });
    }
  }, [interview, open, reset]);

  useEffect(() => {
    if (isEdit) return;
    const app = applications?.data.find((a) => a._id === applicationId);
    if (app) setValue('student', typeof app.student === 'string' ? app.student : app.student._id);
  }, [applicationId, applications, setValue, isEdit]);

  const mutation = useMutation({
    mutationFn: (values: InterviewPayload) =>
      isEdit ? interviewsApi.update(interview!._id, values) : interviewsApi.create(values),
    onSuccess: () => {
      toast.success(isEdit ? 'Interview updated' : 'Interview scheduled');
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      onClose();
    },
    onError: (err) => toast.error(isEdit ? 'Could not update interview' : 'Could not schedule interview', getErrorMessage(err)),
  });

  const studentName = (s: Student | string) => (typeof s === 'string' ? '' : `${s.firstName} ${s.lastName}`);
  const companyName = (c: Company | string) => (typeof c === 'string' ? '' : c.name);

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Interview' : 'Schedule Interview'} size="md">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <input type="hidden" {...register('student', { required: 'Select an application first' })} />
        <Field label="Application" htmlFor="application" error={errors.application?.message} required>
          <Select id="application" disabled={isEdit} {...register('application', { required: 'Required' })}>
            <option value="">Select application</option>
            {applications?.data.map((a) => (
              <option key={a._id} value={a._id}>
                {studentName(a.student)} - {companyName(a.company)} ({a.jobTitle})
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Interview Date" htmlFor="interviewDate" error={errors.interviewDate?.message} required>
            <Input id="interviewDate" type="date" {...register('interviewDate', { required: 'Required' })} />
          </Field>
          <Field label="Interview Level" htmlFor="round">
            <Input id="round" placeholder="e.g. Level 1, Technical, HR Round" {...register('round')} />
          </Field>
          <Field label="Interviewer" htmlFor="interviewer">
            <Input id="interviewer" {...register('interviewer')} />
          </Field>
          <Field label="Status" htmlFor="status">
            <Select id="status" {...register('status')}>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="RESCHEDULED">Rescheduled</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </Select>
          </Field>
          <Field label="Result" htmlFor="result">
            <Select id="result" {...register('result')}>
              <option value="PENDING">Pending</option>
              <option value="SELECTED">Selected</option>
              <option value="REJECTED">Rejected</option>
            </Select>
          </Field>
        </div>
        <Field label="Feedback" htmlFor="feedback">
          <Input id="feedback" {...register('feedback')} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>{isEdit ? 'Save Changes' : 'Schedule'}</Button>
        </div>
      </form>
    </Modal>
  );
}
