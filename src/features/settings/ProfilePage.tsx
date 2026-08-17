'use client';

import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';

export function ProfilePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
  });

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        {isLoading || !profile ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink/40">Name</dt>
              <dd className="mt-1 text-sm text-ink">
                {profile.firstName} {profile.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink/40">Email</dt>
              <dd className="mt-1 text-sm text-ink">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink/40">Mobile</dt>
              <dd className="mt-1 text-sm text-ink">{profile.mobile}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink/40">Role</dt>
              <dd className="mt-1">
                <Badge tone="brand">{profile.role.name}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink/40">Status</dt>
              <dd className="mt-1">
                <Badge tone={profile.status === 'ACTIVE' ? 'success' : 'neutral'}>{profile.status}</Badge>
              </dd>
            </div>
          </dl>
        )}
      </CardBody>
    </Card>
  );
}
