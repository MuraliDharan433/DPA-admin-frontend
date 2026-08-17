'use client';

import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

export function Modal({ open, onClose, title, description, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        className={cn(
          'relative flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-white shadow-lift sm:rounded-2xl',
          SIZE_CLASSES[size],
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between border-b border-black/[0.06] px-5 py-4">
          <div>
            <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-ink/50">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-ink/40 hover:bg-black/[0.04] hover:text-ink/70"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
