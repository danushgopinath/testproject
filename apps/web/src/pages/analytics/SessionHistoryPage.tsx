import { DashboardSidebar } from '../../components/organisms/DashboardSidebar'

export function SessionHistoryPage() {
  return (
    <div className="flex w-full">
      <DashboardSidebar />
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Session History</h1>
        <p className="mt-2 text-sm text-text-muted">View your past mentorship sessions</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Coming Soon</h2>
        <p className="text-sm text-text-muted">
          Your complete session history with detailed analytics will be available here soon.
        </p>
      </div>
        </div>
      </div>
    </div>
  )
}
