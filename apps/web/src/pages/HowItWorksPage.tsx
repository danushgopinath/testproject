export function HowItWorksPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          How Expertify works
        </h1>
        <p className="text-sm text-text-muted">
          Built for students and early-career professionals who want honest,
          specific guidance from people who have actually done it.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            For seekers
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-4 text-xs text-text-muted">
            <li>Browse guides by university, journey type, or target role.</li>
            <li>Read their lived-experience journeys and outcomes.</li>
            <li>Book a focused 1:1 session around a specific decision.</li>
            <li>Leave an honest review to help future seekers.</li>
          </ol>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            For guides
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-4 text-xs text-text-muted">
            <li>Share the journeys you&apos;re comfortable speaking about.</li>
            <li>Set your availability and decide if sessions are free or paid.</li>
            <li>Accept or decline session requests that fit your bandwidth.</li>
            <li>Build a track record of helpful, honest conversations.</li>
          </ol>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            What this is not
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-4 text-xs text-text-muted">
            <li>Not admissions consulting or ghostwriting.</li>
            <li>Not career coaching or therapy.</li>
            <li>Not a place to oversell outcomes or credentials.</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

