export interface SpinnerProps {
  size?: number
  className?: string
  label?: string
}

export function Spinner({ size = 16, className = '', label = 'Loading' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
