import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { PlacementsPage } from '@/features/placements/PlacementsPage';

export default function Page() {
  return (
    <RequirePermission permissions={[PERMISSIONS.PLACEMENTS_VIEW]}>
      <PlacementsPage />
    </RequirePermission>
  );
}
