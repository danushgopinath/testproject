import { TrendingUp, Star, Clock, Users } from 'lucide-react'
import { DashboardSidebar } from '../../components/organisms/DashboardSidebar'
import { useGuideAnalytics } from '../../hooks/useDashboard'

function formatHours(h: number | null): string {
  if (h == null) return '—'
  if (h < 1) return `${Math.round(h * 60)} min`
  if (h < 24) return `${h.toFixed(1)} hours`
  return `${(h / 24).toFixed(1)} days`
}

export function PerformanceAnalyticsPage() {
  const { data, isLoading } = useGuideAnalytics()
  const stats = data?.performance ?? {
    responseRate: 0,
    averageRating: null as number | null,
    averageResponseTimeHours: null as number | null,
    repeatClientsPct: 0,
  }
  const dash = (v: string) => (isLoading ? '—' : v)

  return (
    <div className="flex w-full">
      <DashboardSidebar />
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">Performance</h1>
            <p className="mt-2 text-sm text-text-muted">Track your mentorship performance metrics</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Response Rate</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">{dash(`${stats.responseRate}%`)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
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
                  <p className="text-sm text-text-muted">Avg. Response Time</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">
                    {dash(formatHours(stats.averageResponseTimeHours))}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Repeat Clients</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">{dash(`${stats.repeatClientsPct}%`)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {!isLoading && stats.responseRate === 0 && stats.averageRating == null && (
            <div className="mt-8 rounded-xl border border-border bg-surface p-6">
              <h2 className="mb-2 text-lg font-semibold text-text-primary">Not enough data yet</h2>
              <p className="text-sm text-text-muted">
                Performance metrics populate as you receive and respond to session requests.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
