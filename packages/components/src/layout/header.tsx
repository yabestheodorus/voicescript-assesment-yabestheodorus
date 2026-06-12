'use client';

import { clsx } from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Avatar } from '../ui/avatar';
import {
  FiSearch,
  FiBell,
  FiChevronDown,
  FiUser,
  FiSettings,
  FiLogOut,
} from '../icons';

const SEGMENT_LABELS: Record<string, string> = {
  '': 'Dashboard',
  jobs: 'Jobs',
  reporters: 'Reporters',
  payments: 'Payments',
};

function buildCrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [{ label: 'Dashboard', href: '/' }];
  let href = '';
  for (const segment of segments) {
    href += `/${segment}`;
    crumbs.push({
      label: SEGMENT_LABELS[segment] ?? decodeURIComponent(segment),
      href,
    });
  }
  return crumbs;
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const crumbs = buildCrumbs(pathname);
  const title = crumbs[crumbs.length - 1]?.label ?? 'Dashboard';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-surface-200 bg-surface-0/95 px-4 backdrop-blur sm:px-6">
      {/* Title + breadcrumb */}
      <div className="min-w-0">
        <nav className="hidden items-center gap-1.5 text-xs text-surface-400 sm:flex">
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 ? <span>/</span> : null}
              {i < crumbs.length - 1 ? (
                <Link
                  href={crumb.href}
                  className="transition-colors hover:text-surface-600"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-surface-500">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
        <h2 className="truncate font-heading text-lg font-bold text-surface-900">
          {title}
        </h2>
      </div>

      {/* Search */}
      <div className="ml-auto hidden max-w-xs flex-1 md:block">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-surface-400" />
          <input
            type="search"
            placeholder="Search jobs, reporters…"
            className="h-9 w-full rounded-lg border border-surface-200 bg-surface-50 pl-9 pr-3 text-sm text-surface-700 placeholder:text-surface-400 focus:border-brand-400 focus:bg-surface-0 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      {/* Notifications */}
      <button
        type="button"
        className="relative flex size-9 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-800 md:ml-0"
        aria-label="Notifications"
      >
        <FiBell className="size-5" />
        <span className="absolute right-1.5 top-1.5 flex size-2 items-center justify-center">
          <span className="absolute inline-flex size-2 animate-ping rounded-full bg-danger-500 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-danger-500" />
        </span>
      </button>

      {/* Profile menu */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-surface-100"
        >
          <Avatar name="Dana Whitfield" size="sm" />
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-semibold leading-tight text-surface-800">
              Dana Whitfield
            </span>
            <span className="block text-xs leading-tight text-surface-400">
              Agency Admin
            </span>
          </span>
          <FiChevronDown
            className={clsx(
              'size-4 text-surface-400 transition-transform',
              menuOpen && 'rotate-180',
            )}
          />
        </button>

        {menuOpen ? (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-surface-200 bg-surface-0 py-1 shadow-lg">
              <div className="border-b border-surface-100 px-4 py-3">
                <p className="text-sm font-semibold text-surface-800">
                  Dana Whitfield
                </p>
                <p className="truncate text-xs text-surface-400">
                  dana@voicescript.agency
                </p>
              </div>
              {[
                { label: 'My profile', icon: FiUser },
                { label: 'Settings', icon: FiSettings },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-surface-600 transition-colors hover:bg-surface-50"
                >
                  <item.icon className="size-4 text-surface-400" />
                  {item.label}
                </button>
              ))}
              <div className="my-1 border-t border-surface-100" />
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-danger-600 transition-colors hover:bg-danger-50"
              >
                <FiLogOut className="size-4" />
                Sign out
              </button>
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
}
