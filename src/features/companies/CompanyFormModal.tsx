'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Field, Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { companiesApi, type CompanyPayload } from '@/api/placements.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import type { Company } from '@/types/placement.types';

export function CompanyFormModal({
  open,
  onClose,
  company,
}: {
  open: boolean;
  onClose: () => void;
  company?: Company | null;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!company;

  const { register, handleSubmit, formState: { errors } } = useForm<CompanyPayload>({
    values: company
      ? {
          name: company.name,
          website: company.website || '',
          industry: company.industry || '',
          location: company.location || '',
          contactPerson: company.contactPerson || '',
          contactEmail: company.contactEmail || '',
          contactPhone: company.contactPhone || '',
          notes: company.notes || '',
        }
      : { name: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: CompanyPayload) =>
      isEdit ? companiesApi.update(company!._id, values) : companiesApi.create(values),
    onSuccess: () => {
      toast.success(isEdit ? 'Company updated' : 'Company added');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      onClose();
    },
    onError: (err) => toast.error('Could not save company', getErrorMessage(err)),
  });

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Company' : 'Add Company'} size="md">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <Field label="Company Name" htmlFor="name" error={errors.name?.message} required>
          <Input id="name" {...register('name', { required: 'Required' })} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Website" htmlFor="website">
            <Input id="website" placeholder="https://" {...register('website')} />
          </Field>
          <Field label="Industry" htmlFor="industry">
            <Input id="industry" {...register('industry')} />
          </Field>
          <Field label="Location" htmlFor="location">
            <Input id="location" {...register('location')} />
          </Field>
          <Field label="Contact Person" htmlFor="contactPerson">
            <Input id="contactPerson" {...register('contactPerson')} />
          </Field>
          <Field label="Contact Email" htmlFor="contactEmail">
            <Input id="contactEmail" type="email" {...register('contactEmail')} />
          </Field>
          <Field label="Contact Phone" htmlFor="contactPhone">
            <Input id="contactPhone" {...register('contactPhone')} />
          </Field>
        </div>
        <Field label="Notes" htmlFor="notes">
          <Input id="notes" {...register('notes')} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>{isEdit ? 'Save Changes' : 'Add Company'}</Button>
        </div>
      </form>
    </Modal>
  );
}
