import { clsx } from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from './nav-config';
import { FiChevronsLeft, FiHeadphones } from '../icons';

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  collapsed,
  onToggle,
  jobCount
}: {
  collapsed: boolean;
  onToggle: () => void;
  jobCount: number;
}) {
  const pathname = usePathname();

  // assign job count to nav items
  NAV_ITEMS.forEach((item) => {
    if (item.href === '/jobs') {
      item.badge = jobCount ? jobCount.toString() : "0"
    }
  });


  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-surface-200 bg-surface-0 transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      {/* Brand */}
      <div
        className={clsx(
          'flex h-16 items-center border-b border-surface-100',
          collapsed ? 'justify-center px-2' : 'px-5',
        )}
      >
        {collapsed ? (
          <img
            src="/favicon-192.png"
            alt="VoiceScript"
            className="size-8 rounded-md"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/voicescript-logo.png"
            alt="VoiceScript"
            className="h-7 w-auto"
          />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {!collapsed ? (
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-surface-400">
            Agency
          </p>
        ) : null}
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={clsx(
                'group flex items-center rounded-lg text-sm font-medium transition-colors',
                collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900',
              )}
            >
              <Icon
                className={clsx(
                  'size-5 shrink-0',
                  active ? 'text-brand-600' : 'text-surface-400',
                )}
              />
              {!collapsed ? (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span
                      className={clsx(
                        'rounded-full px-2 py-0.5 text-xs font-semibold',
                        active
                          ? 'bg-brand-600 text-white'
                          : 'bg-surface-100 text-surface-500',
                      )}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Support card + collapse toggle */}
      <div className="border-t border-surface-100 p-3">
        {!collapsed ? (
          <div className="mb-3 rounded-lg bg-brand-600 p-4 text-white">
            <FiHeadphones className="size-5" />
            <p className="mt-2 text-sm font-semibold">Need help?</p>
            <p className="mt-0.5 text-xs text-brand-100">
              Reach our support team 24/7.
            </p>
          </div>
        ) : null}
        <button
          type="button"
          onClick={onToggle}
          className={clsx(
            'flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-surface-500 transition-colors hover:bg-surface-50 hover:text-surface-800',
            collapsed ? 'justify-center' : 'gap-3',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <FiChevronsLeft
            className={clsx(
              'size-5 transition-transform',
              collapsed && 'rotate-180',
            )}
          />
          {!collapsed ? <span>Collapse</span> : null}
        </button>
      </div>
    </aside>
  );
}
