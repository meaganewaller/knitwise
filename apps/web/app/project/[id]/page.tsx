'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { buildGaugeAdjustments } from '@knitwise/core'
import type { Counter, Project, ProjectTracker, TrackerSection } from '@knitwise/core'
import { useStorage } from '@knitwise/storage'
import {
  Badge,
  type BadgeTone,
  Button,
  Card,
  SectionLabel,
  SizedInstructions,
  type SizedInstructionsMode,
} from '@knitwise/ui'

const STATUSES: Array<ProjectTracker['status']> = ['Not Started', 'In Progress', 'Finished']

const STATUS_TONE: Record<ProjectTracker['status'], BadgeTone> = {
  'Not Started': 'neutral',
  'In Progress': 'green',
  Finished: 'gold',
}

const SAVE_DEBOUNCE_MS = 600
const DEMO_MY_GAUGE = { sts: 20, rows: 28, per: 10 }

export default function ProjectPage({ params }: { params: { id: string } }) {
  const storage = useStorage()
  const [project, setProject] = useState<Project | null | undefined>(undefined)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    storage.get<Project>(`project:${params.id}`).then((p) => {
      if (!cancelled) setProject(p)
    })
    return () => {
      cancelled = true
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [storage, params.id])

  const update = useCallback(
    (fn: (p: Project) => Project) => {
      setProject((prev) => {
        if (!prev) return prev
        const next: Project = { ...fn(prev), updatedAt: Date.now() }
        if (saveTimer.current) clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(() => {
          storage.set(`project:${params.id}`, next)
        }, SAVE_DEBOUNCE_MS)
        return next
      })
    },
    [storage, params.id],
  )

  const updateTracker = useCallback(
    (fn: (t: ProjectTracker) => ProjectTracker) => {
      update((p) => ({ ...p, tracker: fn(p.tracker) }))
    },
    [update],
  )

  if (project === undefined) {
    return <div className="mx-auto max-w-4xl px-6 pt-12 text-sm text-ink-soft">Loading…</div>
  }
  if (project === null) {
    return (
      <div className="mx-auto max-w-4xl px-6 pt-12">
        <p className="font-display text-3xl text-ink">Project not found</p>
        <p className="mt-2 text-sm text-ink-soft">
          No project with id <code className="font-mono">{params.id}</code> in storage.
        </p>
        <Link href="/library" className="mt-6 inline-block text-sm text-accent underline">
          ← back to library
        </Link>
      </div>
    )
  }

  const t = project.tracker
  const adjustments =
    t.scalingMode === 'gauge'
      ? t.gaugeAdjustments
      : t.scalingMode === 'measurements'
        ? t.measAdjustments
        : undefined

  function cycleStatus() {
    updateTracker((tr) => ({
      ...tr,
      status: STATUSES[(STATUSES.indexOf(tr.status) + 1) % STATUSES.length],
    }))
  }

  function toggleSection(id: string) {
    updateTracker((tr) => ({
      ...tr,
      sections: tr.sections.map((s) => (s.id === id ? { ...s, done: !s.done } : s)),
    }))
  }

  function adjustCounter(id: string, delta: number) {
    updateTracker((tr) => ({
      ...tr,
      counters: tr.counters.map((c) =>
        c.id === id ? { ...c, value: Math.max(0, c.value + delta) } : c,
      ),
    }))
  }

  function resetCounter(id: string) {
    updateTracker((tr) => ({
      ...tr,
      counters: tr.counters.map((c) => (c.id === id ? { ...c, value: 0 } : c)),
    }))
  }

  function addCounter() {
    updateTracker((tr) => ({
      ...tr,
      counters: [
        ...tr.counters,
        { id: `c-${Date.now()}`, label: 'Counter', value: 0 },
      ],
    }))
  }

  function removeCounter(id: string) {
    updateTracker((tr) => ({
      ...tr,
      counters: tr.counters.filter((c) => c.id !== id),
    }))
  }

  function applyGaugeScaling() {
    const fullText = project!.sections.map((s) => s.instructions).join('\n')
    const adj = buildGaugeAdjustments(fullText, project!.gaugeData, DEMO_MY_GAUGE)
    updateTracker((tr) => ({
      ...tr,
      scalingMode: 'gauge',
      gaugeAdjustments: adj,
      myGauge: DEMO_MY_GAUGE,
    }))
  }

  function clearScaling() {
    updateTracker((tr) => ({ ...tr, scalingMode: 'none' }))
  }

  const done = t.sections.filter((s) => s.done).length
  const total = t.sections.length
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <div className="mx-auto max-w-4xl px-6 pb-16">
      <header className="border-b border-frame pb-6 pt-12">
        <Link
          href="/library"
          className="font-mono text-xs text-green-mid hover:text-green"
        >
          ← Library
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <SectionLabel>
              {project.craft} · {project.difficulty}
            </SectionLabel>
            <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-ink">
              {project.title}
            </h1>
            <p className="mt-2 max-w-prose text-sm text-ink-soft">{project.description}</p>
          </div>
          <button
            onClick={cycleStatus}
            className="rounded-full"
            aria-label="Cycle status"
          >
            <Badge tone={STATUS_TONE[t.status]} className="px-3 py-1 text-sm">
              {t.status}
            </Badge>
          </button>
        </div>
        {total > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between font-mono text-xs text-ink-muted">
              <span>
                {done}/{total} sections done
              </span>
              <span>{pct}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-green-light">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </header>

      <div className="mt-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <SectionLabel className="mr-2">Your size</SectionLabel>
          {project.sizes.map((label, i) => (
            <Button
              key={label}
              variant={t.sizeIndex === i ? 'accent' : 'secondary'}
              size="sm"
              onClick={() => updateTracker((tr) => ({ ...tr, sizeIndex: i }))}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SectionLabel className="mr-2">Mode</SectionLabel>
          {(['highlight', 'strip'] as const).map((m) => (
            <Button
              key={m}
              variant={t.sizeMode === m ? 'accent' : 'secondary'}
              size="sm"
              onClick={() => updateTracker((tr) => ({ ...tr, sizeMode: m }))}
            >
              {m === 'highlight' ? 'Highlight my size' : 'Strip other sizes'}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SectionLabel className="mr-2">Gauge</SectionLabel>
          {t.scalingMode === 'gauge' ? (
            <>
              <Button variant="ghost" size="sm" onClick={clearScaling}>
                Clear scaling
              </Button>
              <span className="font-mono text-xs text-ink-muted">
                {Object.keys(t.gaugeAdjustments).length} brackets adjusted
              </span>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={applyGaugeScaling}>
              Apply gauge scaling (demo: pattern 22 → mine 20)
            </Button>
          )}
        </div>
      </div>

      <Card title="Pattern sections" className="mt-6">
        <div className="space-y-2">
          {t.sections.map((section) => (
            <SectionRow
              key={section.id}
              section={section}
              mode={t.sizeMode}
              sizeIndex={t.sizeIndex}
              adjustments={adjustments}
              onToggle={toggleSection}
            />
          ))}
        </div>
      </Card>

      <Card title="Row counters" className="mt-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {t.counters.map((c) => (
            <CounterCard
              key={c.id}
              counter={c}
              onIncrement={() => adjustCounter(c.id, 1)}
              onDecrement={() => adjustCounter(c.id, -1)}
              onReset={() => resetCounter(c.id)}
              onRemove={() => removeCounter(c.id)}
            />
          ))}
          <button
            onClick={addCounter}
            className="rounded-2xl border border-dashed border-frame px-4 py-6 font-mono text-xs uppercase tracking-eyebrow text-green-mid hover:border-accent hover:text-accent"
          >
            + Add counter
          </button>
        </div>
      </Card>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-soft">
        <Badge tone="hi">your size</Badge>
        <Badge tone="adj">scaled*</Badge>
        <span className="font-mono opacity-40">[other: sizes: dimmed]</span>
      </div>
    </div>
  )
}

function SectionRow({
  section,
  mode,
  sizeIndex,
  adjustments,
  onToggle,
}: {
  section: TrackerSection
  mode: SizedInstructionsMode
  sizeIndex: number
  adjustments?: Record<string, string>
  onToggle: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`rounded-xl border ${section.done ? 'border-green-light bg-green-light/30' : 'border-frame bg-cream'}`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => onToggle(section.id)}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${section.done ? 'border-green bg-green text-white' : 'border-green-light bg-white'}`}
          aria-label={`Mark ${section.title} ${section.done ? 'incomplete' : 'complete'}`}
        >
          {section.done ? <span className="text-xs">✓</span> : null}
        </button>
        <button
          onClick={() => setOpen((o) => !o)}
          className={`flex-1 text-left text-sm font-medium ${section.done ? 'text-ink-muted line-through' : 'text-ink'}`}
        >
          {section.title}
        </button>
        {section.estimatedRows > 0 && (
          <span className="font-mono text-[0.65rem] text-ink-muted">
            ~{section.estimatedRows}r
          </span>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          className="font-mono text-xs text-green-mid"
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          {open ? '▲' : '▼'}
        </button>
      </div>
      {open && (
        <div className="border-t border-frame px-4 py-3">
          <SizedInstructions
            text={section.instructions}
            sizeIndex={sizeIndex}
            mode={mode}
            adjustments={adjustments}
          />
        </div>
      )}
    </div>
  )
}

function CounterCard({
  counter,
  onIncrement,
  onDecrement,
  onReset,
  onRemove,
}: {
  counter: Counter
  onIncrement: () => void
  onDecrement: () => void
  onReset: () => void
  onRemove: () => void
}) {
  return (
    <div className="rounded-2xl border border-frame bg-cream p-3">
      <div className="flex items-center justify-between">
        <div className="font-mono text-xs uppercase tracking-eyebrow text-green-mid">
          {counter.label}
        </div>
        <button
          onClick={onRemove}
          className="text-xs text-ink-muted hover:text-terra"
          aria-label="Remove counter"
        >
          ✕
        </button>
      </div>
      <div className="mt-2 text-center font-display text-4xl font-bold text-ink">
        {counter.value}
      </div>
      <div className="mt-2 flex items-center justify-center gap-2">
        <Button variant="secondary" size="sm" onClick={onDecrement}>
          −
        </Button>
        <Button variant="accent" size="sm" onClick={onIncrement}>
          +
        </Button>
        <Button variant="ghost" size="sm" onClick={onReset} aria-label="Reset">
          ↺
        </Button>
      </div>
    </div>
  )
}
