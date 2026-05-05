import type { AIPalette, PatternSection, Project, YarnEntry } from './types'

const PARSE_ENDPOINT = '/api/ai/parse'

interface ParseResponse {
  title: string
  craft: 'knitting' | 'crochet'
  difficulty: 'beginner' | 'easy' | 'intermediate' | 'advanced'
  description: string
  sizes: string[]
  gauge: string
  gaugeData: { sts: number | null; rows: number | null; per: number }
  needles: string
  yarn: Array<{ name: string; weight: string; amount: string; color: string }>
  sections: Array<{
    id: string
    title: string
    instructions: string
    estimatedRows: number
  }>
  abbreviations: Record<string, string>
  notes: string
}

interface ErrorResponse {
  error: string
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as ErrorResponse).error === 'string'
  )
}

export async function parsePattern(
  text: string,
  isPDF?: boolean,
  pdfB64?: string,
): Promise<Partial<Project>> {
  const body = isPDF ? { pdfB64 } : { text }
  const response = await fetch(PARSE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    let message = `Parse failed: ${response.status}`
    try {
      const errBody = (await response.json()) as unknown
      if (isErrorResponse(errBody)) message = errBody.error
    } catch {
      // body wasn't json — keep status-line message
    }
    throw new Error(message)
  }

  const data = (await response.json()) as ParseResponse

  const yarn: YarnEntry[] = data.yarn.map((y) => ({
    name: y.name,
    weight: y.weight,
    amount: y.amount,
    color: y.color,
    status: 'need',
  }))

  return {
    title: data.title,
    craft: data.craft,
    difficulty: data.difficulty,
    description: data.description,
    sizes: data.sizes,
    gauge: data.gauge,
    gaugeData: data.gaugeData,
    needles: data.needles,
    yarn,
    sections: data.sections,
    abbreviations: data.abbreviations,
    notes: data.notes,
    rawText: isPDF ? '' : text,
  }
}

// TODO: implement palette suggestion. Given a pattern's title/description/yarn requirements
// and a free-text vibe, ask Claude for several palette options keyed to the Paintbox library.
export async function suggestPalettes(
  _patternTitle: string,
  _patternDesc: string,
  _patternYarn: YarnEntry[],
  _vibe: string,
): Promise<AIPalette[]> {
  throw new Error('suggestPalettes: not implemented')
}

// TODO: implement Q&A. Given the full pattern context (rawText + parsed sections) and a
// user question, return a plain-text answer from Claude.
export async function aiAnswer(_question: string, _patternContext: string): Promise<string> {
  throw new Error('aiAnswer: not implemented')
}

// TODO: implement measurement scaling. Returns a map of sectionId -> rewritten instructions
// scaled to the user's measurements at the target gauge.
export async function scaleMeasurements(
  _sections: PatternSection[],
  _sizes: string[],
  _measurements: object,
  _gaugeStr: string,
): Promise<Record<string, string>> {
  throw new Error('scaleMeasurements: not implemented')
}
