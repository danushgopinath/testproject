import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { Calendar, MessageSquare, Users, Star, Clock, Video, ArrowRight, Bell, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { MentorOnboardingForm } from '../components/organisms/MentorOnboardingForm'
import { DashboardSidebar } from '../components/organisms/DashboardSidebar'
import { useGuideDashboard, useMyProfile, useSeekerDashboard } from '../hooks/useDashboard'
import { useAcceptSession, useDeclineSession, useOpenSessionCall } from '../hooks/useSessions'
import { onboardingApi } from '../services/onboardingService'
import { useQueryClient } from '@tanstack/react-query'
import { googleCalendarUrl } from '../lib/calendar'
import { ALL_TIMEZONES, browserTimeZone, tzShortLabel } from '../lib/timezones'

type DashboardRole = 'SEEKER' | 'GUIDE'

export function DashboardPage() {
  const { user, dashboardRole, setDashboardRole } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const openCall = useOpenSessionCall()
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAvailability, setShowAvailability] = useState(false)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [dayTimes, setDayTimes] = useState<Record<string, string[]>>({})
  const [availabilityTz, setAvailabilityTz] = useState<string>(browserTimeZone())
  const [savingAvailability, setSavingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)

  const { data: myProfile } = useMyProfile()
  const queryClient = useQueryClient()

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

  // Pre-populate availability modal from saved profile when opened
  useEffect(() => {
    if (!showAvailability) return
    const saved = myProfile?.guide?.availability ?? null
    if (saved && typeof saved === 'object') {
      const days = Object.keys(saved).sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b))
      setSelectedDays(days)
      setDayTimes(saved as Record<string, string[]>)
    } else {
      setSelectedDays([])
      setDayTimes({})
    }
    setAvailabilityTz(myProfile?.guide?.timezone || browserTimeZone())
    setAvailabilityError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAvailability])

  const handleSaveAvailability = async () => {
    setSavingAvailability(true)
    setAvailabilityError(null)
    try {
      // Build payload: only days with at least one selected slot
      const payload: Record<string, string[]> = {}
      for (const day of selectedDays) {
        const slots = dayTimes[day] ?? []
        if (slots.length > 0) payload[day] = slots
      }
      await onboardingApi.updateAvailability(payload, availabilityTz)
      // Refresh caches so booking page and dashboard see new availability
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['me', 'profile'] }),
        queryClient.invalidateQueries({ queryKey: ['guides'] }),
      ])
      setShowAvailability(false)
    } catch {
      setAvailabilityError('Failed to save availability. Please try again.')
    } finally {
      setSavingAvailability(false)
    }
  }

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

  // Always call hooks unconditionally — must be before any early return
  const { data: seekerDashboard, isLoading: isSeekerLoading } = useSeekerDashboard(
    Boolean(user) && activeRole === 'SEEKER',
  )

  const { data: guideDashboard, isLoading: isGuideLoading } = useGuideDashboard(
    Boolean(user) && activeRole === 'GUIDE' && isOnboardingComplete === true,
  )

  const acceptSession = useAcceptSession()
  const declineSession = useDeclineSession()

  // While checking onboarding status, show a spinner
  if (activeRole === 'GUIDE' && isOnboardingComplete === null) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Show onboarding form if guide hasn't completed onboarding
  if (activeRole === 'GUIDE' && isOnboardingComplete === false) {
    return <MentorOnboardingForm onComplete={handleOnboardingComplete} />
  }

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
        otherUserId: s.otherUserId,
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
        otherUserId: s.otherUserId,
        name: s.name,
        initials: s.initials,
        role: s.role,
        topic: s.topic,
        date: dateLabel,
        time: timeLabel,
        duration: `${s.durationMinutes} min`,
        scheduledAt: s.scheduledAt,
        durationMinutes: s.durationMinutes,
        status,
        action: s.status === 'CONFIRMED' ? 'Join' : 'View Details',
      }
    }) ?? []

  const guideSessionRequests =
    guideDashboard?.pendingRequests?.map((s) => {
      const dt = new Date(s.scheduledAt)
      return {
        id: s.id,
        name: s.name,
        initials: s.initials,
        role: 'Seeker',
        topic: s.topic,
        date: dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        time: dt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
        duration: `${s.durationMinutes} min`,
      }
    }) ?? []

  const guidePastSessions =
    guideDashboard?.pastSessions?.map((s) => {
      const dt = new Date(s.scheduledAt)
      return {
        id: s.id,
        name: s.name,
        initials: s.initials,
        role: s.role,
        topic: s.topic,
        date: dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        time: dt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
        duration: `${s.durationMinutes} min`,
        status: s.status,
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
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
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
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {session.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
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
                      <div className="flex flex-col gap-2 shrink-0">
                        <Link
                          to={`/messages?with=${session.otherUserId}`}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-text-primary hover:bg-background transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5" /> Message
                        </Link>
                        <button
                          onClick={() => { if (session.action === 'Join') openCall(session.id) }}
                          className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                            session.action === 'Join'
                              ? 'bg-primary text-white hover:bg-primary/90'
                              : 'border border-border bg-surface text-text-primary hover:bg-background'
                          }`}
                        >
                          {session.action}
                        </button>
                      </div>
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
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {session.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-text-primary">{session.name}</h3>
                              {getStatusBadge(session.status)}
                            </div>
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
                              <a
                                href={googleCalendarUrl({
                                  title: `Expertify session with ${session.name}`,
                                  startISO: session.scheduledAt,
                                  durationMinutes: session.durationMinutes,
                                  details: session.topic,
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 font-medium text-primary hover:underline"
                              >
                                <Calendar className="h-3 w-3" />Add to calendar
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <Link
                            to={`/messages?with=${session.otherUserId}`}
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-text-primary hover:bg-background transition-colors"
                          >
                            <MessageSquare className="h-3.5 w-3.5" /> Message
                          </Link>
                          <button
                            onClick={() => { if (session.action === 'Join') openCall(session.id) }}
                            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                              session.action === 'Join' || session.action === 'Accept'
                                ? 'bg-primary text-white hover:bg-primary/90'
                                : 'border border-border bg-surface text-text-primary hover:bg-background'
                            }`}
                          >
                            {session.action}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text-primary">Session Requests</h2>
                  <Link to="/dashboard/requests" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    View All <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {isGuideLoading && (
                    <div className="rounded-lg border border-border bg-background p-4 text-sm text-text-muted">
                      Loading requests...
                    </div>
                  )}
                  {!isGuideLoading && guideSessionRequests.length === 0 && (
                    <div className="rounded-lg border border-border bg-background p-4 text-sm text-text-muted">
                      No pending session requests.
                    </div>
                  )}
                  {guideSessionRequests.map((request) => (
                    <div key={request.id} className="rounded-lg border border-border bg-background p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {request.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-text-primary">{request.name}</h3>
                              <span className="rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                {request.role}
                              </span>
                            </div>
                            <p className="mt-1 text-sm font-medium text-text-primary">{request.topic}</p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{request.date}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{request.time}</span>
                              <span className="flex items-center gap-1"><Video className="h-3 w-3" />{request.duration}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            disabled={acceptSession.isPending || declineSession.isPending}
                            onClick={() => acceptSession.mutate(request.id)}
                            className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                          >
                            Admit
                          </button>
                          <button
                            disabled={declineSession.isPending || acceptSession.isPending}
                            onClick={() => declineSession.mutate(request.id)}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text-primary">Past Sessions</h2>
                  <Link to="/sessions" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    View All <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {isGuideLoading && (
                    <div className="rounded-lg border border-border bg-background p-4 text-sm text-text-muted">
                      Loading past sessions...
                    </div>
                  )}
                  {!isGuideLoading && guidePastSessions.length === 0 && (
                    <div className="rounded-lg border border-border bg-background p-4 text-sm text-text-muted">
                      No past sessions yet.
                    </div>
                  )}
                  {guidePastSessions.map((s) => (
                    <div key={s.id} className="rounded-lg border border-border bg-background p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {s.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-text-primary">{s.name}</h3>
                              <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                                s.status === 'COMPLETED'
                                  ? 'border-green-200 bg-green-100 text-green-800'
                                  : 'border-gray-200 bg-gray-100 text-gray-700'
                              }`}>
                                {s.status === 'COMPLETED' ? 'Completed' : 'Cancelled'}
                              </span>
                            </div>
                            <p className="mt-1 text-sm font-medium text-text-primary">{s.topic}</p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{s.date}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.time}</span>
                              <span className="flex items-center gap-1"><Video className="h-3 w-3" />{s.duration}</span>
                            </div>
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

            {/* Time zone */}
            <div className="mb-5">
              <label className="mb-1.5 block text-xs font-medium text-text-primary">Time zone</label>
              <select
                value={availabilityTz}
                onChange={(e) => setAvailabilityTz(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                {ALL_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz} ({tzShortLabel(tz)})</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-text-muted">Your slots below are defined in this time zone.</p>
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

            {availabilityError && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {availabilityError}
              </p>
            )}

            {/* Modal actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAvailability(false)}
                disabled={savingAvailability}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-5 py-2 text-xs font-semibold text-text-primary transition-colors hover:bg-background disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAvailability}
                disabled={savingAvailability}
                style={{ color: 'white' }}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2 text-xs font-semibold transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {savingAvailability ? 'Saving…' : 'Save availability'}
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
