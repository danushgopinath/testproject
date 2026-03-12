import { DollarSign, TrendingDown, Calendar, Users } from 'lucide-react'
import { DashboardSidebar } from '../../components/organisms/DashboardSidebar'

export function SpendingAnalyticsPage() {
  // Mock data - replace with real data from API
  const stats = {
    totalSpent: 1240,
    thisMonth: 320,
    averagePerSession: 45,
    sessionsThisMonth: 7,
  }

  return (
    <div className="flex w-full">
      <DashboardSidebar />
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Spending Overview</h1>
        <p className="mt-2 text-sm text-text-muted">Track your spending on mentorship sessions</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Total Spent</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">${stats.totalSpent}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">This Month</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">${stats.thisMonth}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <TrendingDown className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Avg. per Session</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">${stats.averagePerSession}</p>
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
              <p className="mt-2 text-2xl font-bold text-text-primary">{stats.sessionsThisMonth}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Coming Soon</h2>
        <p className="text-sm text-text-muted">
          Detailed spending charts and analytics will be available here soon.
        </p>
      </div>
        </div>
      </div>
    </div>
  )
}
