'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Check, Copy } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { usersApi } from '@/api/users.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import type { ManagedUser } from '@/types/user.types';

export function ResetPasswordModal({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: ManagedUser | null;
}) {
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: () => usersApi.resetPassword(user!._id),
    onSuccess: (data) => {
      setTempPassword(data.temporaryPassword);
      toast.success('Password reset');
    },
    onError: (err) => toast.error('Could not reset password', getErrorMessage(err)),
  });

  const handleClose = () => {
    setTempPassword(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Reset Password" size="sm">
      {!tempPassword ? (
        <div className="space-y-4">
          <p className="text-sm text-ink/60">
            This generates a new temporary password for <strong>{user?.email}</strong>. Share it with them
            securely - they should change it after signing in.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={() => mutation.mutate()} isLoading={mutation.isPending}>Reset Password</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-ink/60">Share this temporary password securely - it won&apos;t be shown again.</p>
          <div className="flex items-center justify-between rounded-lg border border-black/10 bg-black/[0.02] px-3 py-2.5">
            <code className="font-mono text-sm text-ink">{tempPassword}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(tempPassword);
                setCopied(true);
                toast.success('Copied to clipboard');
              }}
              className="text-ink/50 hover:text-ink/80"
            >
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Done</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
