import { Badge, Button, Card, SectionLabel, Spinner } from '@knitwise/ui'

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-16">
      <header className="border-b border-frame pb-6 pt-12">
        <SectionLabel>Knitwise Studio</SectionLabel>
        <h1 className="mt-2 font-display text-5xl font-bold leading-[1.05] text-ink">
          My <em className="not-italic font-display italic text-accent">Library</em>
        </h1>
        <p className="mt-2 max-w-prose text-sm text-ink-soft">
          Bring any pattern. Track every stitch. Knit your size.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="accent">+ Add Pattern</Button>
          <Button variant="secondary">Import from PDF</Button>
          <Button variant="ghost" size="sm">
            View wishlist
          </Button>
        </div>
      </header>

      <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Status tones" className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge tone="neutral">Not Started</Badge>
            <Badge tone="green">In Progress</Badge>
            <Badge tone="gold">Finished</Badge>
            <Badge tone="terra">Future</Badge>
          </div>
        </Card>

        <Card title="Size annotations" className="space-y-2">
          <p className="font-mono text-xs leading-relaxed text-ink-soft">
            Cast on{' '}
            <Badge tone="hi" className="px-2">
              106
            </Badge>{' '}
            <span className="opacity-40">[112: 118: 124: 130]</span> sts —{' '}
            <Badge tone="adj" className="px-2">
              98
            </Badge>{' '}
            scaled
          </p>
        </Card>

        <Card title="Loading">
          <div className="flex items-center gap-3">
            <Spinner size={18} />
            <span className="text-sm text-ink-soft">Parsing your pattern…</span>
          </div>
        </Card>
      </section>
    </div>
  )
}
