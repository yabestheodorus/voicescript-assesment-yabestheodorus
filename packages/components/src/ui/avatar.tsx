import { clsx } from 'clsx';

const sizeStyles = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-base',
} as const;

/**
 * Initials avatar. Derives a stable background tint from the name so the
 * same person always renders the same color (purely presentational).
 */
const TINTS = [
  'bg-brand-100 text-brand-700',
  'bg-info-50 text-info-600',
  'bg-success-50 text-success-700',
  'bg-warning-50 text-warning-700',
  'bg-danger-50 text-danger-700',
];

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function Avatar({
  name,
  size = 'md',
  className,
}: {
  name: string;
  size?: keyof typeof sizeStyles;
  className?: string;
}) {
  const tint =
    TINTS[
      Math.abs(
        name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0),
      ) % TINTS.length
    ];

  return (
    <span
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        sizeStyles[size],
        tint,
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
