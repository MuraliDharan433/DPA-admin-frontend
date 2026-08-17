'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { Field, Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';

const schema = z
  .object({
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

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => authApi.resetPassword(token, values.newPassword),
    onSuccess: () => {
      toast.success('Password reset', 'You can now sign in with your new password.');
      router.replace('/login');
    },
    onError: (err) => toast.error('Reset failed', getErrorMessage(err)),
  });

  if (!token) {
    return (
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold text-ink">Invalid link</h1>
        <p className="mt-2 text-sm text-ink/50">This password reset link is missing or invalid.</p>
        <Link href="/forgot-password" className="mt-6 inline-block text-sm font-medium text-brand-600">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-display text-2xl font-semibold text-ink">Set a new password</h1>
      <form
        className="mt-8 flex flex-col gap-4"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
      >
        <Field label="New password" htmlFor="newPassword" error={errors.newPassword?.message}>
          <Input id="newPassword" type="password" {...register('newPassword')} />
        </Field>
        <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
        </Field>
        <Button type="submit" size="lg" isLoading={mutation.isPending}>
          Reset password
        </Button>
      </form>
    </div>
  );
}
