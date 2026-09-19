'use client';
import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';

// Label + control + hint/error, wired for screen readers (aria-invalid, aria-describedby). See #022.
const CONTROL =
  'w-full h-11 px-3.5 rounded-control border bg-surface text-ink text-[15px] placeholder:text-ink-muted ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

type Common = { label: string; hint?: ReactNode; error?: string | null };

function useFieldIds(error?: string | null, hint?: ReactNode) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return { id, describedBy };
}

function Frame({ id, label, hint, error, children }: Common & { id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">{label}</label>
      {children}
      {error ? (
        <span id={`${id}-error`} className="text-[13px] text-danger-ink">{error}</span>
      ) : hint ? (
        <span id={`${id}-hint`} className="text-[13px] text-ink-muted">{hint}</span>
      ) : null}
    </div>
  );
}

export function Input({ label, hint, error, className = '', ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const { id, describedBy } = useFieldIds(error, hint);
  return (
    <Frame id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${CONTROL} ${error ? 'border-danger border-2' : 'border-line-strong'} ${className}`}
        {...rest}
      />
    </Frame>
  );
}

export function Select({ label, hint, error, className = '', children, ...rest }: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  const { id, describedBy } = useFieldIds(error, hint);
  return (
    <Frame id={id} label={label} hint={hint} error={error}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${CONTROL} ${error ? 'border-danger border-2' : 'border-line-strong'} ${className}`}
        {...rest}
      >
        {children}
      </select>
    </Frame>
  );
}
