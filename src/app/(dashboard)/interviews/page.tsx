import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { InterviewsPage } from '@/features/interviews/InterviewsPage';

export default function Page() {
  return (
    <RequirePermission permissions={[PERMISSIONS.PLACEMENTS_VIEW]}>
      <InterviewsPage />
    </RequirePermission>
  );
}
