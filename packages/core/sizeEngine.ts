import type { GaugeData, SizeToken } from './types'

const SIZE_BRACKET_RE = /(-?\d+\.?\d*)\s*\[(-?\d+\.?\d*(?:\s*:\s*-?\d+\.?\d*)*)\]/g

const ROW_CONTEXT_RE = /row|rnd|repeat|rep/i
const ROW_CONTEXT_WINDOW = 40
const SIGNIFICANT_RATIO_DELTA = 0.02
const MIN_SCALABLE_VALUE = 4

function parseValues(first: string, rest: string): number[] {
  return [parseFloat(first), ...rest.split(':').map((s) => parseFloat(s.trim()))]
}

function formatBracket(values: number[]): string {
  if (values.length === 1) return String(values[0])
  return `${values[0]} [${values.slice(1).join(': ')}]`
}

export function detectSizeCount(text: string): number {
  let max = 1
  for (const m of text.matchAll(SIZE_BRACKET_RE)) {
    const count = 1 + m[2].split(':').length
    if (count > max) max = count
  }
  return max
}

export function tokenize(
  text: string,
  sizeIndex: number,
  adjustments: Record<string, string> = {},
): SizeToken[] {
  const tokens: SizeToken[] = []
  let cursor = 0

  for (const m of text.matchAll(SIZE_BRACKET_RE)) {
    const start = m.index ?? 0
    if (start > cursor) {
      tokens.push({ kind: 'text', text: text.slice(cursor, start) })
    }
    const values = parseValues(m[1], m[2])
    const chosen = values[Math.min(Math.max(sizeIndex, 0), values.length - 1)]
    const raw = m[0]
    const adjusted = adjustments[raw]
    tokens.push(adjusted ? { kind: 'size', raw, values, chosen, adjusted } : { kind: 'size', raw, values, chosen })
    cursor = start + raw.length
  }

  if (cursor < text.length) {
    tokens.push({ kind: 'text', text: text.slice(cursor) })
  }

  return tokens
}

export function parseGaugeStr(gaugeStr: string): GaugeData {
  if (!gaugeStr) return { sts: null, rows: null, per: 10 }
  const stMatch = gaugeStr.match(/(\d+\.?\d*)\s*st/i)
  const rwMatch = gaugeStr.match(/(\d+\.?\d*)\s*row/i)
  const cmMatch = gaugeStr.match(/(\d+)\s*cm/i)
  return {
    sts: stMatch ? parseFloat(stMatch[1]) : null,
    rows: rwMatch ? parseFloat(rwMatch[1]) : null,
    per: cmMatch ? parseFloat(cmMatch[1]) : 10,
  }
}

export function buildGaugeAdjustments(
  text: string,
  patternGauge: GaugeData,
  myGauge: GaugeData,
): Record<string, string> {
  if (patternGauge.sts == null || myGauge.sts == null) return {}

  const stsRatio = patternGauge.sts / myGauge.sts
  const rowRatio =
    patternGauge.rows != null && myGauge.rows != null
      ? patternGauge.rows / myGauge.rows
      : stsRatio

  const adjustments: Record<string, string> = {}

  for (const m of text.matchAll(SIZE_BRACKET_RE)) {
    const raw = m[0]
    const matchIndex = m.index ?? 0
    const values = parseValues(m[1], m[2])
    const ctxStart = Math.max(0, matchIndex - ROW_CONTEXT_WINDOW)
    const ctxEnd = matchIndex + raw.length + ROW_CONTEXT_WINDOW
    const isRowContext = ROW_CONTEXT_RE.test(text.slice(ctxStart, ctxEnd))
    const ratio = isRowContext ? rowRatio : stsRatio

    if (Math.abs(ratio - 1) < SIGNIFICANT_RATIO_DELTA) continue

    const scaled = values.map((v) => {
      if (v < MIN_SCALABLE_VALUE || !Number.isInteger(v)) return v
      const rounded = Math.round(v / ratio)
      return rounded % 2 !== 0 && rounded > 2 ? rounded + 1 : rounded
    })

    const changed = scaled.some((v, i) => v !== values[i])
    if (changed) adjustments[raw] = formatBracket(scaled)
  }

  return adjustments
}
