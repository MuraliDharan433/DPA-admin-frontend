'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { authApi } from '@/api/auth.api';
import { Field, Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => authApi.forgotPassword(values.email),
    onError: (err) => toast.error('Something went wrong', getErrorMessage(err)),
  });

  if (isSubmitSuccessful && mutation.isSuccess) {
    return (
      <div className="w-full max-w-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-6 w-6 text-success" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Check your email</h1>
        <p className="mt-2 text-sm text-ink/50">
          If an account exists for that address, we&apos;ve sent a link to reset your password.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm font-medium text-brand-600">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-display text-2xl font-semibold text-ink">Forgot password</h1>
      <p className="mt-1 text-sm text-ink/50">Enter your email and we&apos;ll send you a reset link.</p>
      <form
        className="mt-8 flex flex-col gap-4"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
      >
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" placeholder="you@yourinstitute.com" {...register('email')} />
        </Field>
        <Button type="submit" size="lg" isLoading={mutation.isPending}>
          Send reset link
        </Button>
        <Link href="/login" className="text-center text-sm font-medium text-ink/50 hover:text-ink/80">
          Back to sign in
        </Link>
      </form>
    </div>
  );
}
