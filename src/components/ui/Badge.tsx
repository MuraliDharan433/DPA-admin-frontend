import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type Tone = 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'cyan';

const TONE_CLASSES: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  neutral: 'bg-black/[0.04] text-ink/60 ring-black/10',
  cyan: 'bg-sky-50 text-sky-700 ring-sky-200',
};

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    />
  );
}
