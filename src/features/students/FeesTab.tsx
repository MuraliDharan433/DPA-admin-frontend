'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Trash2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { studentsApi, type FeePaymentPayload } from '@/api/students.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { cn } from '@/utils/cn';
import type { Student } from '@/types/academic.types';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

function SummaryCard({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'due' }) {
  return (
    <div className="rounded-xl border border-black/[0.06] px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/40">{label}</p>
      <p
        className={cn(
          'mt-1 font-display text-lg font-semibold',
          tone === 'good' && 'text-success',
          tone === 'due' && 'text-red-600',
          !tone && 'text-ink',
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function FeesTab({ student }: { student: Student }) {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const canEdit = can(PERMISSIONS.STUDENTS_EDIT);

  const payments = [...(student.feePayments || [])].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
  );
  const paid = payments.reduce((sum, p) => sum + p.amount, 0);
  const total = student.totalFees ?? 0;
  const balance = total - paid;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FeePaymentPayload>({
    defaultValues: { paymentDate: new Date().toISOString().slice(0, 10) },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['students', student._id] });
    queryClient.invalidateQueries({ queryKey: ['students'] });
  };

  const addMutation = useMutation({
    mutationFn: (values: FeePaymentPayload) => studentsApi.addFeePayment(student._id, values),
    onSuccess: () => {
      toast.success('Payment recorded');
      reset({ amount: undefined, term: '', account: '', notes: '', paymentDate: new Date().toISOString().slice(0, 10) });
      invalidate();
    },
    onError: (err) => toast.error('Could not record payment', getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (paymentId: string) => studentsApi.removeFeePayment(student._id, paymentId),
    onSuccess: () => {
      toast.success('Payment removed');
      invalidate();
    },
    onError: (err) => toast.error('Could not remove payment', getErrorMessage(err)),
  });

  const recordedByName = (by: Student['feePayments'][number]['recordedBy']) =>
    typeof by === 'string' ? 'Unknown' : `${by.firstName} ${by.lastName}`;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard label="Total Fees" value={total ? inr(total) : 'Not set'} />
        <SummaryCard label="Paid" value={inr(paid)} tone="good" />
        <SummaryCard
          label={balance < 0 ? 'Overpaid' : 'Balance Due'}
          value={inr(Math.abs(balance))}
          tone={balance > 0 ? 'due' : 'good'}
        />
      </div>

      {!total && (
        <p className="text-xs text-ink/45">
          Set the total course fee on the student&apos;s <strong>Edit Student</strong> form to track the balance.
        </p>
      )}

      {canEdit && (
        <form
          onSubmit={handleSubmit((v) => addMutation.mutate(v))}
          className="space-y-3 rounded-xl border border-black/[0.06] p-4"
        >
          <p className="text-sm font-medium text-ink/80">Record a payment</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <Field label="Amount (₹)" htmlFor="amount" error={errors.amount?.message} required>
              <Input
                id="amount"
                type="number"
                min={0}
                step="0.01"
                {...register('amount', { required: 'Required', valueAsNumber: true })}
              />
            </Field>
            <Field label="Term" htmlFor="term">
              <Input id="term" placeholder="Term 1" {...register('term')} />
            </Field>
            <Field label="Account" htmlFor="account">
              <Input id="account" placeholder="Cash / HDFC / UPI" {...register('account')} />
            </Field>
            <Field label="Payment Date" htmlFor="paymentDate" error={errors.paymentDate?.message} required>
              <Input id="paymentDate" type="date" {...register('paymentDate', { required: 'Required' })} />
            </Field>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Field label="Notes" htmlFor="notes">
                <Input id="notes" placeholder="Receipt no., remarks..." {...register('notes')} />
              </Field>
            </div>
            <Button type="submit" isLoading={addMutation.isPending}>
              <Plus className="h-4 w-4" /> Add Payment
            </Button>
          </div>
        </form>
      )}

      {payments.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No payments recorded yet"
          description="Term-wise fee payments for this student will appear here."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] text-left">
                {['Amount', 'Term', 'Account', 'Paid On', 'Recorded By', ''].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink/40"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06]">
              {payments.map((p) => (
                <tr key={p._id}>
                  <td className="px-3 py-3 font-medium text-ink">{inr(p.amount)}</td>
                  <td className="px-3 py-3">
                    {p.term ? <Badge tone="brand">{p.term}</Badge> : <span className="text-ink/30">-</span>}
                  </td>
                  <td className="px-3 py-3 text-ink/70">{p.account || <span className="text-ink/30">-</span>}</td>
                  <td className="px-3 py-3 text-ink/70">{format(new Date(p.paymentDate), 'dd MMM yyyy')}</td>
                  <td className="px-3 py-3">
                    <p className="text-ink/70">{recordedByName(p.recordedBy)}</p>
                    <p className="text-xs text-ink/40">
                      entered {format(new Date(p.recordedAt), 'dd MMM yyyy, h:mm a')}
                    </p>
                    {p.notes && <p className="mt-0.5 text-xs text-ink/45">{p.notes}</p>}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {canEdit && (
                      <button
                        onClick={() => deleteMutation.mutate(p._id)}
                        className="rounded-lg p-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete payment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
