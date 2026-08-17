import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { StudentFormPage } from '@/features/students/StudentFormPage';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RequirePermission permissions={[PERMISSIONS.STUDENTS_EDIT]}>
      <StudentFormPage studentId={id} />
    </RequirePermission>
  );
}
