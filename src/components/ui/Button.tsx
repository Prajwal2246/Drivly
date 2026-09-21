import type { ButtonHTMLAttributes } from 'react';

// See docs/decisions.md #022. Primary = the one main action on a screen; soft = secondary row actions.
const VARIANTS = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-sand',
  soft: 'bg-primary-soft text-primary-ink hover:brightness-95',
  ghost: 'bg-transparent text-primary-ink hover:bg-primary-soft',
  danger: 'bg-danger text-on-danger hover:brightness-95',
} as const;

const SIZES = {
  md: 'h-11 px-5 text-[15px] rounded-control',
  sm: 'h-9 px-3.5 text-sm rounded-[10px]',
} as const;

export type ButtonVariant = keyof typeof VARIANTS;

/** Classes for anything that should look like a button — use on <Link> and <a> too. */
export function buttonClass(variant: ButtonVariant = 'primary', size: keyof typeof SIZES = 'md', extra = '') {
  return [
    'inline-flex items-center justify-center gap-2 font-semibold transition-colors cursor-pointer select-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    'disabled:cursor-not-allowed disabled:bg-sand disabled:text-ink-muted disabled:border-transparent',
    VARIANTS[variant],
    SIZES[size],
    extra,
  ].join(' ');
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: keyof typeof SIZES };

export default function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...rest }: Props) {
  return <button type={type} className={buttonClass(variant, size, className)} {...rest} />;
}
