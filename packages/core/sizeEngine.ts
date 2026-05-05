import type { GaugeData, SizeToken } from './types'

// TODO: detect how many size brackets a pattern contains by scanning for the canonical
// "A (B, C, D)" notation. Return the bracket count including the base size.
export function detectSizeCount(_text: string): number {
  throw new Error('detectSizeCount: not implemented')
}

// TODO: split pattern text into a token stream so a renderer can highlight or strip
// non-active sizes. Apply gauge/measurement adjustments inline.
export function tokenize(
  _text: string,
  _sizeIndex: number,
  _adjustments: Record<string, string>,
): SizeToken[] {
  throw new Error('tokenize: not implemented')
}

// TODO: walk the pattern text, detect numeric stitch/row counts, and produce replacement
// strings adjusted for the maker's gauge vs the pattern's gauge.
export function buildGaugeAdjustments(
  _text: string,
  _patternGauge: GaugeData,
  _myGauge: GaugeData,
): Record<string, string> {
  throw new Error('buildGaugeAdjustments: not implemented')
}

// TODO: parse a free-form gauge string (e.g. "22 sts and 30 rows = 4 in") into a GaugeData.
export function parseGaugeStr(_gaugeStr: string): GaugeData {
  throw new Error('parseGaugeStr: not implemented')
}
