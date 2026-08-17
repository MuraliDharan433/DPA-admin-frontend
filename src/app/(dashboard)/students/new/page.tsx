import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { StudentFormPage } from '@/features/students/StudentFormPage';

export default function Page() {
  return (
    <RequirePermission permissions={[PERMISSIONS.STUDENTS_CREATE]}>
      <StudentFormPage />
    </RequirePermission>
  );
}
