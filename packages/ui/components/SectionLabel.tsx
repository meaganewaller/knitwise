import type { ReactNode } from 'react'

export interface SectionLabelProps {
  children: ReactNode
  className?: string
}

export function SectionLabel({ children, className = '' }: SectionLabelProps) {
  return (
    <div
      className={`font-mono text-[0.62rem] font-medium uppercase tracking-eyebrow text-green-mid ${className}`}
    >
      {children}
    </div>
  )
}
