import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { CoursesPage } from '@/features/courses/CoursesPage';

export default function Page() {
  return (
    <RequirePermission permissions={[PERMISSIONS.COURSES_VIEW]}>
      <CoursesPage />
    </RequirePermission>
  );
}
