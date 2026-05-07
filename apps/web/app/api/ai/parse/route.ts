import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v4'
import type { ZodType } from 'zod'

export const runtime = 'nodejs'
export const maxDuration = 60

const ParsedPatternSchema = z.object({
  title: z.string(),
  craft: z.enum(['knitting', 'crochet']),
  difficulty: z.enum(['beginner', 'easy', 'intermediate', 'advanced']),
  description: z.string(),
  sizes: z.array(z.string()),
  gauge: z.string(),
  gaugeData: z.object({
    sts: z.number().nullable(),
    rows: z.number().nullable(),
    per: z.number(),
  }),
  needles: z.string(),
  yarn: z.array(
    z.object({
      name: z.string(),
      weight: z.string(),
      amount: z.string(),
      color: z.string(),
    }),
  ),
  sections: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      instructions: z.string(),
      estimatedRows: z.number(),
    }),
  ),
  abbreviations: z.array(
    z.object({
      abbr: z.string(),
      meaning: z.string(),
    }),
  ),
  notes: z.string(),
})

type ParsedPattern = z.infer<typeof ParsedPatternSchema>

const SYSTEM_PROMPT = `You are a knitting/crochet pattern parser. Extract a structured pattern from raw text or a PDF.

Field guidance:
- title: pattern name as published.
- craft: "knitting" or "crochet" — pick the dominant one.
- difficulty: beginner | easy | intermediate | advanced — your judgment from technique density.
- description: 1-2 sentences describing the finished object.
- sizes: human-readable size labels in pattern order, e.g. ["S","M","L"] or ["32\\"","34\\"","36\\""].
- gauge: the gauge sentence verbatim.
- gaugeData: parsed numeric gauge. sts and rows may be null if not specified. per is the cm value (default 10).
- needles: the needles/hook sentence.
- yarn: each yarn called for, with name + weight + amount + color/colorway.
- sections: split the pattern instructions into logical knittable sections. id is a short slug like "back" or "sleeves". instructions MUST preserve the original text VERBATIM, including all size bracket notation like "106 [112: 118: 124: 130]" — do not normalize or rewrite these.
- abbreviations: array of {abbr, meaning} pairs from the abbreviation key.
- notes: any pattern notes, finishing notes, or yardage info that doesn't belong elsewhere.

Critical: preserve all "N [N: N: N]" size brackets exactly as written. Do not collapse them, do not pick a single size.`

const TEXT_INPUT_LIMIT = 8000

function abbreviationsToMap(
  pairs: ParsedPattern['abbreviations'],
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const { abbr, meaning } of pairs) {
    out[abbr] = meaning
  }
  return out
}

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured on the server.' },
      { status: 500 },
    )
  }

  let body: { text?: string; pdfB64?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { text, pdfB64 } = body
  if (!text && !pdfB64) {
    return NextResponse.json(
      { error: 'Provide either `text` or `pdfB64`.' },
      { status: 400 },
    )
  }

  const userContent: Anthropic.MessageParam['content'] = pdfB64
    ? [
        {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: pdfB64 },
        },
        { type: 'text', text: 'Parse this knitting/crochet pattern.' },
      ]
    : `Parse this pattern:\n\n${(text ?? '').slice(0, TEXT_INPUT_LIMIT)}`

  const client = new Anthropic()

  try {
    const response = await client.messages.parse({
      model: 'claude-opus-4-7',
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userContent }],
      output_config: {
        // SDK 0.93.0 types import ZodType from 'zod' (v3) but the runtime imports from 'zod/v4'.
        // Schemas must be v4 at runtime; cast to satisfy the v3-typed signature.
        format: zodOutputFormat(ParsedPatternSchema as unknown as ZodType<ParsedPattern>),
      },
    })

    const parsed = response.parsed_output
    if (!parsed) {
      return NextResponse.json(
        { error: 'Model did not return a parseable pattern.' },
        { status: 502 },
      )
    }

    return NextResponse.json({
      ...parsed,
      abbreviations: abbreviationsToMap(parsed.abbreviations),
    })
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: 'Rate limited — try again shortly.' }, { status: 429 })
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: 'Invalid Anthropic API key.' }, { status: 401 })
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Anthropic API error: ${error.message}` },
        { status: error.status ?? 502 },
      )
    }
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
