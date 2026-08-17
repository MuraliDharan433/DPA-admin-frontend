import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { BatchDetailPage } from '@/features/batches/BatchDetailPage';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RequirePermission permissions={[PERMISSIONS.BATCHES_VIEW]}>
      <BatchDetailPage batchId={id} />
    </RequirePermission>
  );
}
