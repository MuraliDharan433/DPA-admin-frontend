import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
        <Icon className="h-6 w-6 text-brand-400" aria-hidden />
      </div>
      <div>
        <p className="font-display text-sm font-semibold text-ink">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-ink/50">{description}</p>}
      </div>
      {action}
    </div>
  );
}
