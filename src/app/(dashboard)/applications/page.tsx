import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { ApplicationsPage } from '@/features/applications/ApplicationsPage';

export default function Page() {
  return (
    <RequirePermission permissions={[PERMISSIONS.PLACEMENTS_VIEW]}>
      <ApplicationsPage />
    </RequirePermission>
  );
}
