import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { Calendar, MessageSquare, Users, Star, Clock, Video, ArrowRight, Bell, GraduationCap, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { MentorOnboardingForm } from '../components/organisms/MentorOnboardingForm'

type DashboardRole = 'SEEKER' | 'GUIDE'

export function DashboardPage() {
  const { user, dashboardRole, setDashboardRole } = useAuthStore()
  const [searchParams] = useSearchParams()
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false)

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

  // Check if mentor onboarding is complete
  useEffect(() => {
    const completed = localStorage.getItem('mentorOnboardingComplete') === 'true'
    setIsOnboardingComplete(completed)
    
    // Auto-toggle to mentor mode if coming from "Become a Mentor"
    const becomeMentor = searchParams.get('becomeMentor') === 'true' || sessionStorage.getItem('becomeMentor') === 'true'
    if (becomeMentor && dashboardRole !== 'GUIDE') {
      setDashboardRole('GUIDE')
      // Clear the flag
      sessionStorage.removeItem('becomeMentor')
      searchParams.delete('becomeMentor')
    }
  }, [searchParams, dashboardRole, setDashboardRole])

  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true)
    localStorage.setItem('mentorOnboardingComplete', 'true')
  }

  // Show onboarding form if user is in mentor mode and hasn't completed onboarding
  if (activeRole === 'GUIDE' && !isOnboardingComplete) {
    return <MentorOnboardingForm onComplete={handleOnboardingComplete} />
  }

  // Mock data - replace with real data from API
  const seekerStats = {
    upcomingSessions: 3,
    messages: 7,
    guidesConnected: 12,
    sessionsCompleted: 8,
  }

  const guideStats = {
    upcomingSessions: 5,
    pendingRequests: 3,
    monthlyEarnings: 420,
    avgRating: 4.9,
  }

  const recentMessages = [
    {
      id: 1,
      name: 'Sarah Chen',
      initials: 'SC',
      time: '2 min ago',
      message: "Looking forward to our session today! I've prepared some resources on PM...",
      unread: true,
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      initials: 'MJ',
      time: '1 hour ago',
      message: "Great question about system design! Here's a link to a resource I mentioned...",
      unread: true,
    },
    {
      id: 3,
      name: 'Alex Kim',
      initials: 'AK',
      time: '3 hours ago',
      message: "Thanks for booking! I saw your profile and think I can definitely help with you...",
      unread: false,
    },
    {
      id: 4,
      name: 'Emily Rodriguez',
      initials: 'ER',
      time: 'Yesterday',
      message: 'Just sent over the interview prep guide we discussed. Let me know if you hav...',
      unread: false,
    },
  ]

  const seekerUpcomingSessions = [
    {
      id: 1,
      name: 'Sarah Chen',
      initials: 'SC',
      role: 'Product Manager @ Google',
      topic: 'Breaking into PM roles at FAANG',
      date: 'Today',
      time: '3:00 PM',
      duration: '45 min',
      status: 'starting_soon',
      action: 'Join',
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      initials: 'MJ',
      role: 'Software Engineer @ Meta',
      topic: 'Technical interview preparation',
      date: 'Tomorrow',
      time: '10:00 AM',
      duration: '60 min',
      status: 'confirmed',
      action: 'View Details',
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      initials: 'ER',
      role: 'Investment Banking Analyst @ Goldman S...',
      topic: 'Finance internship application strategy',
      date: 'Mar 12',
      time: '2:30 PM',
      duration: '30 min',
      status: 'pending',
      action: 'View Details',
    },
  ]

  const guideUpcomingSessions = [
    {
      id: 1,
      name: 'Michael Torres',
      initials: 'MT',
      role: 'Undergraduate Student',
      topic: 'Transitioning from engineering to product',
      date: 'Today',
      time: '4:30 PM',
      duration: '45 min',
      status: 'starting_soon',
      action: 'Join',
    },
    {
      id: 2,
      name: 'Rachel Kim',
      initials: 'RK',
      role: 'Graduate Student',
      topic: 'MBA application essay review',
      date: 'Tomorrow',
      time: '11:00 AM',
      duration: '30 min',
      status: 'confirmed',
      action: 'View Details',
    },
    {
      id: 3,
      name: 'James Wilson',
      initials: 'JW',
      role: 'Career Changer',
      topic: 'Breaking into tech from non-traditional backgro...',
      date: 'Mar 13',
      time: '1:00 PM',
      duration: '60 min',
      status: 'pending',
      action: 'Accept',
    },
  ]

  const guideSessionRequests = [
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
    <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8">
      {/* Welcome Section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Welcome back, {user?.firstName}
      </h1>
          <p className="mt-2 text-sm text-text-muted">
            {activeRole === 'SEEKER'
              ? 'Your home base for upcoming sessions, recommended guides, and recent messages.'
              : 'Manage your sessions, track your earnings, and connect with seekers.'}
          </p>
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
                  <p className="mt-2 text-2xl font-bold text-text-primary">{seekerStats.upcomingSessions}</p>
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
                  <p className="mt-2 text-2xl font-bold text-text-primary">{seekerStats.messages}</p>
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
                  <p className="mt-2 text-2xl font-bold text-text-primary">{seekerStats.guidesConnected}</p>
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
                  <p className="mt-2 text-2xl font-bold text-text-primary">{seekerStats.sessionsCompleted}</p>
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
                  <p className="mt-2 text-2xl font-bold text-text-primary">{guideStats.upcomingSessions}</p>
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
                  <p className="mt-2 text-2xl font-bold text-text-primary">{guideStats.pendingRequests}</p>
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
                  <p className="mt-2 text-2xl font-bold text-text-primary">${guideStats.monthlyEarnings}</p>
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
                  <p className="mt-2 text-2xl font-bold text-text-primary">{guideStats.avgRating}</p>
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
          {dashboardRole === 'SEEKER' ? (
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">Your Upcoming Sessions</h2>
                <Link to="/sessions" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-4">
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
            {recentMessages.map((message) => (
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
                    {message.unread && (
                      <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-yellow-400 border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-text-primary">{message.name}</h3>
                      <span className="text-xs text-text-muted">{message.time}</span>
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
  )
}
