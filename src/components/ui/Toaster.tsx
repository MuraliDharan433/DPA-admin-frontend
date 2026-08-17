'use client';

import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '@/store/toast.store';
import { cn } from '@/utils/cn';

const VARIANT_STYLES = {
  success: { icon: CheckCircle2, iconClass: 'text-success', ring: 'ring-success/20' },
  error: { icon: XCircle, iconClass: 'text-red-500', ring: 'ring-red-200' },
  info: { icon: Info, iconClass: 'text-brand-500', ring: 'ring-brand-200' },
} as const;

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const variant = VARIANT_STYLES[t.variant];
        const Icon = variant.icon;
        return (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border border-black/5 bg-white p-4 shadow-lift ring-1 transition-all',
              variant.ring,
            )}
            role="alert"
          >
            <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', variant.iconClass)} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{t.title}</p>
              {t.description && <p className="mt-0.5 text-sm text-ink/60">{t.description}</p>}
            </div>
            <button onClick={() => dismiss(t.id)} className="text-ink/30 hover:text-ink/60" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
