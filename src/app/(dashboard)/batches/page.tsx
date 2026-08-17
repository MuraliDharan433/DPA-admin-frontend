import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { BatchesPage } from '@/features/batches/BatchesPage';

export default function Page() {
  return (
    <RequirePermission permissions={[PERMISSIONS.BATCHES_VIEW]}>
      <BatchesPage />
    </RequirePermission>
  );
}
