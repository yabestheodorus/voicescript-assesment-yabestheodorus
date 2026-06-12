import type { AnyFieldApi } from '@tanstack/react-form';

/** Shared, app-wide form primitives (TanStack Form fields + styling). */
export const inputClass =
  'w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary';
export const labelClass = 'block text-[13px] font-medium text-muted';

/** Inline validation message for a field (shown once touched). */
export function FieldInfo({ field }: { field: AnyFieldApi }) {
  const { isTouched, errors } = field.state.meta;
  if (!isTouched || errors.length === 0) return null;
  const first = errors[0] as unknown;
  const message = typeof first === 'string' ? first : (first as { message?: string })?.message;
  if (!message) return null;
  return <p className="text-xs text-rose-600">{message}</p>;
}

export function TextField({
  field,
  label,
  type = 'text',
  placeholder,
  isRequired,
}: {
  field: AnyFieldApi;
  label: string;
  type?: string;
  placeholder?: string;
  isRequired: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className={labelClass}>
        {label} <span className="text-rose-500">{isRequired && '*'}</span>
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className={inputClass}
        // `?? ''` keeps the input controlled: optional fields (line2/postal) can
        // be `undefined`, which would otherwise flip it uncontrolled→controlled.
        value={field.state.value ?? ''}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
      <FieldInfo field={field} />
    </div>
  );
}

export function NumberField({
  field,
  label,
  min,
  max,
  isRequired,
}: {
  field: AnyFieldApi;
  label: string;
  min?: number;
  max?: number;
  isRequired: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className={labelClass}>
        {label} <span className="text-rose-500">{isRequired && '*'}</span>
      </label>
      <input
        type="number"
        min={min}
        max={max}
        className={inputClass}
        value={field.state.value}
        onChange={(e) => field.handleChange(Number(e.target.value) || 0)}
        onBlur={field.handleBlur}
      />
      <FieldInfo field={field} />
    </div>
  );
}

export function TextAreaField({
  field,
  label,
  rows = 2,
  isRequired,
}: {
  field: AnyFieldApi;
  label: string;
  rows?: number;
  isRequired: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className={labelClass}>
        {label} <span className="text-rose-500">{isRequired && '*'}</span>
      </label>
      <textarea
        rows={rows}
        className={`${inputClass} resize-none`}
        value={field.state.value ?? ''}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
      <FieldInfo field={field} />
    </div>
  );
}
