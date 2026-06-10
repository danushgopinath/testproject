import { Check, X, Calendar, Clock, DollarSign } from 'lucide-react'
import { DashboardSidebar } from '../components/organisms/DashboardSidebar'
import { useGuidePendingRequests } from '../hooks/useDashboard'
import { useAcceptSession, useDeclineSession } from '../hooks/useSessions'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}
function relativeTime(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime())
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function RequestsPage() {
  const { data: requests, isLoading } = useGuidePendingRequests()
  const acceptSession = useAcceptSession()
  const declineSession = useDeclineSession()

  const items = requests ?? []

  return (
    <div className="flex w-full">
      <DashboardSidebar />
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8">

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">Session Requests</h1>
            <p className="mt-2 text-sm text-text-muted">Review and respond to session requests from seekers</p>
          </div>

          {isLoading && (
            <div className="rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
              Loading requests…
            </div>
          )}

          {!isLoading && items.length === 0 && (
            <div className="rounded-lg border border-border bg-surface p-10 text-center">
              <p className="text-base font-semibold text-text-primary">No pending requests</p>
              <p className="mt-1 text-sm text-text-muted">
                When seekers book a session with you, their requests will appear here.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {items.map((request) => {
              const cost = (request.totalCost / 100).toFixed(2)
              return (
                <div key={request.id} className="rounded-lg border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {request.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-text-primary">{request.name}</h3>
                          <span className="text-xs text-text-muted">{request.email}</span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-text-primary">{request.topic}</p>
                        {request.notes && (
                          <p className="mt-1 text-sm text-text-muted line-clamp-2 italic">"{request.notes}"</p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {fmtDate(request.scheduledAt)} at {fmtTime(request.scheduledAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {request.durationMinutes} min
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            ${cost}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-xs text-text-muted">{relativeTime(request.createdAt)}</span>
                      <div className="flex gap-2">
                        <button
                          disabled={declineSession.isPending || acceptSession.isPending}
                          onClick={() => declineSession.mutate(request.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                        >
                          <X className="h-4 w-4" /> Decline
                        </button>
                        <button
                          disabled={acceptSession.isPending || declineSession.isPending}
                          onClick={() => acceptSession.mutate(request.id)}
                          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" /> Accept
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}