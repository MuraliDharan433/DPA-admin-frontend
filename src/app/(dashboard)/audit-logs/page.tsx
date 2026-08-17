import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { AuditLogsPage } from '@/features/auditLogs/AuditLogsPage';

export default function Page() {
  return (
    <RequirePermission permissions={[PERMISSIONS.AUDIT_LOGS_VIEW]}>
      <AuditLogsPage />
    </RequirePermission>
  );
}
