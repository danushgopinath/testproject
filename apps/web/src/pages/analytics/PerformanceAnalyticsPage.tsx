import { TrendingUp, Star, Clock, Users } from 'lucide-react'
import { DashboardSidebar } from '../../components/organisms/DashboardSidebar'

export function PerformanceAnalyticsPage() {
  // Mock data - replace with real data from API
  const stats = {
    responseRate: 95,
    averageRating: 4.9,
    averageResponseTime: '2.5 hours',
    repeatClients: 68,
  }

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
              <p className="mt-2 text-2xl font-bold text-text-primary">{stats.responseRate}%</p>
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
              <p className="mt-2 text-2xl font-bold text-text-primary">{stats.averageRating}</p>
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
              <p className="mt-2 text-2xl font-bold text-text-primary">{stats.averageResponseTime}</p>
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
              <p className="mt-2 text-2xl font-bold text-text-primary">{stats.repeatClients}%</p>
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
          Detailed performance charts and insights will be available here soon.
        </p>
      </div>
        </div>
      </div>
    </div>
  )
}
