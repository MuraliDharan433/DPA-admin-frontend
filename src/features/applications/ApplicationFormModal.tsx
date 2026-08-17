'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Field, Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { jobApplicationsApi, companiesApi, type JobApplicationPayload } from '@/api/placements.api';
import { studentsApi } from '@/api/students.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';

export function ApplicationFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: students } = useQuery({
    queryKey: ['students', 'for-select'],
    queryFn: () => studentsApi.list({ limit: 100, sortBy: 'firstName', sortOrder: 'asc' }),
    enabled: open,
  });
  const { data: companies } = useQuery({
    queryKey: ['companies', 'lite'],
    queryFn: companiesApi.listLite,
    enabled: open,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<JobApplicationPayload>({
    defaultValues: { status: 'APPLIED' },
  });

  const mutation = useMutation({
    mutationFn: (values: JobApplicationPayload) => jobApplicationsApi.create(values),
    onSuccess: () => {
      toast.success('Application added');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      onClose();
    },
    onError: (err) => toast.error('Could not add application', getErrorMessage(err)),
  });

  return (
    <Modal open={open} onClose={onClose} title="Add Job Application" size="md">
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
          <Field label="Company" htmlFor="company" error={errors.company?.message} required>
            <Select id="company" {...register('company', { required: 'Required' })}>
              <option value="">Select company</option>
              {companies?.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Job Title" htmlFor="jobTitle" error={errors.jobTitle?.message} required>
            <Input id="jobTitle" {...register('jobTitle', { required: 'Required' })} />
          </Field>
          <Field label="Package (₹/yr)" htmlFor="package">
            <Input id="package" type="number" {...register('package', { valueAsNumber: true })} />
          </Field>
          <Field label="Application Date" htmlFor="applicationDate" error={errors.applicationDate?.message} required>
            <Input id="applicationDate" type="date" {...register('applicationDate', { required: 'Required' })} />
          </Field>
          <Field label="Status" htmlFor="status">
            <Select id="status" {...register('status')}>
              <option value="APPLIED">Applied</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW">Interview</option>
              <option value="SELECTED">Selected</option>
              <option value="REJECTED">Rejected</option>
              <option value="OFFER_RECEIVED">Offer Received</option>
              <option value="JOINED">Joined</option>
            </Select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Add Application</Button>
        </div>
      </form>
    </Modal>
  );
}
