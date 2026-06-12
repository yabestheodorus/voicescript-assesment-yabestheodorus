import { clsx } from 'clsx';
import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';

/**
 * Lightweight, presentational table primitives with the dashboard's house
 * styling. Pages compose these with hardcoded rows — no data logic here.
 */
export function DataTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-surface-200 bg-surface-0 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          {children}
        </table>
      </div>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-surface-200 bg-surface-50">
      {children}
    </thead>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-surface-100">{children}</tbody>;
}

export function TR({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr className={clsx('transition-colors hover:bg-surface-50', className)}>
      {children}
    </tr>
  );
}

export function TH({
  children,
  className,
  ...props
}: { children?: ReactNode } & ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={clsx(
        'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-surface-500',
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TD({
  children,
  className,
  ...props
}: { children?: ReactNode } & TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={clsx('px-4 py-3 align-middle text-surface-700', className)}
      {...props}
    >
      {children}
    </td>
  );
}
