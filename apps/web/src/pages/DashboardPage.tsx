import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { Calendar, MessageSquare, Users, Star, Clock, Video, ArrowRight, Bell, GraduationCap, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { MentorOnboardingForm } from '../components/organisms/MentorOnboardingForm'
import { DashboardSidebar } from '../components/organisms/DashboardSidebar'
import { useGuideDashboard, useSeekerDashboard } from '../hooks/useDashboard'
import { onboardingApi } from '../services/onboardingService'

type DashboardRole = 'SEEKER' | 'GUIDE'

export function DashboardPage() {
  const { user, dashboardRole, setDashboardRole } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAvailability, setShowAvailability] = useState(false)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [dayTimes, setDayTimes] = useState<Record<string, string[]>>({})

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const timeOptions = Array.from({ length: 24 }, (_, hour) => `${hour.toString().padStart(2, '0')}:00`)

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b)),
    )
  }

  const handleTimeChange = (day: string, value: string) => {
    if (!value) return
    setDayTimes((prev) => {
      const existing = prev[day] ?? []
      if (existing.includes(value)) return prev
      return {
        ...prev,
        [day]: [...existing, value].sort(),
      }
    })
  }

  const removeTime = (day: string, value: string) => {
    setDayTimes((prev) => {
      const existing = prev[day] ?? []
      const next = existing.filter((t) => t !== value)
      const copy = { ...prev }
      if (next.length === 0) {
        delete copy[day]
        return copy
      }
      copy[day] = next
      return copy
    })
  }

  const formatSlot = (time: string) => {
    if (!time) return ''
    const [hourStr, minuteStr] = time.split(':')
    const startHour = parseInt(hourStr, 10)
    const endHour = (startHour + 1) % 24

    const formatHour = (h: number) => {
      const period = h >= 12 ? 'PM' : 'AM'
      let display = h % 12
      if (display === 0) display = 12
      return `${display}:${minuteStr} ${period}`
    }

    return `${formatHour(startHour)} – ${formatHour(endHour)}`
  }

  const activeRole: DashboardRole =
    (dashboardRole as DashboardRole | null) || ((user?.role as DashboardRole | undefined) ?? 'SEEKER')

  // Auto-toggle to mentor mode if coming from "Become a Mentor"
  useEffect(() => {
    const becomeMentor = searchParams.get('becomeMentor') === 'true' || sessionStorage.getItem('becomeMentor') === 'true'
    if (becomeMentor && dashboardRole !== 'GUIDE') {
      setDashboardRole('GUIDE')
      sessionStorage.removeItem('becomeMentor')
      searchParams.delete('becomeMentor')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, dashboardRole, setDashboardRole, setSearchParams])

  // Check onboarding status from backend when in GUIDE mode
  useEffect(() => {
    if (activeRole !== 'GUIDE') return
    onboardingApi.getStatus()
      .then(({ isComplete }) => setIsOnboardingComplete(isComplete))
      .catch(() => {
        // Fall back to localStorage if API fails (e.g. not yet deployed)
        setIsOnboardingComplete(localStorage.getItem('mentorOnboardingComplete') === 'true')
      })
  }, [activeRole])

  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true)
  }

  // Show onboarding form if user is in mentor mode and hasn't completed onboarding
  if (activeRole === 'GUIDE' && !isOnboardingComplete) {
    return <MentorOnboardingForm onComplete={handleOnboardingComplete} />
  }

  const { data: seekerDashboard, isLoading: isSeekerLoading } = useSeekerDashboard(
    Boolean(user) && activeRole === 'SEEKER',
  )

  const { data: guideDashboard, isLoading: isGuideLoading } = useGuideDashboard(
    Boolean(user) && activeRole === 'GUIDE',
  )

  const seekerStats = seekerDashboard?.stats ?? {
    upcomingSessions: 0,
    unreadMessages: 0,
    guidesConnected: 0,
    sessionsCompleted: 0,
  }

  const guideStats = guideDashboard?.stats ?? {
    upcomingSessions: 0,
    pendingRequests: 0,
    monthlyEarnings: 0,
    avgRating: null as number | null,
  }

  const recentMessages =
    activeRole === 'SEEKER'
      ? seekerDashboard?.recentMessages ?? []
      : guideDashboard?.recentMessages ?? []

  const seekerUpcomingSessions =
    seekerDashboard?.upcomingSessions?.map((s) => {
      const dt = new Date(s.scheduledAt)
      const dateLabel = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      const timeLabel = dt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
      const status = s.status === 'CONFIRMED' ? 'confirmed' : 'pending'
      return {
        id: s.id,
        name: s.name,
        initials: s.initials,
        role: s.headline,
        topic: s.topic,
        date: dateLabel,
        time: timeLabel,
        duration: `${s.durationMinutes} min`,
        status,
        action: s.status === 'CONFIRMED' ? 'Join' : 'View Details',
      }
    }) ?? []

  const guideUpcomingSessions =
    guideDashboard?.upcomingSessions?.map((s) => {
      const dt = new Date(s.scheduledAt)
      const dateLabel = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      const timeLabel = dt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
      const status = s.status === 'CONFIRMED' ? 'confirmed' : 'pending'
      return {
        id: s.id,
        name: s.name,
        initials: s.initials,
        role: s.role,
        topic: s.topic,
        date: dateLabel,
        time: timeLabel,
        duration: `${s.durationMinutes} min`,
        status,
        action: s.status === 'CONFIRMED' ? 'Join' : 'View Details',
      }
    }) ?? []

  const guideSessionRequests =
    guideDashboard?.pendingRequests?.map((s) => {
      const dt = new Date(s.scheduledAt)
      const dateLabel = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      const timeLabel = dt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
      return {
        id: s.id,
        name: s.name,
        initials: s.initials,
        role: 'Seeker',
        school: '—',
        topic: s.topic,
        message: 'New session request',
        date: dateLabel,
        time: timeLabel,
        duration: `${s.durationMinutes} min`,
        timeAgo: '—',
      }
    }) ?? []

  const getStatusBadge = (status: string) => {
    const styles = {
      starting_soon: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-gray-100 text-gray-800 border-gray-200',
    }
    const labels = {
      starting_soon: 'Starting Soon',
      confirmed: 'Confirmed',
      pending: 'Pending',
    }
    return (
      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <div className="flex w-full">
      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar panel */}
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform">
            <DashboardSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8">
          {/* Welcome Section */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-background transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
            Welcome back, {user?.firstName}
      </h1>
          <p className="mt-2 text-sm text-text-muted">
            {activeRole === 'SEEKER'
              ? 'Your home base for upcoming sessions, recommended guides, and recent messages.'
              : 'Manage your sessions, track your earnings, and connect with seekers.'}
          </p>
        </div>
        </div>
        {activeRole === 'GUIDE' && (
          <button
            type="button"
            onClick={() => setShowAvailability(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            <Calendar className="h-4 w-4" />
            Manage Availability
          </button>
        )}
      </div>

      {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {activeRole === 'SEEKER' ? (
          <>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Upcoming Sessions</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">
                    {isSeekerLoading ? '—' : seekerStats.upcomingSessions}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Messages</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">
                    {isSeekerLoading ? '—' : seekerStats.unreadMessages}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Guides Connected</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">
                    {isSeekerLoading ? '—' : seekerStats.guidesConnected}
                  </p>
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
                  <p className="mt-2 text-2xl font-bold text-text-primary">
                    {isSeekerLoading ? '—' : seekerStats.sessionsCompleted}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Star className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Upcoming Sessions</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">
                    {isGuideLoading ? '—' : guideStats.upcomingSessions}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Pending Requests</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">
                    {isGuideLoading ? '—' : guideStats.pendingRequests}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">This Month&apos;s Earnings</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">
                    {isGuideLoading ? '—' : `$${guideStats.monthlyEarnings}`}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <span className="text-xl font-bold text-green-600">$</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Avg. Rating</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">
                    {isGuideLoading ? '—' : guideStats.avgRating ?? '—'}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Star className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Upcoming Sessions or Session Requests */}
        <div className="lg:col-span-2 space-y-6">
          {activeRole === 'SEEKER' ? (
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">Your Upcoming Sessions</h2>
                <Link to="/sessions" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-4">
                {isSeekerLoading && (
                  <div className="rounded-lg border border-border bg-background p-4 text-sm text-text-muted">
                    Loading upcoming sessions...
                  </div>
                )}
                {seekerUpcomingSessions.map((session) => (
                  <div key={session.id} className="rounded-lg border border-border bg-background p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {session.initials}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-text-primary">{session.name}</h3>
                            {getStatusBadge(session.status)}
                          </div>
                          <p className="mt-1 text-sm text-text-muted">{session.role}</p>
                          <p className="mt-1 text-sm font-medium text-text-primary">{session.topic}</p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {session.date}
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
                      <button
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          session.action === 'Join'
                            ? 'bg-primary text-white hover:bg-primary/90'
                            : 'border border-border bg-surface text-text-primary hover:bg-background'
                        }`}
                      >
                        {session.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-surface p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text-primary">Scheduled with Seekers</h2>
                  <Link to="/sessions" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    View All <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {isGuideLoading && (
                    <div className="rounded-lg border border-border bg-background p-4 text-sm text-text-muted">
                      Loading upcoming sessions...
                    </div>
                  )}
                  {guideUpcomingSessions.map((session) => (
                    <div key={session.id} className="rounded-lg border border-border bg-background p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {session.initials}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-text-primary">{session.name}</h3>
                              {getStatusBadge(session.status)}
                            </div>
                            <p className="mt-1 text-sm text-text-muted">{session.role}</p>
                            <p className="mt-1 text-sm font-medium text-text-primary">{session.topic}</p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {session.date}
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
                        <button
                          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            session.action === 'Join' || session.action === 'Accept'
                              ? 'bg-primary text-white hover:bg-primary/90'
                              : 'border border-border bg-surface text-text-primary hover:bg-background'
                          }`}
                        >
                          {session.action}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text-primary">Session Requests</h2>
                  <Link to="/sessions" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    View All <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {isGuideLoading && (
                    <div className="rounded-lg border border-border bg-background p-4 text-sm text-text-muted">
                      Loading requests...
                    </div>
                  )}
                  {guideSessionRequests.map((request) => (
                    <div key={request.id} className="rounded-lg border border-border bg-background p-4">
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
                              <GraduationCap className="h-3 w-3" />
                              {request.school}
                            </div>
                            <p className="mt-1 text-sm font-medium text-text-primary">{request.topic}</p>
                            <p className="mt-1 text-sm text-text-muted line-clamp-2">{request.message}</p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {request.date} {request.time} {request.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          <span className="text-xs text-text-muted">{request.timeAgo}</span>
                          <div className="flex gap-2">
                            <button className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100">
                              ✕ Decline
                            </button>
                            <button className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary/90">
                              ✓ Accept
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column - Recent Messages (Constant) */}
        <div className="h-fit self-start rounded-xl border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Recent Messages</h2>
            <Link to="/messages" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {activeRole === 'SEEKER' && isSeekerLoading ? (
              <div className="rounded-lg border border-border bg-background p-4 text-sm text-text-muted">
                Loading messages...
              </div>
            ) : null}
            {(activeRole === 'SEEKER'
              ? (recentMessages as unknown as { id: string; name: string; initials: string; message: string; createdAt: string; isUnread: boolean }[])
              : (recentMessages as any)
            ).map((message: any) => (
              <Link
                key={message.id}
                to="/messages"
                className="block rounded-lg border border-border bg-background p-4 transition-colors hover:bg-background/80"
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {message.initials}
                    </div>
                    {(message.unread ?? message.isUnread) && (
                      <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-yellow-400 border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-text-primary">{message.name}</h3>
                      <span className="text-xs text-text-muted">
                        {message.time ?? new Date(message.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-text-muted line-clamp-2">{message.message}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Guide availability modal */}
      {activeRole === 'GUIDE' && showAvailability && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-surface p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Manage Weekly Availability</h2>
                <p className="text-xs text-text-muted">
                  Choose the days you&apos;re available and pick a start time for a 1-hour slot.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAvailability(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-background hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Day selector */}
            <div className="mb-5 flex flex-wrap gap-2">
              {daysOfWeek.map((day) => {
                const isActive = selectedDays.includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      isActive
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-background text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                )
              })}
            </div>

            {/* Time pickers for selected days */}
            <div className="space-y-3">
              {selectedDays.length === 0 && (
                <p className="text-xs text-text-muted">
                  Select at least one day above to set your availability.
                </p>
              )}

              {selectedDays.map((day) => {
                const times = dayTimes[day] ?? []
                return (
                  <div
                    key={day}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-text-primary">{day}</div>
                      <select
                        value=""
                        onChange={(e) => {
                          handleTimeChange(day, e.target.value)
                          // reset select back to placeholder
                          e.currentTarget.value = ''
                        }}
                        className="rounded-md border border-border bg-surface px-2 py-1 text-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                      >
                        <option value="">Select time</option>
                        {timeOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {times.length === 0 && (
                        <span className="text-xs text-text-muted">No slot selected</span>
                      )}
                      {times.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => removeTime(day, t)}
                          className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary"
                        >
                          <span>{formatSlot(t)}</span>
                          <X className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Modal actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAvailability(false)}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-5 py-2 text-xs font-semibold text-text-primary transition-colors hover:bg-background"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log('Availability saved', { selectedDays, dayTimes })
                  setShowAvailability(false)
                }}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90"
              >
                Save availability
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  )
}
