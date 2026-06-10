import { DollarSign, TrendingDown, Calendar, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { DashboardSidebar } from '../../components/organisms/DashboardSidebar'
import { useSeekerAnalytics } from '../../hooks/useDashboard'

export function SpendingAnalyticsPage() {
  const { data, isLoading } = useSeekerAnalytics()

  const spending = data?.spending ?? {
    totalSpent: 0,
    thisMonth: 0,
    averagePerSession: 0,
    sessionsThisMonth: 0,
    totalSessions: 0,
  }

  const fmt = (n: number) =>
    n === 0 ? '$0.00' : `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

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
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Spending Overview</h1>
              <p className="text-sm text-text-muted">Track your spending on mentorship sessions</p>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-text-muted">
              Loading spending data…
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-surface p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-muted">Total Spent</p>
                      <p className="mt-2 text-2xl font-bold text-text-primary">{fmt(spending.totalSpent)}</p>
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
                      <p className="mt-2 text-2xl font-bold text-text-primary">{fmt(spending.thisMonth)}</p>
                      {spending.sessionsThisMonth > 0 && (
                        <p className="mt-1 text-xs text-text-muted">{spending.sessionsThisMonth} session{spending.sessionsThisMonth !== 1 ? 's' : ''}</p>
                      )}
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
                      <p className="mt-2 text-2xl font-bold text-text-primary">{fmt(spending.averagePerSession)}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-muted">Sessions Completed</p>
                      <p className="mt-2 text-2xl font-bold text-text-primary">{spending.totalSessions}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-border bg-surface p-6">
                <h2 className="mb-2 text-base font-semibold text-text-primary">Spending Charts</h2>
                <p className="text-sm text-text-muted">
                  Detailed spending charts and analytics will be available here soon.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}