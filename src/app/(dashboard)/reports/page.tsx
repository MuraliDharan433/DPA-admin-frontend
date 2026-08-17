import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { ReportsPage } from '@/features/reports/ReportsPage';

export default function Page() {
  return (
    <RequirePermission permissions={[PERMISSIONS.REPORTS_VIEW]}>
      <ReportsPage />
    </RequirePermission>
  );
}
