export interface SpinnerProps {
  size?: number
  tone?: 'accent' | 'neutral'
  className?: string
  label?: string
}

const toneClasses: Record<NonNullable<SpinnerProps['tone']>, string> = {
  accent: 'border-accent-light border-t-accent',
  neutral: 'border-frame border-t-ink-soft',
}

export function Spinner({
  size = 20,
  tone = 'accent',
  className = '',
  label = 'Loading',
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block animate-spin rounded-full border-[3px] ${toneClasses[tone]} ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
