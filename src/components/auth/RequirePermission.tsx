'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import type { PermissionKey } from '@/constants/permissions';
import { usePermission } from '@/hooks/usePermission';
import { FullPageSpinner } from '@/components/ui/FullPageSpinner';

/** Gates a page's content behind ANY of the listed permissions, redirecting to /403 otherwise. */
export function RequirePermission({
  permissions,
  children,
}: {
  permissions: PermissionKey[];
  children: ReactNode;
}) {
  const { canAny } = usePermission();
  const router = useRouter();
  const allowed = canAny(permissions);

  useEffect(() => {
    if (!allowed) router.replace('/403');
  }, [allowed, router]);

  if (!allowed) return <FullPageSpinner />;
  return <>{children}</>;
}
