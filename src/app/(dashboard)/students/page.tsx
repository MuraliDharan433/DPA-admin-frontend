import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { StudentsListPage } from '@/features/students/StudentsListPage';

export default function Page() {
  return (
    <RequirePermission permissions={[PERMISSIONS.STUDENTS_VIEW]}>
      <StudentsListPage />
    </RequirePermission>
  );
}
