import { Users, Star, Calendar, TrendingUp } from 'lucide-react'
import { DashboardSidebar } from '../../components/organisms/DashboardSidebar'
import { useGuideAnalytics } from '../../hooks/useDashboard'

export function StudentsAnalyticsPage() {
  const { data, isLoading } = useGuideAnalytics()
  const stats = data?.students ?? {
    totalStudents: 0, activeStudents: 0, averageRating: null as number | null, totalSessions: 0,
  }
  const dash = (v: string) => (isLoading ? '—' : v)

  return (
    <div className="flex w-full">
      <DashboardSidebar />
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">Students Helped</h1>
            <p className="mt-2 text-sm text-text-muted">Overview of students you've mentored</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Total Students</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">{dash(String(stats.totalStudents))}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Active (last 30 days)</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">{dash(String(stats.activeStudents))}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Avg. Rating</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">
                    {dash(stats.averageRating != null ? stats.averageRating.toFixed(1) : '—')}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Star className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Completed Sessions</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">{dash(String(stats.totalSessions))}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {!isLoading && stats.totalStudents === 0 && (
            <div className="mt-8 rounded-xl border border-border bg-surface p-6">
              <h2 className="mb-2 text-lg font-semibold text-text-primary">No students yet</h2>
              <p className="text-sm text-text-muted">
                Once seekers book sessions with you, you'll see student counts and engagement here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}