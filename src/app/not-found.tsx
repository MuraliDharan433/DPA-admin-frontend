import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-50/40 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
        <Compass className="h-7 w-7 text-brand-400" />
      </div>
      <h1 className="font-display text-2xl font-semibold text-ink">Page not found</h1>
      <p className="max-w-sm text-sm text-ink/50">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link href="/dashboard">
        <Button variant="outline">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
