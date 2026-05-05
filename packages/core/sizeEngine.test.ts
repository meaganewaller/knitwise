import { describe, expect, it } from 'vitest'
import {
  buildGaugeAdjustments,
  detectSizeCount,
  parseGaugeStr,
  tokenize,
} from './sizeEngine'
import type { GaugeData } from './types'

describe('detectSizeCount', () => {
  it('returns 1 for plain text with no size brackets', () => {
    expect(detectSizeCount('Cast on 80 sts')).toBe(1)
    expect(detectSizeCount('')).toBe(1)
  })

  it('counts the base value plus the bracket entries', () => {
    expect(detectSizeCount('Cast on 106 [112: 118: 124: 130] sts')).toBe(5)
  })

  it('returns the largest bracket count when multiple are present', () => {
    expect(detectSizeCount('K1 [2: 3] then 8 [8: 9: 9: 10] times')).toBe(5)
  })

  it('counts decimals', () => {
    expect(detectSizeCount('Length 41.5 [42: 42.5] cm')).toBe(3)
  })
})

describe('tokenize', () => {
  it('returns no tokens for empty input', () => {
    expect(tokenize('', 0)).toEqual([])
  })

  it('returns a single text token when no brackets are present', () => {
    expect(tokenize('plain text', 0)).toEqual([{ kind: 'text', text: 'plain text' }])
  })

  it('splits around a size bracket and picks the chosen value at sizeIndex', () => {
    expect(tokenize('Cast on 106 [112: 118: 124: 130] sts', 2)).toEqual([
      { kind: 'text', text: 'Cast on ' },
      {
        kind: 'size',
        raw: '106 [112: 118: 124: 130]',
        values: [106, 112, 118, 124, 130],
        chosen: 118,
      },
      { kind: 'text', text: ' sts' },
    ])
  })

  it('clamps a sizeIndex past the bracket length to the last value', () => {
    const tokens = tokenize('K to 8 [8: 9]', 7)
    const size = tokens.find((t) => t.kind === 'size')
    expect(size?.kind).toBe('size')
    if (size?.kind === 'size') expect(size.chosen).toBe(9)
  })

  it('clamps a negative sizeIndex to the first value', () => {
    const tokens = tokenize('K to 8 [8: 9]', -3)
    const size = tokens.find((t) => t.kind === 'size')
    if (size?.kind === 'size') expect(size.chosen).toBe(8)
  })

  it('attaches adjusted display strings from the adjustments map', () => {
    const tokens = tokenize('Cast on 106 [112: 118: 124: 130] sts', 0, {
      '106 [112: 118: 124: 130]': '98 [104: 110: 116: 122]',
    })
    const size = tokens.find((t) => t.kind === 'size')
    if (size?.kind === 'size') {
      expect(size.adjusted).toBe('98 [104: 110: 116: 122]')
    }
  })

  it('preserves multiple brackets in order', () => {
    const tokens = tokenize('Inc to 60 [64: 68] then dec to 50 [54: 58]', 1)
    const sizes = tokens.filter((t) => t.kind === 'size')
    expect(sizes).toHaveLength(2)
    if (sizes[0].kind === 'size') expect(sizes[0].chosen).toBe(64)
    if (sizes[1].kind === 'size') expect(sizes[1].chosen).toBe(54)
  })
})

describe('parseGaugeStr', () => {
  it('returns null gauge with default per for empty input', () => {
    expect(parseGaugeStr('')).toEqual({ sts: null, rows: null, per: 10 })
  })

  it('parses a standard metric gauge', () => {
    expect(parseGaugeStr('22 sts and 30 rows = 10cm on 4mm')).toEqual({
      sts: 22,
      rows: 30,
      per: 10,
    })
  })

  it('parses decimal stitch counts', () => {
    expect(parseGaugeStr('21.5 sts × 28 rows = 10cm')).toEqual({
      sts: 21.5,
      rows: 28,
      per: 10,
    })
  })

  it('defaults per to 10 when no cm is given', () => {
    expect(parseGaugeStr('22 sts × 30 rows')).toEqual({
      sts: 22,
      rows: 30,
      per: 10,
    })
  })

  it('uses the explicit cm value when present', () => {
    expect(parseGaugeStr('11 sts and 15 rows = 5cm')).toEqual({
      sts: 11,
      rows: 15,
      per: 5,
    })
  })
})

describe('buildGaugeAdjustments', () => {
  const patternGauge: GaugeData = { sts: 22, rows: 30, per: 10 }

  it('returns an empty map when the pattern stitch gauge is unknown', () => {
    expect(
      buildGaugeAdjustments(
        'Cast on 106 [112] sts',
        { sts: null, rows: null, per: 10 },
        { sts: 22, rows: 30, per: 10 },
      ),
    ).toEqual({})
  })

  it('returns an empty map when the knitter has not entered their gauge', () => {
    expect(
      buildGaugeAdjustments('Cast on 106 [112] sts', patternGauge, {
        sts: null,
        rows: null,
        per: 10,
      }),
    ).toEqual({})
  })

  it('returns an empty map when gauges match (ratio ≈ 1)', () => {
    expect(
      buildGaugeAdjustments('Cast on 106 [112: 118: 124: 130] sts', patternGauge, {
        sts: 22,
        rows: 30,
        per: 10,
      }),
    ).toEqual({})
  })

  it('scales stitch counts down when the knitter has a looser gauge', () => {
    // pattern 22 sts/10cm, mine 20 sts/10cm → ratio 1.1
    // 106/1.1=96.36→96 (even); 112/1.1=101.8→102; 118/1.1=107.27→107→108;
    // 124/1.1=112.7→113→114; 130/1.1=118.18→118
    const result = buildGaugeAdjustments(
      'Cast on 106 [112: 118: 124: 130] sts',
      patternGauge,
      { sts: 20, rows: 28, per: 10 },
    )
    expect(result['106 [112: 118: 124: 130]']).toBe('96 [102: 108: 114: 118]')
  })

  it('uses the row ratio when the bracket is in a row context', () => {
    // pattern 22sts/30rows, mine 22sts/25rows → stsRatio=1 (skipped),
    // rowRatio=30/25=1.2. 30/1.2=25→26; 32/1.2=26.67→27→28; 34/1.2=28.3→28
    const result = buildGaugeAdjustments(
      'Repeat 30 [32: 34] rows then knit',
      patternGauge,
      { sts: 22, rows: 25, per: 10 },
    )
    expect(result['30 [32: 34]']).toBe('26 [28: 28]')
  })

  it('scales integer siblings inside a bracket while leaving decimals alone', () => {
    // 41.5 (decimal) and 42.5 (decimal) skip scaling; 42 → 42/1.1=38.18 → 38 (even)
    const result = buildGaugeAdjustments('Length 41.5 [42: 42.5] cm', patternGauge, {
      sts: 20,
      rows: 28,
      per: 10,
    })
    expect(result['41.5 [42: 42.5]']).toBe('41.5 [38: 42.5]')
  })
})
