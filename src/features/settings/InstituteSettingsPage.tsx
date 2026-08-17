'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { settingsApi, type SettingsPayload } from '@/api/settings.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants/permissions';

export function InstituteSettingsPage() {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get });

  const { register, handleSubmit } = useForm<SettingsPayload>({
    values: settings
      ? {
          instituteName: settings.instituteName,
          instituteEmail: settings.instituteEmail || '',
          institutePhone: settings.institutePhone || '',
          instituteAddress: settings.instituteAddress || '',
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (values: SettingsPayload) => settingsApi.update(values),
    onSuccess: () => {
      toast.success('Settings updated');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (err) => toast.error('Could not update settings', getErrorMessage(err)),
  });

  const canEdit = can(PERMISSIONS.SETTINGS_EDIT);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink/50">Institute-wide configuration.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Institute Details</CardTitle>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <form
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              onSubmit={handleSubmit((v) => mutation.mutate(v))}
            >
              <div className="sm:col-span-2">
                <Field label="Institute Name" htmlFor="instituteName">
                  <Input id="instituteName" disabled={!canEdit} {...register('instituteName')} />
                </Field>
              </div>
              <Field label="Institute Email" htmlFor="instituteEmail">
                <Input id="instituteEmail" type="email" disabled={!canEdit} {...register('instituteEmail')} />
              </Field>
              <Field label="Institute Phone" htmlFor="institutePhone">
                <Input id="institutePhone" disabled={!canEdit} {...register('institutePhone')} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Institute Address" htmlFor="instituteAddress">
                  <Input id="instituteAddress" disabled={!canEdit} {...register('instituteAddress')} />
                </Field>
              </div>
              {canEdit && (
                <div className="sm:col-span-2">
                  <Button type="submit" isLoading={mutation.isPending}>
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
