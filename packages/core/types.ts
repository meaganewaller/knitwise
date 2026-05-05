export interface YarnEntry {
  name: string
  weight: string
  amount: string
  color: string
  hex?: string
  status: 'need' | 'ordered' | 'have'
  brand?: string
  family?: string
}

export interface PatternSection {
  id: string
  title: string
  instructions: string
  estimatedRows: number
}

export interface TrackerSection extends PatternSection {
  done: boolean
  notes: string
}

export interface Counter {
  id: string
  label: string
  value: number
}

export interface GaugeData {
  sts: number | null
  rows: number | null
  per: number
}

export interface Measurements {
  bust: string
  waist: string
  hips: string
  length: string
  sleeve: string
}

export interface ProjectNotes {
  general: string
  tension: string
  adjustments: string
  photos: string
}

export interface ProjectPhoto {
  src: string
  caption: string
  date: string
}

export interface QAEntry {
  role: 'user' | 'ai'
  text: string
  ts: number
}

export interface ProjectTracker {
  status: 'Not Started' | 'In Progress' | 'Finished'
  sizeIndex: number
  sizeMode: 'highlight' | 'strip'
  myGauge: GaugeData
  myMeasurements: Measurements
  scalingMode: 'none' | 'gauge' | 'measurements'
  gaugeAdjustments: Record<string, string>
  measAdjustments: Record<string, string>
  sections: TrackerSection[]
  counters: Counter[]
  totalSeconds: number
  yarn: YarnEntry[]
  notes: ProjectNotes
  photos: ProjectPhoto[]
  qa: QAEntry[]
}

export interface Project {
  id: string
  createdAt: number
  updatedAt: number
  title: string
  craft: 'knitting' | 'crochet'
  difficulty: 'beginner' | 'easy' | 'intermediate' | 'advanced'
  description: string
  sizes: string[]
  gauge: string
  gaugeData: GaugeData
  needles: string
  yarn: YarnEntry[]
  sections: PatternSection[]
  abbreviations: Record<string, string>
  notes: string
  rawText: string
  tracker: ProjectTracker
}

export interface PaletteSlot {
  role: string
  yarnName: string
  hex: string
  brand: string
  weight: string
}

export interface WishlistYarnItem {
  id: string
  name: string
  brand: string
  weight: string
  color: string
  hex: string
  amount: string
  link: string
  priority: 'want' | 'need' | 'someday'
  bought: boolean
}

export interface WishlistItem {
  id: string
  createdAt: number
  updatedAt: number
  title: string
  patternId: string | null
  patternTitle: string
  craft: 'knitting' | 'crochet'
  difficulty: string
  gauge: string
  gaugeData: GaugeData
  needles: string
  sizes: string[]
  sections: PatternSection[]
  abbreviations: Record<string, string>
  rawText: string
  notes: string
  vibe: string
  palette: PaletteSlot[]
  wishlistYarn: WishlistYarnItem[]
}

export interface AIPalette {
  name: string
  description: string
  slots: PaletteSlot[]
}

export type SizeTokenKind = 'text' | 'size' | 'gauge-adjustment' | 'measurement-adjustment'

export interface SizeToken {
  kind: SizeTokenKind
  value: string
  sizeIndex?: number
  hidden?: boolean
}
