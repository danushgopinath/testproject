import { Link } from 'react-router-dom'
import { Globe, ChevronLeft } from 'lucide-react'

export function LanguageSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-8">
      <div className="mb-6">
        <Link to="/settings" className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Settings
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Language</h1>
        <p className="mt-1 text-sm text-text-muted">Choose the language used across the platform.</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Globe className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">English (US)</p>
              <p className="text-xs text-text-muted">Currently the only supported language</p>
            </div>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Active</span>
        </div>
      </div>
    </div>
  )
}