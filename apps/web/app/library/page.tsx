'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Project } from '@knitwise/core'
import { useStorage } from '@knitwise/storage'
import { Badge, Button, Card, SectionLabel } from '@knitwise/ui'
import { createDemoProject } from '@/lib/seed'

const PROJECT_PREFIX = 'project:'

const STATUS_TONE = {
  'Not Started': 'neutral',
  'In Progress': 'green',
  Finished: 'gold',
} as const

export default function LibraryPage() {
  const storage = useStorage()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[] | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const keys = await storage.list(PROJECT_PREFIX)
      const records = await Promise.all(keys.map((k) => storage.get<Project>(k)))
      if (cancelled) return
      const valid = records
        .filter((p): p is Project => p !== null)
        .sort((a, b) => b.updatedAt - a.updatedAt)
      setProjects(valid)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [storage])

  async function seedDemo() {
    const project = createDemoProject()
    await storage.set(`${PROJECT_PREFIX}${project.id}`, project)
    router.push(`/project/${project.id}`)
  }

  async function deleteProject(id: string) {
    await storage.delete(`${PROJECT_PREFIX}${id}`)
    setProjects((prev) => (prev ?? []).filter((p) => p.id !== id))
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pb-16">
      <header className="border-b border-frame pb-6 pt-12">
        <SectionLabel>Knitwise Studio</SectionLabel>
        <h1 className="mt-2 font-display text-5xl font-bold leading-[1.05] text-ink">
          My <em className="font-display italic text-accent not-italic">Library</em>
        </h1>
        <p className="mt-2 max-w-prose text-sm text-ink-soft">
          Bring any pattern. Track every stitch. Knit your size.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href="/import">
            <Button variant="accent">+ Add pattern</Button>
          </Link>
          <Button variant="secondary" onClick={seedDemo}>
            Seed demo project
          </Button>
        </div>
      </header>

      {projects === null && (
        <p className="mt-12 text-sm text-ink-soft">Loading…</p>
      )}

      {projects?.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-frame bg-paper p-12 text-center">
          <p className="font-display text-2xl text-ink">No patterns yet</p>
          <p className="mt-2 text-sm text-ink-soft">
            Seed the demo project to see the editor in action.
          </p>
        </div>
      )}

      {projects && projects.length > 0 && (
        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const done = p.tracker.sections.filter((s) => s.done).length
            const total = p.tracker.sections.length
            return (
              <Card
                key={p.id}
                interactive
                className="flex h-full flex-col"
                onClick={() => router.push(`/project/${p.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <Badge tone={STATUS_TONE[p.tracker.status]}>{p.tracker.status}</Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteProject(p.id)
                    }}
                    className="text-ink-muted hover:text-terra"
                    aria-label={`Delete ${p.title}`}
                  >
                    ✕
                  </button>
                </div>
                <h3 className="mt-3 font-display text-xl font-bold text-ink">{p.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{p.description}</p>
                <div className="mt-auto flex items-center justify-between pt-4 font-mono text-xs text-ink-muted">
                  <span>
                    {done}/{total} done
                  </span>
                  <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                </div>
              </Card>
            )
          })}
        </section>
      )}
    </div>
  )
}
