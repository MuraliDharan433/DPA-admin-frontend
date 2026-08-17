import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-50/40 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <ShieldAlert className="h-7 w-7 text-red-500" />
      </div>
      <h1 className="font-display text-2xl font-semibold text-ink">Access denied</h1>
      <p className="max-w-sm text-sm text-ink/50">
        You don&apos;t have permission to view this page. Contact your administrator if you believe
        this is a mistake.
      </p>
      <Link href="/dashboard">
        <Button variant="outline">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
