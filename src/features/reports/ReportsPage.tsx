'use client';

import { useState } from 'react';
import { Download, GraduationCap, Inbox, Briefcase } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { reportsApi } from '@/api/reports.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS, type PermissionKey } from '@/constants/permissions';

const REPORTS: {
  key: string;
  icon: typeof GraduationCap;
  title: string;
  description: string;
  action: () => Promise<void>;
  requiresPermission?: PermissionKey;
}[] = [
  {
    key: 'students',
    icon: GraduationCap,
    title: 'Students',
    description: 'All student records with course, batch and placement status.',
    action: reportsApi.exportStudents,
  },
  {
    key: 'enquiries',
    icon: Inbox,
    title: 'Enquiries',
    description: 'Enquiries visible to you, including status, source and assignment.',
    action: reportsApi.exportEnquiries,
    requiresPermission: PERMISSIONS.ENQUIRIES_VIEW,
  },
  {
    key: 'placements',
    icon: Briefcase,
    title: 'Placements',
    description: 'Job applications across all students, companies and statuses.',
    action: reportsApi.exportPlacements,
  },
];

export function ReportsPage() {
  const { can } = usePermission();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const handleExport = async (key: string, action: () => Promise<void>) => {
    setLoadingKey(key);
    try {
      await action();
      toast.success('Export ready', 'Your download should start shortly.');
    } catch (err) {
      toast.error('Could not export report', getErrorMessage(err));
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Reports</h1>
        <p className="mt-1 text-sm text-ink/50">Export your institute&apos;s data as an Excel spreadsheet.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.filter((r) => !r.requiresPermission || can(r.requiresPermission)).map((report) => (
          <Card key={report.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <report.icon className="h-4 w-4 text-brand-500" /> {report.title}
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-sm text-ink/60">{report.description}</p>
              <Button
                variant="outline"
                onClick={() => handleExport(report.key, report.action)}
                isLoading={loadingKey === report.key}
              >
                <Download className="h-4 w-4" /> Export Excel
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
