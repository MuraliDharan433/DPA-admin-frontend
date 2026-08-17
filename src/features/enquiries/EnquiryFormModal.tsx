'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Field, Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { enquiriesApi, type EnquiryPayload } from '@/api/enquiries.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';

export function EnquiryFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EnquiryPayload>({
    defaultValues: { source: 'WALK_IN' },
  });

  const mutation = useMutation({
    mutationFn: (values: EnquiryPayload) => enquiriesApi.create(values),
    onSuccess: () => {
      toast.success('Enquiry added');
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      reset({ name: '', email: '', mobile: '', course: '', message: '', source: 'WALK_IN' });
      onClose();
    },
    onError: (err) => toast.error('Could not add enquiry', getErrorMessage(err)),
  });

  return (
    <Modal open={open} onClose={onClose} title="Add Enquiry" size="md">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" error={errors.name?.message} required>
            <Input id="name" {...register('name', { required: 'Required' })} />
          </Field>
          <Field label="Email" htmlFor="email" error={errors.email?.message} required>
            <Input id="email" type="email" {...register('email', { required: 'Required' })} />
          </Field>
          <Field label="Mobile" htmlFor="mobile" error={errors.mobile?.message} required>
            <Input id="mobile" {...register('mobile', { required: 'Required' })} />
          </Field>
          <Field label="Course Interested" htmlFor="course">
            <Input id="course" {...register('course')} />
          </Field>
          <Field label="Source" htmlFor="source">
            <Select id="source" {...register('source')}>
              <option value="WALK_IN">Walk-in</option>
              <option value="PHONE">Phone</option>
              <option value="WEBSITE">Website</option>
              <option value="REFERRAL">Referral</option>
              <option value="SOCIAL_MEDIA">Social Media</option>
              <option value="OTHER">Other</option>
            </Select>
          </Field>
        </div>
        <Field label="Message" htmlFor="message">
          <textarea
            id="message"
            rows={3}
            placeholder="Notes about this enquiry..."
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-300"
            {...register('message')}
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Add Enquiry</Button>
        </div>
      </form>
    </Modal>
  );
}
