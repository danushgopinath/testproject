import { Check, X } from 'lucide-react'
import { DashboardSidebar } from '../components/organisms/DashboardSidebar'

export function RequestsPage() {
  // Mock data - replace with real data from API
  const requests = [
    {
      id: 1,
      name: 'Amanda Foster',
      initials: 'AF',
      role: 'Junior',
      school: 'NYU Stern',
      topic: 'Consulting recruiting timeline and strategies',
      message: "Hi Diana! I'm really interested in learning about your journey into consulting. Would love to discuss...",
      date: 'Mar 15, 2026',
      time: '2:00 PM',
      duration: '45 min',
      timeAgo: '2 hours ago',
    },
    {
      id: 2,
      name: 'David Park',
      initials: 'DP',
      role: 'Senior',
      school: 'Carnegie Mellon',
      topic: 'Breaking into product management from CS',
      message: "I saw that you made a similar transition and would appreciate your insights on...",
      date: 'Mar 16, 2026',
      time: '11:00 AM',
      duration: '30 min',
      timeAgo: '5 hours ago',
    },
    {
      id: 3,
      name: 'Sophie Chen',
      initials: 'SC',
      role: 'Graduate Student',
      school: 'University of Michigan',
      topic: 'MBA application strategy and essay review',
      message: "I'm applying to top MBA programs this fall and would love guidance on my application strategy...",
      date: 'Mar 18, 2026',
      time: '4:00 PM',
      duration: '60 min',
      timeAgo: '1 day ago',
    },
  ]

  return (
    <div className="flex w-full">
      <DashboardSidebar />
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Session Requests</h1>
        <p className="mt-2 text-sm text-text-muted">Review and respond to session requests from seekers</p>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {request.initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-text-primary">{request.name}</h3>
                    <span className="rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                      {request.role}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-sm text-text-muted">
                    <span>{request.school}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-text-primary">{request.topic}</p>
                  <p className="mt-1 text-sm text-text-muted line-clamp-2">{request.message}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
                    <span>{request.date} {request.time} {request.duration}</span>
                  </div>
                </div>
              </div>
              <div className="ml-4 flex flex-col gap-2">
                <span className="text-xs text-text-muted">{request.timeAgo}</span>
                <div className="flex gap-2">
                  <button className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100">
                    <X className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary/90">
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
        </div>
      </div>
    </div>
  )
}
