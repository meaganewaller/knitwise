import type { ReactNode } from 'react'

export interface SectionLabelProps {
  children: ReactNode
  className?: string
}

export function SectionLabel({ children, className = '' }: SectionLabelProps) {
  return (
    <h3
      className={`text-xs font-semibold uppercase tracking-wider text-neutral-500 ${className}`}
    >
      {children}
    </h3>
  )
}
