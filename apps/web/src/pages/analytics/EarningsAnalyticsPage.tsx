import { DollarSign, TrendingUp, Calendar, Users } from 'lucide-react'
import { DashboardSidebar } from '../../components/organisms/DashboardSidebar'
import { useGuideAnalytics } from '../../hooks/useDashboard'

function fmtUsd(v: number) {
  return v.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}

export function EarningsAnalyticsPage() {
  const { data, isLoading } = useGuideAnalytics()
  const stats = data?.earnings ?? {
    totalEarnings: 0, thisMonth: 0, averagePerSession: 0, sessionsThisMonth: 0,
  }
  const dash = (v: string) => (isLoading ? '—' : v)

  return (
    <div className="flex w-full">
      <DashboardSidebar />
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">Earnings</h1>
            <p className="mt-2 text-sm text-text-muted">Track your earnings from mentorship sessions</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Total Earnings</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">{dash(fmtUsd(stats.totalEarnings))}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">This Month</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">{dash(fmtUsd(stats.thisMonth))}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Avg. per Session</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">{dash(fmtUsd(stats.averagePerSession))}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Sessions This Month</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">{dash(String(stats.sessionsThisMonth))}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {!isLoading && stats.totalEarnings === 0 && (
            <div className="mt-8 rounded-xl border border-border bg-surface p-6">
              <h2 className="mb-2 text-lg font-semibold text-text-primary">No earnings yet</h2>
              <p className="text-sm text-text-muted">
                Earnings appear here once you've accepted sessions. Confirmed and completed sessions both count.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}