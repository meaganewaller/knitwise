import type { PatternSection, Project, ProjectTracker, YarnEntry } from '@knitwise/core'

export const DEMO_PROJECT_ID = 'demo-swimmers'

const SECTIONS: PatternSection[] = [
  {
    id: 's1',
    title: 'Back panel',
    instructions: `Cast on 106 [112: 118: 124: 130] sts with 3.5mm needles, yarn A.
Knit 16 rows in g st. Change to 4mm needles.
Cont in st st until work measures 25 cm ending with a WS row.

SHAPE ARMHOLE:
Cast off 5 sts at beg of next 2 rows.
Dec row (RS): K1, ssk, k to last 3 sts, k2tog, k1.
Rep dec until 86 [88: 92: 98: 102] sts rem.
Cont without shaping to 41.5 [42: 42.5: 43: 44] cm ending WS.`,
    estimatedRows: 110,
  },
  {
    id: 's2',
    title: 'Front panel',
    instructions: `Work as Back to **. 84 [86: 88: 92: 96] sts.
Cont in st st until work measures 38 cm, ending WS.

SHAPE LEFT FRONT NECK:
K15 [15: 16: 17: 19], k2tog, k1. Turn.
Dec on every RS row to 9 [9: 10: 11: 13] sts.
Work 3 rows. Cast off.`,
    estimatedRows: 95,
  },
  {
    id: 's3',
    title: 'Sleeves (×2)',
    instructions: `Cast on 52 [54: 58: 62: 68] sts with 3.5mm needles, yarn A.
Knit 16 rows. Change to 4mm needles.
Inc row: K2, m1, k to last 2 sts, m1, k2.
Work 13 rows st st. Rep last 14 rows to 70 [72: 76: 80: 86] sts.
Repeat 30 [32: 34: 36: 38] times then shape armhole.`,
    estimatedRows: 80,
  },
  {
    id: 's4',
    title: 'Neck edging',
    instructions: `3.5mm circular, yarn A. Pick up 146 [150: 150: 154: 154] sts evenly.
Work 4 cm in g st in the round. Cast off knitwise.`,
    estimatedRows: 16,
  },
]

const YARN: YarnEntry[] = [
  {
    name: 'Dolphin Blue',
    weight: 'DK',
    amount: '8 balls',
    color: 'Dolphin Blue',
    hex: '#7aafc4',
    status: 'need',
    brand: 'Paintbox',
  },
  {
    name: 'Vanilla Cream',
    weight: 'DK',
    amount: '1 ball',
    color: 'Vanilla Cream',
    hex: '#f5f0e8',
    status: 'need',
    brand: 'Paintbox',
  },
  {
    name: 'Woo Woo',
    weight: 'Metallic DK',
    amount: '1 ball',
    color: 'Woo Woo',
    hex: '#e8748a',
    status: 'need',
    brand: 'Paintbox',
  },
]

function createDemoTracker(): ProjectTracker {
  return {
    status: 'Not Started',
    sizeIndex: 0,
    sizeMode: 'highlight',
    myGauge: { sts: null, rows: null, per: 10 },
    myMeasurements: { bust: '', waist: '', hips: '', length: '', sleeve: '' },
    scalingMode: 'none',
    gaugeAdjustments: {},
    measAdjustments: {},
    sections: SECTIONS.map((s) => ({ ...s, done: false, notes: '' })),
    counters: [
      { id: 'c1', label: 'Main', value: 0 },
      { id: 'c2', label: 'Repeat', value: 0 },
    ],
    totalSeconds: 0,
    yarn: YARN,
    notes: { general: '', tension: '', adjustments: '', photos: '' },
    photos: [],
    qa: [],
  }
}

export function createDemoProject(): Project {
  const now = Date.now()
  return {
    id: DEMO_PROJECT_ID,
    createdAt: now,
    updatedAt: now,
    title: 'Retro Swimmers Sweater',
    craft: 'knitting',
    difficulty: 'intermediate',
    description:
      'A breezy cotton sweater with Swiss-darned swimmers — Paintbox Yarns DK, 4mm needles.',
    sizes: ['32"', '34"', '36"', '38"', '40"'],
    gauge: '22 sts × 30 rows = 10cm on 4mm needles',
    gaugeData: { sts: 22, rows: 30, per: 10 },
    needles: '3.5mm + 4mm straight, 3.5mm circular',
    yarn: YARN,
    sections: SECTIONS,
    abbreviations: {
      k: 'knit',
      p: 'purl',
      'st(s)': 'stitch(es)',
      ssk: 'slip, slip, knit',
      k2tog: 'knit two together',
      'st st': 'stocking stitch',
      'g st': 'garter stitch',
      m1: 'make one (increase)',
    },
    notes: '',
    rawText: '',
    tracker: createDemoTracker(),
  }
}
