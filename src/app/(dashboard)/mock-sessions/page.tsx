import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { MockSessionsPage } from '@/features/mockSessions/MockSessionsPage';

export default function Page() {
  return (
    <RequirePermission permissions={[PERMISSIONS.MOCK_VIEW]}>
      <MockSessionsPage />
    </RequirePermission>
  );
}
