import type {
  PatternSection,
  Project,
  ProjectTracker,
  YarnEntry,
} from '@knitwise/core'

function uid(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

function trackerFromPattern(
  sections: PatternSection[],
  yarn: YarnEntry[],
): ProjectTracker {
  return {
    status: 'Not Started',
    sizeIndex: 0,
    sizeMode: 'highlight',
    myGauge: { sts: null, rows: null, per: 10 },
    myMeasurements: { bust: '', waist: '', hips: '', length: '', sleeve: '' },
    scalingMode: 'none',
    gaugeAdjustments: {},
    measAdjustments: {},
    sections: sections.map((s) => ({ ...s, done: false, notes: '' })),
    counters: [
      { id: 'c1', label: 'Main', value: 0 },
      { id: 'c2', label: 'Repeat', value: 0 },
    ],
    totalSeconds: 0,
    yarn,
    notes: { general: '', tension: '', adjustments: '', photos: '' },
    photos: [],
    qa: [],
  }
}

export function createProject(seed: Partial<Project> = {}): Project {
  const now = Date.now()
  const sections = seed.sections ?? []
  const yarn = seed.yarn ?? []
  return {
    id: seed.id ?? uid(),
    createdAt: seed.createdAt ?? now,
    updatedAt: seed.updatedAt ?? now,
    title: seed.title ?? 'Untitled Pattern',
    craft: seed.craft ?? 'knitting',
    difficulty: seed.difficulty ?? 'intermediate',
    description: seed.description ?? '',
    sizes: seed.sizes ?? [],
    gauge: seed.gauge ?? '',
    gaugeData: seed.gaugeData ?? { sts: null, rows: null, per: 10 },
    needles: seed.needles ?? '',
    yarn,
    sections,
    abbreviations: seed.abbreviations ?? {},
    notes: seed.notes ?? '',
    rawText: seed.rawText ?? '',
    tracker: seed.tracker ?? trackerFromPattern(sections, yarn),
  }
}

export function createBlankProject(): Project {
  return createProject({
    title: 'New Pattern',
    sections: [{ id: 's1', title: 'Section 1', instructions: '', estimatedRows: 0 }],
  })
}
