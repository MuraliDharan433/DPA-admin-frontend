'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { Field, Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Include upper, lower case letters and a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export function ChangePasswordPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      authApi.changePassword(values.currentPassword, values.newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully');
      reset();
    },
    onError: (err) => toast.error('Could not change password', getErrorMessage(err)),
  });

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardBody>
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
        >
          <Field label="Current password" htmlFor="currentPassword" error={errors.currentPassword?.message}>
            <Input id="currentPassword" type="password" {...register('currentPassword')} />
          </Field>
          <Field label="New password" htmlFor="newPassword" error={errors.newPassword?.message}>
            <Input id="newPassword" type="password" {...register('newPassword')} />
          </Field>
          <Field
            label="Confirm new password"
            htmlFor="confirmPassword"
            error={errors.confirmPassword?.message}
          >
            <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
          </Field>
          <Button type="submit" isLoading={mutation.isPending} className="self-start">
            Update Password
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
