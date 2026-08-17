import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { FollowUpsPage } from '@/features/enquiries/FollowUpsPage';

export default function Page() {
  return (
    <RequirePermission permissions={[PERMISSIONS.ENQUIRIES_VIEW]}>
      <FollowUpsPage />
    </RequirePermission>
  );
}
