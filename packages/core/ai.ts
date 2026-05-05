import type { AIPalette, PatternSection, Project, YarnEntry } from './types'

// TODO: implement Anthropic API call. Should accept raw pattern text or a base64-encoded
// PDF, send it to Claude, and return a partial Project shaped like the parsed pattern.
export async function parsePattern(
  _text: string,
  _isPDF?: boolean,
  _pdfB64?: string,
): Promise<Partial<Project>> {
  throw new Error('parsePattern: not implemented')
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
