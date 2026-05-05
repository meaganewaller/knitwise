'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ChangeEvent, useState } from 'react'
import type { Project } from '@knitwise/core'
import { parsePattern } from '@knitwise/core'
import { useStorage } from '@knitwise/storage'
import { Button, Card, SectionLabel, Spinner } from '@knitwise/ui'
import { createBlankProject, createProject } from '@/lib/project'

type Mode = 'paste' | 'upload' | 'blank' | null

export default function ImportPage() {
  const router = useRouter()
  const storage = useStorage()
  const [mode, setMode] = useState<Mode>(null)
  const [text, setText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function saveAndOpen(project: Project) {
    await storage.set(`project:${project.id}`, project)
    router.push(`/project/${project.id}`)
  }

  async function runParse(rawText: string, isPDF: boolean, pdfB64?: string) {
    setParsing(true)
    setError(null)
    try {
      const partial = await parsePattern(rawText, isPDF, pdfB64)
      await saveAndOpen(createProject(partial))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse pattern.')
      setParsing(false)
    }
  }

  function handlePasteSubmit() {
    if (!text.trim()) return
    void runParse(text, false)
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const isPDF =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

    if (isPDF) {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        const b64 = dataUrl.split(',')[1] ?? ''
        void runParse('', true, b64)
      }
      reader.onerror = () => setError('Could not read PDF file.')
      reader.readAsDataURL(file)
    } else {
      file
        .text()
        .then((t) => {
          setText(t)
          void runParse(t, false)
        })
        .catch(() => setError('Could not read text file.'))
    }
  }

  async function handleBlank() {
    await saveAndOpen(createBlankProject())
  }

  if (parsing) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <Spinner size={32} />
        <p className="font-display text-2xl text-ink">Reading your pattern…</p>
        <p className="font-mono text-xs text-ink-muted">
          Extracting sections, sizes, yarn, and abbreviations.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pb-16">
      <header className="border-b border-frame pb-6 pt-12">
        <Link
          href="/library"
          className="font-mono text-xs text-green-mid hover:text-green"
        >
          ← Library
        </Link>
        <SectionLabel className="mt-3">Add Pattern</SectionLabel>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-ink">
          How would you like to{' '}
          <em className="font-display italic text-accent not-italic">bring in</em>{' '}
          your pattern?
        </h1>
        <p className="mt-2 max-w-prose text-sm text-ink-soft">
          AI will parse sections, sizes, yarn, and abbreviations and set up your tracker.
        </p>
      </header>

      {error && (
        <div className="mt-6 rounded-xl border border-terra bg-terra-light px-4 py-3 font-mono text-sm text-terra">
          ⚠ {error}
        </div>
      )}

      <div className="mt-8 space-y-3">
        <ImportOption
          icon="📄"
          title="Upload PDF or text file"
          description=".pdf, .txt — AI reads it directly"
          accent="green"
          expanded={mode === 'upload'}
          onClick={() => setMode(mode === 'upload' ? null : 'upload')}
        >
          <label
            htmlFor="patternFile"
            className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-green-light bg-cream px-4 py-6 text-sm text-green-mid hover:border-accent hover:text-accent"
          >
            <span>Choose file</span>
            <input
              id="patternFile"
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              onChange={handleFile}
              className="sr-only"
            />
          </label>
        </ImportOption>

        <ImportOption
          icon="📋"
          title="Paste pattern text"
          description="Copy and paste raw pattern text"
          accent="terra"
          expanded={mode === 'paste'}
          onClick={() => setMode(mode === 'paste' ? null : 'paste')}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your pattern here…"
            className="h-44 w-full resize-y rounded-xl border border-frame bg-cream p-3 font-mono text-xs leading-relaxed text-ink outline-none focus:border-accent"
          />
          <Button
            variant="accent"
            className="mt-3 w-full"
            onClick={handlePasteSubmit}
            disabled={!text.trim()}
          >
            Parse with AI →
          </Button>
        </ImportOption>

        <ImportOption
          icon="✏️"
          title="Build manually"
          description="Blank template — fill each section yourself"
          accent="gold"
          expanded={mode === 'blank'}
          onClick={() => setMode('blank')}
        >
          <Button variant="accent" onClick={handleBlank}>
            Create blank project →
          </Button>
        </ImportOption>
      </div>
    </div>
  )
}

function ImportOption({
  icon,
  title,
  description,
  accent,
  expanded,
  onClick,
  children,
}: {
  icon: string
  title: string
  description: string
  accent: 'green' | 'terra' | 'gold'
  expanded: boolean
  onClick: () => void
  children?: React.ReactNode
}) {
  const accentBorder = {
    green: 'border-green-light',
    terra: 'border-terra-light',
    gold: 'border-gold-light',
  }[accent]

  const accentText = {
    green: 'text-green',
    terra: 'text-terra',
    gold: 'text-gold',
  }[accent]

  return (
    <Card className={`${expanded ? `border-2 ${accentBorder}` : ''} p-0`}>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-4 p-5 text-left"
      >
        <span className="text-2xl">{icon}</span>
        <span className="flex-1">
          <span className={`block font-medium ${accentText}`}>{title}</span>
          <span className="block text-xs text-ink-soft">{description}</span>
        </span>
        <span className={`font-mono text-sm ${accentText}`}>{expanded ? '−' : '+'}</span>
      </button>
      {expanded && children && (
        <div className="border-t border-frame px-5 pb-5 pt-4">{children}</div>
      )}
    </Card>
  )
}
