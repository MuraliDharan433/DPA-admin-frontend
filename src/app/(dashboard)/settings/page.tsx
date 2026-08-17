import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { InstituteSettingsPage } from '@/features/settings/InstituteSettingsPage';

export default function Page() {
  return (
    <RequirePermission permissions={[PERMISSIONS.SETTINGS_VIEW]}>
      <InstituteSettingsPage />
    </RequirePermission>
  );
}
