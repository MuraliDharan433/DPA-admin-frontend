'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Field, Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { studentsApi } from '@/api/students.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import type { PlacementStatus, Student } from '@/types/academic.types';

interface FormValues {
  placementStatus: PlacementStatus;
  currentCompany: string;
  jobTitle: string;
  package: number | undefined;
  placementDate: string;
}

function toDateInput(value?: string) {
  return value ? value.slice(0, 10) : '';
}

export function PlacementEditModal({
  open,
  onClose,
  student,
}: {
  open: boolean;
  onClose: () => void;
  student: Student | null;
}) {
  const queryClient = useQueryClient();

  const { register, handleSubmit } = useForm<FormValues>({
    values: student
      ? {
          placementStatus: student.placementStatus,
          currentCompany: student.currentCompany || '',
          jobTitle: student.jobTitle || '',
          package: student.package,
          placementDate: toDateInput(student.placementDate),
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      studentsApi.update(student!._id, {
        placementStatus: values.placementStatus,
        currentCompany: values.currentCompany || undefined,
        jobTitle: values.jobTitle || undefined,
        package: values.package !== undefined && !Number.isNaN(values.package) ? values.package : undefined,
        placementDate: values.placementDate || undefined,
        course: typeof student!.course === 'string' ? student!.course : student!.course._id,
      }),
    onSuccess: () => {
      toast.success('Placement updated');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      onClose();
    },
    onError: (err) => toast.error('Could not update placement', getErrorMessage(err)),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Placement"
      description={student ? `${student.firstName} ${student.lastName} · ${student.studentId}` : undefined}
      size="md"
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <Field label="Placement Status" htmlFor="placementStatus">
          <Select id="placementStatus" {...register('placementStatus')}>
            <option value="NOT_LOOKING">Not Looking</option>
            <option value="LOOKING_FOR_JOB">Looking for Job</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="PLACED">Placed</option>
            <option value="NOT_PLACED">Not Placed</option>
          </Select>
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Current Company" htmlFor="currentCompany">
            <Input id="currentCompany" {...register('currentCompany')} />
          </Field>
          <Field label="Job Title" htmlFor="jobTitle">
            <Input id="jobTitle" {...register('jobTitle')} />
          </Field>
          <Field label="Package (₹/yr)" htmlFor="package">
            <Input id="package" type="number" min={0} {...register('package', { valueAsNumber: true })} />
          </Field>
          <Field label="Placement Date" htmlFor="placementDate">
            <Input id="placementDate" type="date" {...register('placementDate')} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
}
