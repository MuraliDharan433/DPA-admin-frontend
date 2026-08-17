import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { EnquiryDetailPage } from '@/features/enquiries/EnquiryDetailPage';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RequirePermission permissions={[PERMISSIONS.ENQUIRIES_VIEW]}>
      <EnquiryDetailPage enquiryId={id} />
    </RequirePermission>
  );
}
