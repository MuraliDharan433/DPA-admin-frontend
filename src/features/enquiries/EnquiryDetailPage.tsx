'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { ArrowLeft, Mail, Phone, ArrowRightCircle, Trash2, Plus } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { enquiriesApi } from '@/api/enquiries.api';
import { usersApi } from '@/api/users.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { ENQUIRY_STATUS_TONE, humanizeEnum } from '@/utils/statusTones';
import { ConvertEnquiryModal } from './ConvertEnquiryModal';
import type { FollowUp, UserRef } from '@/types/enquiry.types';

const STATUSES = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'INTERESTED', 'NOT_INTERESTED', 'CONVERTED', 'LOST'];

interface FollowUpForm {
  followUpDate: string;
  followUpTime?: string;
  notes?: string;
  assignedUser: string;
}

export function EnquiryDetailPage({ enquiryId }: { enquiryId: string }) {
  const router = useRouter();
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [convertOpen, setConvertOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: enquiry, isLoading, isError, refetch } = useQuery({
    queryKey: ['enquiries', enquiryId],
    queryFn: () => enquiriesApi.getById(enquiryId),
  });
  const { data: followUps } = useQuery({
    queryKey: ['enquiries', enquiryId, 'follow-ups'],
    queryFn: () => enquiriesApi.listFollowUps(enquiryId),
    enabled: !!enquiry,
  });
  /** Counselors call/handle enquiries day-to-day, but Admins also manage students directly -
   * both are valid assignees for an enquiry itself and for follow-up tasks on it. */
  const { data: assignees } = useQuery({
    queryKey: ['users', 'lookup', 'COUNSELOR,ADMIN'],
    queryFn: () => usersApi.lookup('COUNSELOR,ADMIN'),
    enabled: can(PERMISSIONS.ENQUIRIES_ASSIGN) || can(PERMISSIONS.ENQUIRIES_EDIT),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => enquiriesApi.updateStatus(enquiryId, status),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['enquiries', enquiryId] });
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
    },
    onError: (err) => toast.error('Could not update status', getErrorMessage(err)),
  });

  const assignMutation = useMutation({
    mutationFn: (assignedTo: string) => enquiriesApi.assign(enquiryId, assignedTo),
    onSuccess: () => {
      toast.success('Enquiry assigned');
      queryClient.invalidateQueries({ queryKey: ['enquiries', enquiryId] });
    },
    onError: (err) => toast.error('Could not assign enquiry', getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => enquiriesApi.remove(enquiryId),
    onSuccess: () => {
      toast.success('Enquiry deleted');
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      router.push('/enquiries');
    },
    onError: (err) => toast.error('Could not delete enquiry', getErrorMessage(err)),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FollowUpForm>();
  const addFollowUpMutation = useMutation({
    mutationFn: (values: FollowUpForm) => enquiriesApi.addFollowUp(enquiryId, values),
    onSuccess: () => {
      toast.success('Follow-up scheduled');
      reset();
      queryClient.invalidateQueries({ queryKey: ['enquiries', enquiryId, 'follow-ups'] });
    },
    onError: (err) => toast.error('Could not add follow-up', getErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Card><CardBody className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></CardBody></Card>
      </div>
    );
  }
  if (isError || !enquiry) return <ErrorState message="Could not load this enquiry." onRetry={refetch} />;

  const assignedLabel = (a?: UserRef | string) =>
    !a ? 'Unassigned' : typeof a === 'string' ? a : `${a.firstName} ${a.lastName}`;

  return (
    <div className="space-y-4">
      <button onClick={() => router.push('/enquiries')} className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink/80">
        <ArrowLeft className="h-4 w-4" /> Back to Enquiries
      </button>

      <Card>
        <CardBody className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">{enquiry.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink/60">
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {enquiry.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {enquiry.mobile}</span>
              {enquiry.course && <Badge tone="brand">{enquiry.course}</Badge>}
            </div>
            <p className="mt-2 text-xs text-ink/40">
              Assigned to: {assignedLabel(enquiry.assignedTo)} &middot; Received{' '}
              {format(new Date(enquiry.createdAt), 'dd MMM yyyy, h:mm a')} &middot; Source: {humanizeEnum(enquiry.source)}
            </p>
            {enquiry.message && <p className="mt-3 max-w-lg text-sm text-ink/70">&quot;{enquiry.message}&quot;</p>}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <Badge tone={ENQUIRY_STATUS_TONE[enquiry.status]}>{humanizeEnum(enquiry.status)}</Badge>
            <div className="flex gap-2">
              {can(PERMISSIONS.ENQUIRIES_EDIT) && enquiry.status !== 'CONVERTED' && (
                <Button size="sm" onClick={() => setConvertOpen(true)}>
                  <ArrowRightCircle className="h-4 w-4" /> Convert to Student
                </Button>
              )}
              {can(PERMISSIONS.ENQUIRIES_DELETE) && (
                <Button size="sm" variant="outline" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {can(PERMISSIONS.ENQUIRIES_EDIT) && (
          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardBody>
              <Select
                value={enquiry.status}
                onChange={(e) => statusMutation.mutate(e.target.value)}
                disabled={statusMutation.isPending}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{humanizeEnum(s)}</option>
                ))}
              </Select>
            </CardBody>
          </Card>
        )}
        {can(PERMISSIONS.ENQUIRIES_ASSIGN) && (
          <Card>
            <CardHeader><CardTitle>Assign To</CardTitle></CardHeader>
            <CardBody>
              <Select
                defaultValue={typeof enquiry.assignedTo === 'string' ? enquiry.assignedTo : enquiry.assignedTo?._id || ''}
                onChange={(e) => e.target.value && assignMutation.mutate(e.target.value)}
                disabled={assignMutation.isPending}
              >
                <option value="">Unassigned</option>
                {assignees?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.firstName} {c.lastName}
                  </option>
                ))}
              </Select>
            </CardBody>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>Follow-ups</CardTitle></CardHeader>
        <CardBody className="space-y-4">
          {can(PERMISSIONS.ENQUIRIES_EDIT) && (
            <form
              onSubmit={handleSubmit((v) => addFollowUpMutation.mutate(v))}
              className="grid grid-cols-1 gap-3 rounded-xl border border-black/[0.06] p-3 sm:grid-cols-4"
            >
              <Input type="date" {...register('followUpDate', { required: true })} />
              <Input type="time" {...register('followUpTime')} />
              <Select {...register('assignedUser', { required: true })}>
                <option value="">Assign to...</option>
                {assignees?.map((c) => (
                  <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
                ))}
              </Select>
              <Button type="submit" isLoading={addFollowUpMutation.isPending}>
                <Plus className="h-4 w-4" /> Schedule
              </Button>
              <div className="sm:col-span-4">
                <Input placeholder="Notes (optional)" {...register('notes')} />
              </div>
              {(errors.followUpDate || errors.assignedUser) && (
                <p className="text-xs text-red-500 sm:col-span-4">Follow-up date and assignee are required.</p>
              )}
            </form>
          )}
          {!followUps || followUps.length === 0 ? (
            <EmptyState title="No follow-ups yet" description="Schedule a follow-up to keep this lead moving." />
          ) : (
            <div className="space-y-2">
              {followUps.map((f: FollowUp) => (
                <div key={f._id} className="flex items-center justify-between rounded-xl border border-black/[0.06] p-3">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {format(new Date(f.followUpDate), 'dd MMM yyyy')} {f.followUpTime && `at ${f.followUpTime}`}
                    </p>
                    {f.notes && <p className="text-xs text-ink/50">{f.notes}</p>}
                    <p className="text-xs text-ink/40">With {assignedLabel(f.assignedUser)}</p>
                  </div>
                  <Badge tone={f.status === 'COMPLETED' ? 'success' : f.status === 'CANCELLED' ? 'danger' : 'warning'}>
                    {humanizeEnum(f.status)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <ConvertEnquiryModal open={convertOpen} onClose={() => setConvertOpen(false)} enquiryId={enquiryId} />
      <ConfirmDialog
        open={deleteOpen}
        title="Delete enquiry?"
        description="This will permanently remove this enquiry and cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
