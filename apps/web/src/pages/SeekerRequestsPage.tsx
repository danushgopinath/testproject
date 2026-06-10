import { Calendar, Clock, DollarSign, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardSidebar } from '../components/organisms/DashboardSidebar'
import { useSeekerSessions } from '../hooks/useDashboard'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function SeekerRequestsPage() {
  const { data, isLoading } = useSeekerSessions()
  const pending = (data?.upcoming ?? []).filter((s) => s.status === 'PENDING')

  return (
    <div className="flex w-full">
      <DashboardSidebar />
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8">

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">My Session Requests</h1>
            <p className="mt-2 text-sm text-text-muted">
              Sessions you've requested that are awaiting mentor acceptance.
            </p>
          </div>

          {isLoading && (
            <div className="rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
              Loading…
            </div>
          )}

          {!isLoading && pending.length === 0 && (
            <div className="rounded-lg border border-border bg-surface p-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <p className="text-base font-semibold text-text-primary">No pending requests</p>
              <p className="mt-1 text-sm text-text-muted">
                Once you book a session, it'll appear here until the mentor accepts.
              </p>
              <Link
                to="/guides"
                style={{ color: 'white' }}
                className="mt-4 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Browse Mentors
              </Link>
            </div>
          )}

          <div className="space-y-4">
            {pending.map((s) => {
              const cost = (s.totalCost / 100).toFixed(2)
              return (
                <div key={s.id} className="rounded-lg border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {s.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-text-primary">{s.name}</h3>
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                            Awaiting Response
                          </span>
                        </div>
                        <p className="text-xs text-text-muted">{s.role}</p>
                        <p className="mt-1 text-sm font-medium text-text-primary">{s.topic}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {fmtDate(s.scheduledAt)} at {fmtTime(s.scheduledAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {s.durationMinutes} min
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            ${cost}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/guides/${s.guideId}`}
                      className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-background transition-colors shrink-0"
                    >
                      View Mentor
                    </Link>
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