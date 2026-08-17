'use client';

import { GraduationCap } from 'lucide-react';

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mb-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-lg font-semibold text-ink">Institute Admin</span>
        </div>
        {children}
      </div>
      <div className="relative hidden overflow-hidden bg-navy lg:block">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, var(--color-brand-600) 0%, transparent 45%), radial-gradient(circle at 80% 70%, var(--color-cyan-accent) 0%, transparent 40%)',
          }}
        />
        <div className="relative flex h-full flex-col justify-end p-16 text-white">
          <h2 className="font-display text-3xl font-semibold leading-tight">
            Run your training &amp; placement institute from one place.
          </h2>
          <p className="mt-4 max-w-md text-white/60">
            Students, enquiries, batches, placements and your team - all connected, all
            permission-controlled.
          </p>
        </div>
      </div>
    </div>
  );
}
