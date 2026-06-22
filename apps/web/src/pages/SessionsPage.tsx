import { useMemo, useState } from 'react'
import { Calendar, Clock, Video, Search, ArrowLeft, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { DashboardSidebar } from '../components/organisms/DashboardSidebar'
import { useAuthStore } from '../stores/authStore'
import { useOpenSessionCall } from '../hooks/useSessions'
import {
  useSeekerSessions,
  useGuideSessions,
  type SeekerSessionItem,
  type GuideSessionItem,
} from '../hooks/useDashboard'

type Tab = 'upcoming' | 'past'
type SessionStatus = SeekerSessionItem['status']

function statusBadge(status: SessionStatus) {
  if (status === 'CONFIRMED') return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Confirmed</span>
  if (status === 'PENDING')   return <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">Pending</span>
  if (status === 'COMPLETED') return <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 flex items-center gap-1"><CheckCircle className="h-3 w-3" />Completed</span>
  return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 flex items-center gap-1"><XCircle className="h-3 w-3" />Missed</span>
}

export function SessionsPage() {
  const location = useLocation()
  const openCall = useOpenSessionCall()
  const { dashboardRole, user } = useAuthStore()
  const activeRole = (dashboardRole as 'SEEKER' | 'GUIDE') || ((user?.role as 'SEEKER' | 'GUIDE') ?? 'SEEKER')
  const isGuide = activeRole === 'GUIDE'

  const params = new URLSearchParams(location.search)
  const initialTab = (params.get('tab') as Tab) || 'upcoming'

  const [tab, setTab] = useState<Tab>(initialTab)
  const [search, setSearch] = useState('')

  const seekerQuery = useSeekerSessions(!isGuide)
  const guideQuery = useGuideSessions(isGuide)
  const data = isGuide ? guideQuery.data : seekerQuery.data
  const isLoading = isGuide ? guideQuery.isLoading : seekerQuery.isLoading

  const upcoming = data?.upcoming ?? []
  const past = data?.past ?? []

  const filtered = useMemo(() => {
    const list = (tab === 'upcoming' ? upcoming : past) as (SeekerSessionItem | GuideSessionItem)[]
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.topic.toLowerCase().includes(q),
    )
  }, [tab, search, upcoming, past])

  return (
    <div className="flex w-full">
      <DashboardSidebar />
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8">

          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-text-muted transition-colors hover:bg-background hover:text-text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Sessions</h1>
              <p className="text-sm text-text-muted">
                {isGuide
                  ? 'Your scheduled and past sessions with seekers.'
                  : 'Your scheduled and past sessions with mentors.'}
              </p>
            </div>
          </div>

          {/* Tabs + Search */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="inline-flex items-center rounded-full border border-border bg-surface p-1 text-sm font-medium">
              <button
                onClick={() => setTab('upcoming')}
                className={`rounded-full px-4 py-1.5 transition-colors ${
                  tab === 'upcoming' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary hover:bg-background'
                }`}
              >
                Upcoming ({upcoming.length})
              </button>
              <button
                onClick={() => setTab('past')}
                className={`rounded-full px-4 py-1.5 transition-colors ${
                  tab === 'past' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary hover:bg-background'
                }`}
              >
                Past ({past.length})
              </button>
            </div>

            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder={isGuide ? 'Search by seeker or topic...' : 'Search by mentor or topic...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* List */}
          <div className="space-y-4">
            {isLoading && (
              <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-text-muted">
                Loading sessions…
              </div>
            )}

            {!isLoading && filtered.map((session) => {
              const dt = new Date(session.scheduledAt)
              const dateLabel = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              const timeLabel = dt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
              const costLabel = session.totalCost > 0 ? `$${(session.totalCost / 100).toFixed(2)}` : 'Free'

              return (
                <div key={session.id} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {session.initials}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm font-semibold text-text-primary">{session.name}</h2>
                          {statusBadge(session.status)}
                        </div>
                        <p className="mt-1 text-xs text-text-muted">{session.role}</p>
                        <p className="mt-1 text-sm font-medium text-text-primary">{session.topic}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-text-muted">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{dateLabel}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeLabel}</span>
                          <span className="flex items-center gap-1"><Video className="h-3 w-3" />{session.durationMinutes} min</span>
                          <span className="font-medium text-text-primary">{costLabel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 md:flex-col md:items-end">
                      {isGuide ? (
                        <>
                          {session.status === 'CONFIRMED' && (
                            <button
                              onClick={() => openCall(session.id)}
                              className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary/90"
                            >
                              Join Session
                            </button>
                          )}
                          <Link
                            to={`/messages?with=${(session as GuideSessionItem).otherUserId}`}
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-text-primary transition-colors hover:bg-background"
                          >
                            <MessageSquare className="h-3.5 w-3.5" /> Message
                          </Link>
                        </>
                      ) : session.status === 'CONFIRMED' || session.status === 'PENDING' ? (
                        <>
                          <button className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-text-primary transition-colors hover:bg-background">
                            Reschedule
                          </button>
                          <button
                            onClick={() => openCall(session.id)}
                            disabled={session.status !== 'CONFIRMED'}
                            className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Join Session
                          </button>
                        </>
                      ) : session.status === 'COMPLETED' ? (
                        <Link
                          to={`/guides/${(session as SeekerSessionItem).guideId}`}
                          className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-text-primary transition-colors hover:bg-background"
                        >
                          View Mentor
                        </Link>
                      ) : (
                        <Link
                          to={`/guides/${(session as SeekerSessionItem).guideId}/book`}
                          className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary/90"
                        >
                          Rebook
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {!isLoading && filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-surface/40 p-8 text-center text-sm text-text-muted">
                {tab === 'upcoming'
                  ? isGuide
                    ? 'No upcoming sessions with seekers yet.'
                    : 'No upcoming sessions. Browse mentors to book your first session!'
                  : 'No past sessions yet.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}