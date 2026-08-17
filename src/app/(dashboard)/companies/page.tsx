import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { CompaniesPage } from '@/features/companies/CompaniesPage';

export default function Page() {
  return (
    <RequirePermission permissions={[PERMISSIONS.PLACEMENTS_VIEW]}>
      <CompaniesPage />
    </RequirePermission>
  );
}
