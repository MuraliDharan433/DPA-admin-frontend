'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Field, Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { usersApi, rolesApi, type CreateUserPayload } from '@/api/users.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import type { ManagedUser } from '@/types/user.types';
import type { PermissionKey } from '@/constants/permissions';
import { PermissionMatrix } from './PermissionMatrix';

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  role: string;
  password: string;
  confirmPassword: string;
  status: string;
}

export function UserFormModal({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user?: ManagedUser | null;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!user;
  const { data: roles } = useQuery({ queryKey: ['roles'], queryFn: rolesApi.list, enabled: open });
  const assignableRoles = roles?.filter((r) => r.name !== 'OWNER');

  const [grant, setGrant] = useState<PermissionKey[]>([]);
  const [revoke, setRevoke] = useState<PermissionKey[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: user
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile,
          role: user.role._id,
          status: user.status,
        }
      : { status: 'ACTIVE' },
  });

  useEffect(() => {
    if (open) {
      setSelectedRoleId(user?.role._id || '');
      setGrant(user?.permissionOverrides.grant || []);
      setRevoke(user?.permissionOverrides.revoke || []);
      reset(
        user
          ? {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              mobile: user.mobile,
              role: user.role._id,
              status: user.status,
            }
          : { status: 'ACTIVE' },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  const watchedRole = watch('role');
  const activeRole = roles?.find((r) => r._id === (watchedRole || selectedRoleId));
  const roleBasePermissions = activeRole?.permissions || [];

  const isChecked = (key: PermissionKey) => {
    if (grant.includes(key)) return true;
    if (revoke.includes(key)) return false;
    return roleBasePermissions.includes(key);
  };

  const toggle = (key: PermissionKey) => {
    const currentlyOn = isChecked(key);
    const baseOn = roleBasePermissions.includes(key);
    if (currentlyOn) {
      // turning off
      setGrant((g) => g.filter((k) => k !== key));
      if (baseOn) setRevoke((r) => [...new Set([...r, key])]);
    } else {
      // turning on
      setRevoke((r) => r.filter((k) => k !== key));
      if (!baseOn) setGrant((g) => [...new Set([...g, key])]);
    }
  };

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (isEdit) {
        await usersApi.update(user!._id, {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          mobile: values.mobile,
          role: values.role,
          status: values.status,
        });
        return usersApi.updatePermissions(user!._id, grant, revoke);
      }
      const payload: CreateUserPayload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        mobile: values.mobile,
        role: values.role,
        password: values.password,
        status: values.status,
        permissionGrants: grant,
        permissionRevokes: revoke,
      };
      return usersApi.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'User updated' : 'User created');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
    onError: (err) => toast.error('Could not save user', getErrorMessage(err)),
  });

  const password = watch('password');

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit User' : 'Create User'} size="lg">
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((v) => {
          if (!isEdit && v.password !== v.confirmPassword) {
            toast.error('Passwords do not match');
            return;
          }
          mutation.mutate(v);
        })}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First Name" htmlFor="firstName" error={errors.firstName?.message} required>
            <Input id="firstName" {...register('firstName', { required: 'Required' })} />
          </Field>
          <Field label="Last Name" htmlFor="lastName" error={errors.lastName?.message} required>
            <Input id="lastName" {...register('lastName', { required: 'Required' })} />
          </Field>
          <Field label="Email" htmlFor="email" error={errors.email?.message} required>
            <Input id="email" type="email" {...register('email', { required: 'Required' })} />
          </Field>
          <Field label="Mobile" htmlFor="mobile" error={errors.mobile?.message} required>
            <Input id="mobile" {...register('mobile', { required: 'Required' })} />
          </Field>
          <Field label="Role" htmlFor="role" error={errors.role?.message} required>
            <Select id="role" {...register('role', { required: 'Required' })}>
              <option value="">Select role</option>
              {assignableRoles?.map((r) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Status" htmlFor="status">
            <Select id="status" {...register('status')}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </Select>
          </Field>
          {!isEdit && (
            <>
              <Field label="Password" htmlFor="password" error={errors.password?.message} required>
                <Input id="password" type="password" {...register('password', { required: 'Required' })} />
              </Field>
              <Field
                label="Confirm Password"
                htmlFor="confirmPassword"
                error={
                  password && watch('confirmPassword') && password !== watch('confirmPassword')
                    ? 'Passwords do not match'
                    : undefined
                }
                required
              >
                <Input id="confirmPassword" type="password" {...register('confirmPassword', { required: 'Required' })} />
              </Field>
            </>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink/80">Permissions</p>
          <p className="mb-2 text-xs text-ink/45">
            Checked items reflect the role&apos;s defaults. Toggle any permission to grant or revoke it for this user
            specifically.
          </p>
          <PermissionMatrix checked={isChecked} onToggle={toggle} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
