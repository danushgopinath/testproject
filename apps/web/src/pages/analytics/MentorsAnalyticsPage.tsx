import { Users, BookOpen, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardSidebar } from '../../components/organisms/DashboardSidebar'
import { useSeekerAnalytics } from '../../hooks/useDashboard'

export function MentorsAnalyticsPage() {
  const { data, isLoading } = useSeekerAnalytics()

  const mentors = data?.mentors ?? []
  const totalSessions = mentors.reduce((acc, m) => acc + m.completedSessions, 0)

  return (
    <div className="flex w-full">
      <DashboardSidebar />
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8">

          <div className="mb-6 flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-text-muted transition-colors hover:bg-background hover:text-text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Mentors Connected</h1>
              <p className="text-sm text-text-muted">Overview of your mentor connections</p>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-text-muted">
              Loading mentor data…
            </div>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-surface p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-muted">Total Mentors</p>
                      <p className="mt-2 text-2xl font-bold text-text-primary">{mentors.length}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-muted">Sessions Completed</p>
                      <p className="mt-2 text-2xl font-bold text-text-primary">{totalSessions}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              {mentors.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-surface/40 p-8 text-center text-sm text-text-muted">
                  No mentor connections yet. Book a session to get started!
                </div>
              ) : (
                <div className="space-y-3">
                  {mentors.map((mentor) => {
                    const lastSession = mentor.lastSessionAt
                      ? new Date(mentor.lastSessionAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : null

                    return (
                      <div key={mentor.id} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                              {mentor.initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-text-primary">{mentor.name}</p>
                              <p className="text-xs text-text-muted">{mentor.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-text-primary">
                              {mentor.completedSessions} session{mentor.completedSessions !== 1 ? 's' : ''}
                            </p>
                            {lastSession && (
                              <p className="text-xs text-text-muted">Last: {lastSession}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}