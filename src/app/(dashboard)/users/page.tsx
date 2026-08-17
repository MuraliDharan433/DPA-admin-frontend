import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { UsersPage } from '@/features/users/UsersPage';

export default function Page() {
  return (
    <RequirePermission permissions={[PERMISSIONS.USERS_VIEW]}>
      <UsersPage />
    </RequirePermission>
  );
}
