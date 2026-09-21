import type { ReactNode } from 'react';

// One colour per meaning: success = available/verified, warning = on a trip, primary = pending, danger = declined. See #022.
const TONES = {
  neutral: 'bg-sand text-ink-muted',
  primary: 'bg-primary-soft text-primary-ink',
  success: 'bg-success-soft text-success-ink',
  warning: 'bg-warning-soft text-warning-ink',
  danger: 'bg-danger-soft text-danger-ink',
} as const;

export type BadgeTone = keyof typeof TONES;

export default function Badge({ tone = 'neutral', dot = false, children }: { tone?: BadgeTone; dot?: boolean; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[13px] font-semibold whitespace-nowrap ${TONES[tone]}`}>
      {dot && <span aria-hidden className="w-[7px] h-[7px] rounded-full bg-current" />}
      {children}
    </span>
  );
}
