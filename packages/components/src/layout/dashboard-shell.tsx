'use client';

import { clsx } from 'clsx';
import { useState, type ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';

/**
 * App shell: owns the collapsed state shared between the sidebar and the
 * main column. Page content is passed as `children` and stays server-rendered.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />
      <div
        className={clsx(
          'flex min-h-screen flex-col transition-[margin] duration-200',
          collapsed ? 'ml-[72px]' : 'ml-64',
        )}
      >
        <Header />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
