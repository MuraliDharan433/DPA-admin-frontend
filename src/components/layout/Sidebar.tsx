'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown, GraduationCap, X } from 'lucide-react';
import { NAV_ITEMS, type NavItem } from '@/constants/navigation';
import { usePermission } from '@/hooks/usePermission';
import { cn } from '@/utils/cn';

function isVisible(item: NavItem, can: (p: NavItem['permission']) => boolean): boolean {
  if (item.permission && !can(item.permission)) return false;
  return true;
}

interface Leaf {
  /** Full href as declared in NAV_ITEMS, query string included where present. */
  full: string;
  /** Same href with any query string stripped. */
  base: string;
}

function collectLeaves(items: NavItem[]): Leaf[] {
  const leaves: Leaf[] = [];
  const walk = (list: NavItem[]) => {
    for (const item of list) {
      if (item.children?.length) walk(item.children);
      else if (item.to) leaves.push({ full: item.to, base: item.to.split('?')[0] });
    }
  };
  walk(items);
  return leaves;
}

/**
 * Picks exactly one nav item's href as "active" for the current URL, instead of letting
 * every item whose href happens to prefix- or base-match light up together (e.g. "All
 * Students" matching "/students/new" too, or "All Enquiries"/"New"/"Converted" all
 * matching "/enquiries" regardless of the ?status= filter actually applied).
 *
 * 1. An exact full match (path + query) wins outright.
 * 2. Otherwise, among items sharing the current path, a query-less "default" entry wins
 *    (e.g. "All Enquiries" when the current status filter has no dedicated shortcut).
 * 3. Otherwise, the longest matching path prefix wins (e.g. a student's profile page
 *    keeps "All Students" highlighted).
 */
function findActiveHref(pathname: string, queryString: string, leaves: Leaf[]): string | null {
  const current = pathname + (queryString ? `?${queryString}` : '');

  const exact = leaves.find((l) => l.full === current);
  if (exact) return exact.full;

  const sameBase = leaves.filter((l) => l.base === pathname);
  const bare = sameBase.find((l) => !l.full.includes('?'));
  if (bare) return bare.full;

  let best: string | null = null;
  for (const { base } of leaves) {
    if (base === '/dashboard') continue;
    if (pathname.startsWith(`${base}/`) && (!best || base.length > best.length)) {
      best = base;
    }
  }
  return best;
}

function SidebarLink({ item, activeHref }: { item: NavItem; activeHref: string | null }) {
  const hasChildren = !!item.children?.length;
  const { can } = usePermission();
  const visibleChildren = item.children?.filter((c) => isVisible(c, (p) => !!p && can(p)));
  const childHrefs = visibleChildren?.map((c) => c.to?.split('?')[0]).filter(Boolean) ?? [];
  const isChildActive = !!activeHref && childHrefs.includes(activeHref.split('?')[0]);
  const [open, setOpen] = useState(!!isChildActive);

  if (hasChildren) {
    if (!visibleChildren?.length) return null;
    const panelId = `nav-group-${item.label.toLowerCase().replace(/\s+/g, '-')}`;
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
            isChildActive ? 'text-brand-700' : 'text-white/70 hover:bg-white/5 hover:text-white',
          )}
        >
          <span className="flex items-center gap-2.5">
            {item.icon && <item.icon className="h-4 w-4" strokeWidth={1.75} />}
            {item.label}
          </span>
          <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180')} aria-hidden />
        </button>
        {open && (
          <div id={panelId} className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-white/10 pl-3">
            {visibleChildren.map((child) => (
              <SidebarLink key={child.label} item={child} activeHref={activeHref} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isActive = !!activeHref && activeHref === item.to;

  return (
    <Link
      href={item.to || '#'}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
        isActive ? 'bg-brand-600 text-white shadow-soft' : 'text-white/70 hover:bg-white/5 hover:text-white',
      )}
    >
      {item.icon && <item.icon className="h-4 w-4" strokeWidth={1.75} />}
      {item.label}
    </Link>
  );
}

function SidebarNav({ visibleItems, activeHref }: { visibleItems: NavItem[]; activeHref: string | null }) {
  return (
    <nav aria-label="Primary" className="scrollbar-none flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
      {visibleItems.map((item) => (
        <SidebarLink key={item.label} item={item} activeHref={activeHref} />
      ))}
    </nav>
  );
}

/** Reads the query string - isolated behind Suspense so it never blocks the rest of the
 *  (always-rendered) nav chrome from appearing instantly. */
function SidebarNavWithQuery({ visibleItems }: { visibleItems: NavItem[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const leaves = collectLeaves(visibleItems);
  const activeHref = findActiveHref(pathname, searchParams.toString(), leaves);
  return <SidebarNav visibleItems={visibleItems} activeHref={activeHref} />;
}

export function SidebarContent() {
  const { can } = usePermission();
  const pathname = usePathname();
  const visibleItems = NAV_ITEMS.filter((item) => isVisible(item, (p) => !!p && can(p)));
  // Fallback (no query awareness) so the nav never flashes blank while the
  // query-string-aware version resolves.
  const fallbackActiveHref = findActiveHref(pathname, '', collectLeaves(visibleItems));

  return (
    <div className="flex h-full flex-col bg-navy">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
          <GraduationCap className="h-4 w-4 text-white" strokeWidth={2} />
        </div>
        <span className="font-display text-sm font-semibold tracking-tight text-white">Institute Admin</span>
      </div>
      <Suspense fallback={<SidebarNav visibleItems={visibleItems} activeHref={fallbackActiveHref} />}>
        <SidebarNavWithQuery visibleItems={visibleItems} />
      </Suspense>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-black/5 lg:block">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-navy/50" onClick={onClose} />
      <div className="relative flex h-full w-72 flex-col">
        <button
          onClick={onClose}
          className="absolute right-3 top-4 z-10 rounded-lg p-1.5 text-white/60 hover:bg-white/10"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </div>
    </div>
  );
}
