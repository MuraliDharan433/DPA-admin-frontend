import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { StudentProfilePage } from '@/features/students/StudentProfilePage';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RequirePermission permissions={[PERMISSIONS.STUDENTS_VIEW]}>
      <StudentProfilePage studentId={id} />
    </RequirePermission>
  );
}
