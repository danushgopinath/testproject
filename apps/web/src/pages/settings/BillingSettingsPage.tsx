import { Link } from 'react-router-dom'
import { CreditCard, ChevronLeft } from 'lucide-react'

export function BillingSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-8">
      <div className="mb-6">
        <Link to="/settings" className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Settings
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Payment Methods</h1>
        <p className="mt-1 text-sm text-text-muted">Manage how you pay for sessions on Expertify.</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <CreditCard className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-base font-semibold text-text-primary">Payment methods coming soon</h2>
        <p className="mt-1 text-sm text-text-muted">
          Stripe integration is on the roadmap. Sessions are currently free or invoiced directly.
        </p>
      </div>
    </div>
  )
}