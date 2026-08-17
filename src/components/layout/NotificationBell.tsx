'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCheck } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { notificationsApi, type AppNotification } from '@/api/notifications.api';
import { useAuthStore } from '@/store/auth.store';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { toast } from '@/store/toast.store';
import { cn } from '@/utils/cn';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.unreadCount,
    enabled: !!accessToken,
    refetchInterval: 60_000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationsApi.list({ limit: 10 }),
    enabled: open,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!accessToken) {
      disconnectSocket();
      return;
    }
    const socket = connectSocket(accessToken);
    const onNotification = (payload: AppNotification) => {
      toast.info(payload.title, payload.message);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };
    socket.on('notification', onNotification);
    return () => {
      socket.off('notification', onNotification);
    };
  }, [accessToken, queryClient]);

  const handleClick = (n: AppNotification) => {
    if (!n.isRead) markReadMutation.mutate(n._id);
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-ink/60 transition-colors hover:bg-black/[0.04]"
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {!!unreadCount && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white" aria-hidden>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div role="menu" aria-label="Notifications" className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-black/[0.06] bg-white shadow-lift">
            <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
              <p className="text-sm font-semibold text-ink">Notifications</p>
              {!!unreadCount && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-2 p-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : !data?.data.length ? (
                <EmptyState title="No notifications yet" description="You're all caught up." />
              ) : (
                data.data.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => handleClick(n)}
                    className={cn(
                      'block w-full border-b border-black/[0.04] px-4 py-3 text-left last:border-0 hover:bg-black/[0.02]',
                      !n.isRead && 'bg-brand-50/50',
                    )}
                  >
                    <p className="text-sm font-medium text-ink">{n.title}</p>
                    {n.message && <p className="mt-0.5 text-xs text-ink/50">{n.message}</p>}
                    <p className="mt-1 text-[11px] text-ink/35">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
