import { useMemo, useState } from 'react'
import { Calendar, Clock, Video, Search, ArrowLeft } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

type SessionStatus = 'upcoming' | 'past'

interface SessionItem {
  id: number
  status: SessionStatus
  name: string
  initials: string
  role: string
  topic: string
  dateLabel: string
  date: string
  time: string
  duration: string
}

const MOCK_SESSIONS: SessionItem[] = [
  {
    id: 1,
    status: 'upcoming',
    name: 'Sarah Chen',
    initials: 'SC',
    role: 'Product Manager @ Google',
    topic: 'Breaking into PM roles at FAANG',
    dateLabel: 'Today',
    date: 'Mar 11, 2026',
    time: '3:00 PM',
    duration: '45 min',
  },
  {
    id: 2,
    status: 'upcoming',
    name: 'Marcus Johnson',
    initials: 'MJ',
    role: 'Software Engineer @ Meta',
    topic: 'Technical interview preparation',
    dateLabel: 'Tomorrow',
    date: 'Mar 12, 2026',
    time: '10:00 AM',
    duration: '60 min',
  },
  {
    id: 3,
    status: 'upcoming',
    name: 'Emily Rodriguez',
    initials: 'ER',
    role: 'Investment Banking Analyst @ Goldman Sachs',
    topic: 'Finance internship application strategy',
    dateLabel: 'Mar 13, 2026',
    date: 'Mar 13, 2026',
    time: '2:30 PM',
    duration: '30 min',
  },
  {
    id: 4,
    status: 'past',
    name: 'Alex Kim',
    initials: 'AK',
    role: 'Stanford Admissions Mentor',
    topic: 'MBA application strategy and essay review',
    dateLabel: 'Mar 4, 2026',
    date: 'Mar 4, 2026',
    time: '5:00 PM',
    duration: '60 min',
  },
  {
    id: 5,
    status: 'past',
    name: 'Rachel Lee',
    initials: 'RL',
    role: 'Data Scientist @ Airbnb',
    topic: 'Breaking into data science from non-traditional background',
    dateLabel: 'Feb 28, 2026',
    date: 'Feb 28, 2026',
    time: '11:00 AM',
    duration: '45 min',
  },
]

export function SessionsPage() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const initialTab = (params.get('tab') as SessionStatus) || 'upcoming'

  const [tab, setTab] = useState<SessionStatus>(initialTab)
  const [search, setSearch] = useState('')

  const filteredSessions = useMemo(
    () =>
      MOCK_SESSIONS.filter((session) => {
        if (session.status !== tab) return false
        const q = search.toLowerCase()
        if (!q) return true
        return (
          session.name.toLowerCase().includes(q) ||
          session.role.toLowerCase().includes(q) ||
          session.topic.toLowerCase().includes(q)
        )
      }),
    [tab, search],
  )

  return (
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
            Manage your scheduled sessions with guides.
          </p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex items-center rounded-full border border-border bg-surface p-1 text-sm font-medium">
          <button
            onClick={() => setTab('upcoming')}
            className={`rounded-full px-4 py-1.5 transition-colors ${
              tab === 'upcoming'
                ? 'bg-primary text-white'
                : 'text-text-muted hover:text-text-primary hover:bg-background'
            }`}
          >
            Upcoming ({MOCK_SESSIONS.filter((s) => s.status === 'upcoming').length})
          </button>
          <button
            onClick={() => setTab('past')}
            className={`rounded-full px-4 py-1.5 transition-colors ${
              tab === 'past'
                ? 'bg-primary text-white'
                : 'text-text-muted hover:text-text-primary hover:bg-background'
            }`}
          >
            Past ({MOCK_SESSIONS.filter((s) => s.status === 'past').length})
          </button>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search sessions by mentor or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Sessions list */}
      <div className="space-y-4">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="rounded-xl border border-border bg-surface p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {session.initials}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-text-primary">{session.name}</h2>
                    {session.status === 'upcoming' ? (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                        Starting Soon
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-text-muted">{session.role}</p>
                  <p className="mt-1 text-sm font-medium text-text-primary">{session.topic}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {session.dateLabel} · {session.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {session.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      {session.duration}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 md:flex-col md:items-end">
                {session.status === 'upcoming' && (
                  <button className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-text-primary transition-colors hover:bg-background">
                    Reschedule
                  </button>
                )}
                <button className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary/90">
                  {session.status === 'upcoming' ? 'Join Session' : 'View Notes'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredSessions.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-surface/40 p-8 text-center text-sm text-text-muted">
            No {tab === 'upcoming' ? 'upcoming' : 'past'} sessions match your search.
          </div>
        )}
      </div>
    </div>
  )
}

