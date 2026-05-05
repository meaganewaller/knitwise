'use client'

import { useState } from 'react'
import { buildGaugeAdjustments } from '@knitwise/core'
import {
  Badge,
  Button,
  Card,
  SectionLabel,
  SizedInstructions,
  type SizedInstructionsMode,
} from '@knitwise/ui'

const SAMPLE_TEXT = `Cast on 106 [112: 118: 124: 130] sts with 3.5mm needles, yarn A.
Knit 16 rows in g st. Change to 4mm needles.
Cont in st st until work measures 25 cm ending with a WS row.

SHAPE ARMHOLE:
Cast off 5 sts at beg of next 2 rows.
Dec row (RS): K1, ssk, k to last 3 sts, k2tog, k1.
Rep dec until 86 [88: 92: 98: 102] sts rem.
Cont without shaping to 41.5 [42: 42.5: 43: 44] cm ending WS.

NECK:
K10 [10: 11: 12: 14], k2tog, k1. Turn.
Repeat 30 [32: 34: 36: 38] times.`

const SIZES = ['32"', '34"', '36"', '38"', '40"']

const PATTERN_GAUGE = { sts: 22, rows: 30, per: 10 }
const MY_GAUGE = { sts: 20, rows: 28, per: 10 }

const SCALED_ADJUSTMENTS = buildGaugeAdjustments(SAMPLE_TEXT, PATTERN_GAUGE, MY_GAUGE)

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [sizeIndex, setSizeIndex] = useState(0)
  const [mode, setMode] = useState<SizedInstructionsMode>('highlight')
  const [scaled, setScaled] = useState(false)

  return (
    <div className="mx-auto max-w-4xl px-6 pb-16">
      <header className="border-b border-frame pb-6 pt-12">
        <SectionLabel>Project · {params.id}</SectionLabel>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-ink">
          Retro <em className="not-italic font-display italic text-accent">Swimmers</em> Sweater
        </h1>
        <p className="mt-2 max-w-prose text-sm text-ink-soft">
          Live demo of the size-aware pattern renderer. Toggle your size, switch between
          highlight and strip mode, and apply the gauge scaling to see adjusted values pick up
          the blue annotation.
        </p>
      </header>

      <div className="mt-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <SectionLabel className="mr-2">Your size</SectionLabel>
          {SIZES.map((label, i) => (
            <Button
              key={label}
              variant={sizeIndex === i ? 'accent' : 'secondary'}
              size="sm"
              onClick={() => setSizeIndex(i)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SectionLabel className="mr-2">Mode</SectionLabel>
          <Button
            variant={mode === 'highlight' ? 'accent' : 'secondary'}
            size="sm"
            onClick={() => setMode('highlight')}
          >
            Highlight my size
          </Button>
          <Button
            variant={mode === 'strip' ? 'accent' : 'secondary'}
            size="sm"
            onClick={() => setMode('strip')}
          >
            Strip other sizes
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SectionLabel className="mr-2">Gauge</SectionLabel>
          <Button
            variant={scaled ? 'accent' : 'secondary'}
            size="sm"
            onClick={() => setScaled((s) => !s)}
          >
            {scaled ? 'Scaling on (22 → 20 sts)' : 'Apply gauge scaling'}
          </Button>
          {scaled && (
            <span className="font-mono text-xs text-ink-muted">
              {Object.keys(SCALED_ADJUSTMENTS).length} brackets adjusted
            </span>
          )}
        </div>
      </div>

      <Card title="Pattern instructions" className="mt-6">
        <SizedInstructions
          text={SAMPLE_TEXT}
          sizeIndex={sizeIndex}
          mode={mode}
          adjustments={scaled ? SCALED_ADJUSTMENTS : undefined}
          className="mt-2"
        />
      </Card>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-soft">
        <span className="flex items-center gap-2">
          <Badge tone="hi">your size</Badge>
        </span>
        <span className="flex items-center gap-2">
          <Badge tone="adj">scaled*</Badge>
        </span>
        <span className="font-mono opacity-40">[other: sizes: dimmed]</span>
      </div>
    </div>
  )
}
