import { Suspense } from 'react';
import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { EnquiriesListPage } from '@/features/enquiries/EnquiriesListPage';

export default function Page() {
  return (
    <RequirePermission permissions={[PERMISSIONS.ENQUIRIES_VIEW]}>
      <Suspense>
        <EnquiriesListPage />
      </Suspense>
    </RequirePermission>
  );
}
