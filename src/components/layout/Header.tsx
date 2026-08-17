'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Menu, LogOut, User as UserIcon, KeyRound, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api/auth.api';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { toast } from '@/store/toast.store';
import { cn } from '@/utils/cn';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearSession();
      queryClient.clear();
      toast.success('Logged out');
      router.replace('/login');
    },
  });

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || user.email[0]?.toUpperCase() || 'U'
    : 'U';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-black/[0.06] bg-white/80 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-ink/60 hover:bg-black/[0.04] lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden text-sm text-ink/40 lg:block" />

      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Account menu for ${fullName || user?.email || 'user'}`}
            className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-black/[0.04]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {initials}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-tight text-ink">{fullName || user?.email}</p>
              <p className="text-xs leading-tight text-ink/45">{user?.roleName}</p>
            </div>
            <ChevronDown className={cn('h-4 w-4 text-ink/40 transition-transform duration-200', menuOpen && 'rotate-180')} aria-hidden />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div
                role="menu"
                aria-label="Account menu"
                className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-black/[0.06] bg-white p-1.5 shadow-lift"
              >
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push('/settings/profile');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink/70 transition-colors hover:bg-black/[0.04]"
                >
                  <UserIcon className="h-4 w-4" /> My Profile
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push('/settings/change-password');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink/70 transition-colors hover:bg-black/[0.04]"
                >
                  <KeyRound className="h-4 w-4" /> Change Password
                </button>
                <div className="my-1 border-t border-black/[0.06]" />
                <button
                  role="menuitem"
                  onClick={() => logoutMutation.mutate()}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
