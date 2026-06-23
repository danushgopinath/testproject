import { AlertTriangle, X } from 'lucide-react'
import { useCancelSession } from '../../hooks/useSessions'
import { estimateRefund } from '../../lib/refund'

export interface CancelTarget {
  id: string
  name: string
  status: string
  scheduledAt: string
  totalCost: number // cents
}

const money = (cents: number) => (cents > 0 ? `$${(cents / 100).toFixed(2)}` : '$0.00')

export function CancelSessionModal({ session, onClose }: { session: CancelTarget; onClose: () => void }) {
  const cancel = useCancelSession()
  const free = session.totalCost === 0
  const est = estimateRefund(session.status, session.scheduledAt, session.totalCost)

  const confirm = () => {
    cancel.mutate(session.id, { onSuccess: () => onClose() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-semibold text-text-primary">Cancel session?</h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-text-muted">
          You're about to cancel your session with <span className="font-medium text-text-primary">{session.name}</span>.
        </p>

        {/* Policy */}
        <div className="mt-4 rounded-lg border border-border bg-background p-3 text-xs text-text-muted">
          <p className="font-medium text-text-primary">Cancellation policy</p>
          <ul className="mt-1.5 space-y-1">
            <li>• Before the mentor accepts: <span className="text-text-primary">free</span></li>
            <li>• More than 24h before start: <span className="text-text-primary">full refund</span></li>
            <li>• 12–24h before: <span className="text-text-primary">50% refund</span></li>
            <li>• 3–12h before: <span className="text-text-primary">25% refund</span></li>
            <li>• Less than 3h before: <span className="text-text-primary">no refund</span></li>
          </ul>
        </div>

        {/* This session's outcome */}
        {!free && (
          <div className="mt-3 rounded-lg border border-border bg-surface p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Refund</span>
              <span className="font-semibold text-text-primary">{money(est.refundCents)}</span>
            </div>
            {est.chargeCents > 0 && (
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-text-muted">Charge</span>
                <span className="font-semibold text-text-primary">{money(est.chargeCents)}</span>
              </div>
            )}
            <p className="mt-2 text-xs text-text-muted">{est.label}.</p>
          </div>
        )}
        {free && <p className="mt-3 text-sm text-text-muted">{est.label}.</p>}

        {cancel.isError && (
          <p className="mt-3 text-sm text-red-600">Couldn’t cancel. Please try again.</p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={cancel.isPending}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-background disabled:opacity-50"
          >
            Keep session
          </button>
          <button
            onClick={confirm}
            disabled={cancel.isPending}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            style={{ color: 'white' }}
          >
            {cancel.isPending ? 'Cancelling…' : 'Confirm cancellation'}
          </button>
        </div>
      </div>
    </div>
  )
}