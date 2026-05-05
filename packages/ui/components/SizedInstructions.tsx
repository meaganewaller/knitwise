import { tokenize } from '@knitwise/core'

export type SizedInstructionsMode = 'highlight' | 'strip'

export interface SizedInstructionsProps {
  text: string
  sizeIndex: number
  mode?: SizedInstructionsMode
  adjustments?: Record<string, string>
  className?: string
}

const annotationBase =
  'inline-block rounded border px-1.5 font-mono font-bold align-baseline'

const highlightTone = 'bg-hi-bg border-hi-border text-hi-text'
const adjustedTone = 'bg-adj-bg border-adj-border text-adj-text'

export function SizedInstructions({
  text,
  sizeIndex,
  mode = 'highlight',
  adjustments,
  className = '',
}: SizedInstructionsProps) {
  const tokens = tokenize(text, sizeIndex, adjustments)

  return (
    <pre
      className={`whitespace-pre-wrap font-mono text-[0.78rem] leading-[1.85] text-ink ${className}`}
    >
      {tokens.map((token, i) => {
        if (token.kind === 'text') return <span key={i}>{token.text}</span>

        const { values, chosen, adjusted } = token
        const isAdjusted = adjusted !== undefined
        const display = adjusted ?? String(chosen)
        const annotation = `${annotationBase} ${isAdjusted ? adjustedTone : highlightTone}`
        const chosenIdx = Math.min(Math.max(sizeIndex, 0), values.length - 1)
        const others = values.filter((_, j) => j !== chosenIdx)

        return (
          <span key={i}>
            <span className={annotation}>{display}</span>
            {isAdjusted && (
              <span className="ml-0.5 align-super text-[0.65rem] text-adj-text">*</span>
            )}
            {mode === 'highlight' && others.length > 0 && (
              <span className="opacity-40"> [{others.join(': ')}]</span>
            )}
          </span>
        )
      })}
    </pre>
  )
}
