import type { HTMLAttributes, ReactNode } from 'react'
import { SectionLabel } from './SectionLabel'

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  children: ReactNode
  title?: ReactNode
  interactive?: boolean
}

export function Card({
  children,
  title,
  interactive = false,
  className = '',
  ...rest
}: CardProps) {
  const interactiveClasses = interactive
    ? 'cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-editorial-lg'
    : ''

  return (
    <div
      className={`rounded-2xl border border-frame bg-paper p-5 shadow-editorial ${interactiveClasses} ${className}`}
      {...rest}
    >
      {title ? (
        <>
          <SectionLabel>{title}</SectionLabel>
          <div className="mt-3">{children}</div>
        </>
      ) : (
        children
      )}
    </div>
  )
}
