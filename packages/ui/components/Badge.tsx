import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'green' | 'terra' | 'gold' | 'hi' | 'adj'

export interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-frame text-ink-soft',
  green: 'bg-green-light text-green',
  terra: 'bg-terra-light text-terra',
  gold: 'bg-gold-light text-gold',
  hi: 'bg-hi-bg text-hi-text border border-hi-border',
  adj: 'bg-adj-bg text-adj-text border border-adj-border',
}

export function Badge({ children, tone = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[0.62rem] font-medium uppercase tracking-wider ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
