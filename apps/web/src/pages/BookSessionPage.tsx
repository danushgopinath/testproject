import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Calendar, Clock, Globe, Star,
  ChevronLeft, ChevronRight, Check, CreditCard,
  Shield, Lock, MapPin,
} from 'lucide-react'
import { useGuide } from '../hooks/useGuides'
import { useAuthStore } from '../stores/authStore'
import { apiClient } from '../services/apiClient'

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */
const DURATIONS = [
  { label: '30 minutes', minutes: 30, multiplier: 0.5 },
  { label: '1 hour', minutes: 60, multiplier: 1 },
  { label: '2 hours', minutes: 120, multiplier: 2 },
]
const SESSION_TYPES = [
  'General Mentoring', 'Career Guidance', 'Application Review',
  'Mock Interview', 'Portfolio Review',
]
const TOPICS = [
  'Graduate School Applications', 'Research Opportunities',
  'Career Transitions', 'Industry Insights',
  'Networking Strategies', 'Work-Life Balance',
  'Technical Skills', 'Leadership Development',
  'Entrepreneurship', 'Academic Writing',
]
const PLATFORM_FEE_RATE = 0.05
const STEP_LABELS = ['Select Time', 'Session Details', 'Payment', 'Confirmation']

/* ------------------------------------------------------------------ */
/*  Calendar helpers                                                   */
/* ------------------------------------------------------------------ */
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

/* ------------------------------------------------------------------ */
/*  Day-of-week name → index mapping                                  */
/* ------------------------------------------------------------------ */
const DOW: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export function BookSessionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: guide, isLoading, isError } = useGuide(id)

  // Stepper
  const [step, setStep] = useState(0)

  // Step 1
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [durationIdx, setDurationIdx] = useState(1)

  // Step 2
  const [sessionType, setSessionType] = useState(SESSION_TYPES[0])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [freeText, setFreeText] = useState('')

  // Step 3 — UI only (payment integration is out of scope; we confirm immediately)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card')
  const [submitting, setSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)

  // Step 4 result
  const [confirmedAt, setConfirmedAt] = useState<Date | null>(null)

  // Derived pricing
  const duration = DURATIONS[durationIdx]
  const hourlyRate = guide ? (guide.sessionRate ?? 0) / 100 : 0
  const sessionCost = +(hourlyRate * duration.multiplier).toFixed(2)
  const platformFee = +(sessionCost * PLATFORM_FEE_RATE).toFixed(2)
  const totalCost = +(sessionCost + platformFee).toFixed(2)

  // Selected date string
  const selectedDate = selectedDay
    ? `${MONTH_NAMES[calMonth]} ${selectedDay}, ${calYear}`
    : null

  // Build scheduledAt ISO string from selected date + time slot
  const scheduledAtISO = useMemo(() => {
    if (!selectedDay || !selectedSlot) return null
    const [h, m] = selectedSlot.split(':').map(Number)
    const d = new Date(calYear, calMonth, selectedDay, h, m)
    return d.toISOString()
  }, [calYear, calMonth, selectedDay, selectedSlot])

  // Calendar
  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfMonth(calYear, calMonth)
  const calendarCells = useMemo(() => {
    const cells: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }, [firstDay, daysInMonth])

  // Parse guide availability into available days and slots
  const availability = guide?.availability as Record<string, string[]> | null | undefined
  const availableDayIndices = useMemo(() => {
    if (!availability) return new Set<number>()
    const indices = new Set<number>()
    for (const day of Object.keys(availability)) {
      const idx = DOW[day.toLowerCase()]
      if (idx !== undefined) indices.add(idx)
    }
    return indices
  }, [availability])

  const slotsForSelectedDay = useMemo(() => {
    if (!availability || !selectedDay) return []
    const dow = new Date(calYear, calMonth, selectedDay).getDay()
    for (const [dayName, slots] of Object.entries(availability)) {
      if (DOW[dayName.toLowerCase()] === dow) return slots
    }
    return []
  }, [availability, selectedDay, calYear, calMonth])

  const isToday = (day: number) =>
    day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()
  // A day is "past" (unbookable) if every minute of it is within the 12-hour lead window.
  // Equivalent: end-of-day 23:59 must be at least 12 hours from now.
  const isPast = (day: number) => {
    const endOfDay = new Date(calYear, calMonth, day, 23, 59, 59)
    return endOfDay.getTime() < Date.now() + 12 * 60 * 60 * 1000
  }
  const isUnavailable = (day: number) => {
    if (availableDayIndices.size === 0) return false // no availability set — allow all weekdays
    const dow = new Date(calYear, calMonth, day).getDay()
    return !availableDayIndices.has(dow)
  }

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(calYear - 1); setCalMonth(11) }
    else setCalMonth(calMonth - 1)
    setSelectedDay(null); setSelectedSlot(null)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(calYear + 1); setCalMonth(0) }
    else setCalMonth(calMonth + 1)
    setSelectedDay(null); setSelectedSlot(null)
  }

  const toggleTopic = (t: string) =>
    setSelectedTopics((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])

  // Fallback time slots when guide has no availability set
  const rawSlots = slotsForSelectedDay.length > 0
    ? slotsForSelectedDay
    : ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']

  // Sessions must be booked at least 12 hours in advance
  const MIN_LEAD_MS = 12 * 60 * 60 * 1000
  const displaySlots = selectedDay
    ? rawSlots.filter((s) => {
        const [h, m] = s.split(':').map(Number)
        const slotDate = new Date(calYear, calMonth, selectedDay, h, m)
        return slotDate.getTime() >= Date.now() + MIN_LEAD_MS
      })
    : rawSlots

  // ── Confirm booking ──
  async function handleConfirm() {
    if (!guide || !scheduledAtISO) return
    setSubmitting(true)
    setBookingError(null)
    try {
      await apiClient.post('/sessions', {
        guideId: guide.id,
        scheduledAt: scheduledAtISO,
        durationMinutes: duration.minutes,
        sessionType,
        topics: selectedTopics,
        notes: freeText || undefined,
        totalCost,
      })
      setConfirmedAt(new Date(scheduledAtISO))
      setStep(3)
    } catch (err: any) {
      setBookingError(err?.response?.data?.message ?? 'Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Loading / error states                                          */
  /* ---------------------------------------------------------------- */
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-sm text-[#070738]/50">
        Loading…
      </div>
    )
  }
  if (isError || !guide) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <button onClick={() => navigate('/guides')} className="flex items-center gap-2 text-sm text-[#070738]/60 hover:text-[#070738]">
          <ArrowLeft className="h-4 w-4" /> Back to mentors
        </button>
        <p className="mt-8 text-base font-semibold text-[#070738]">Mentor not found</p>
      </div>
    )
  }

  // ── Block self-booking ───────────────────────────────────────────
  // A user cannot book a session with themselves. We still render the
  // page (so they can read the profile) but replace the booking flow
  // with a clear message and a link back to Find Mentors.
  const isOwnProfile = !!user?.id && !!(guide as any).userId && user.id === (guide as any).userId
  if (isOwnProfile) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
          <button
            onClick={() => navigate(`/guides/${guide.id}`)}
            className="mb-6 flex items-center gap-2 text-sm text-[#070738]/55 hover:text-[#070738] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Profile
          </button>
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <Lock className="h-7 w-7 text-amber-700" />
            </div>
            <h2 className="text-xl font-bold text-[#070738]">You can't book your own session</h2>
            <p className="mt-2 text-sm text-[#070738]/60">
              This is your own mentor profile. Use Find Mentors to book a session with a different mentor,
              or edit your profile from the settings.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => navigate('/guides')}
                style={{ color: 'white' }}
                className="rounded-xl bg-[#070738] px-5 py-2.5 text-sm font-semibold hover:bg-[#070738]/90 transition-colors"
              >
                Find Mentors
              </button>
              <button
                onClick={() => navigate('/settings/mentor')}
                className="rounded-xl border border-[#070738]/15 px-5 py-2.5 text-sm font-semibold text-[#070738] hover:bg-[#f5f7fc] transition-colors"
              >
                Edit My Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const initials = guide.name.split(' ').map((p: string) => p[0]).join('').slice(0, 2)
  const price = guide.sessionRate ? `$${(guide.sessionRate / 100).toFixed(0)}/hr` : 'Free'

  /* ---------------------------------------------------------------- */
  /*  Stepper                                                         */
  /* ---------------------------------------------------------------- */
  const Stepper = () => (
    <div className="mb-6 flex items-center">
      {STEP_LABELS.map((label, idx) => {
        const done = idx < step
        const active = idx === step
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                done ? 'bg-[#070738] text-white' : active ? 'bg-[#070738] text-white' : 'bg-[#070738]/10 text-[#070738]/40'
              }`}>
                {done ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              <span className={`hidden text-sm font-medium sm:inline ${active || done ? 'text-[#070738]' : 'text-[#070738]/35'}`}>
                {label}
              </span>
            </div>
            {idx < STEP_LABELS.length - 1 && (
              <div className={`mx-3 h-0.5 w-10 md:w-16 transition-colors ${done ? 'bg-[#070738]' : 'bg-[#070738]/10'}`} />
            )}
          </div>
        )
      })}
    </div>
  )

  /* ---------------------------------------------------------------- */
  /*  Mentor sidebar                                                  */
  /* ---------------------------------------------------------------- */
  const MentorSidebar = () => (
    <div className="rounded-2xl border border-[#070738]/8 bg-[#f5f7fc] p-5">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#070738]/50">Session with</h3>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-12 w-12 flex-shrink-0 overflow-hidden items-center justify-center rounded-full bg-[#070738] text-sm font-bold text-[#F5B400]">
          {guide.avatarUrl ? (
            <img src={guide.avatarUrl} alt={guide.name} className="h-12 w-12 object-cover" />
          ) : (
            initials
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-[#070738]">{guide.name}</p>
          <p className="text-xs text-[#070738]/55">{guide.currentRole || guide.headline}</p>
          {guide.university && (
            <p className="flex items-center gap-1 text-xs text-[#070738]/40 mt-0.5">
              <MapPin className="h-3 w-3" /> {guide.university}
            </p>
          )}
        </div>
      </div>

      {/* Rating */}
      {guide.averageRating && (
        <div className="mb-3 flex items-center gap-1 text-sm">
          <Star className="h-3.5 w-3.5 fill-[#F5B400] text-[#F5B400]" />
          <span className="font-semibold text-[#070738]">{guide.averageRating.toFixed(1)}</span>
          <span className="text-[#070738]/45">({guide.reviewCount} reviews)</span>
        </div>
      )}

      {/* Languages */}
      {guide.languages?.length > 0 && (
        <div className="mb-3 flex items-center gap-1.5 text-xs text-[#070738]/55">
          <Globe className="h-3.5 w-3.5" />
          {guide.languages.join(', ')}
        </div>
      )}

      {/* Expertise */}
      {guide.specializations?.length > 0 && (
        <div className="mb-4">
          <p className="mb-1.5 text-xs font-semibold text-[#070738]/55">Expertise</p>
          <div className="flex flex-wrap gap-1.5">
            {guide.specializations.slice(0, 5).map((s: string) => (
              <span key={s} className="rounded-lg border border-[#070738]/15 bg-white px-2 py-0.5 text-[11px] font-medium text-[#070738]/65">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Rate */}
      <div className="flex items-center justify-between border-t border-[#070738]/8 pt-3.5 text-sm">
        <span className="text-[#070738]/55">Hourly Rate</span>
        <span className="text-lg font-bold text-[#070738]">{price}</span>
      </div>
      {step >= 1 && selectedDay && selectedSlot && (
        <div className="mt-3 space-y-1.5 border-t border-[#070738]/8 pt-3.5 text-xs text-[#070738]/60">
          <div className="flex justify-between"><span>Date</span><span className="font-medium text-[#070738]">{selectedDate}</span></div>
          <div className="flex justify-between"><span>Time</span><span className="font-medium text-[#070738]">{selectedSlot}</span></div>
          <div className="flex justify-between"><span>Duration</span><span className="font-medium text-[#070738]">{duration.minutes} min</span></div>
          <div className="flex justify-between border-t border-[#070738]/8 pt-1.5 text-sm font-semibold text-[#070738]">
            <span>Total</span><span>${totalCost.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )

  /* ================================================================ */
  /*  STEP 1 — Select Date & Time                                     */
  /* ================================================================ */
  const Step1 = () => (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#070738]/8 bg-[#f5f7fc] p-6">
        <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-[#070738]">
          <Calendar className="h-5 w-5" /> Select Date &amp; Time
        </h3>

        {/* Calendar */}
        <p className="mb-2 text-sm font-semibold text-[#070738]">Choose a date</p>
        <div className="mb-4 inline-block rounded-xl border border-[#070738]/10 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <button onClick={prevMonth} className="rounded-lg p-1.5 hover:bg-[#f5f7fc] transition-colors">
              <ChevronLeft className="h-4 w-4 text-[#070738]" />
            </button>
            <span className="text-sm font-bold text-[#070738]">{MONTH_NAMES[calMonth]} {calYear}</span>
            <button onClick={nextMonth} className="rounded-lg p-1.5 hover:bg-[#f5f7fc] transition-colors">
              <ChevronRight className="h-4 w-4 text-[#070738]" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {DAY_NAMES.map((d) => (
              <div key={d} className="py-1 text-xs font-semibold text-[#070738]/40">{d}</div>
            ))}
            {calendarCells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />
              const disabled = isPast(day) || isUnavailable(day)
              const selected = day === selectedDay
              return (
                <button
                  key={day}
                  disabled={disabled}
                  onClick={() => { setSelectedDay(day); setSelectedSlot(null) }}
                  className={`rounded-lg py-1.5 text-sm transition-colors ${
                    selected ? 'bg-[#070738] text-white font-bold'
                    : isToday(day) ? 'bg-[#F5B400]/20 font-semibold text-[#070738]'
                    : disabled ? 'text-[#070738]/20 cursor-not-allowed'
                    : 'hover:bg-[#f5f7fc] text-[#070738]'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        {availability && Object.keys(availability).length > 0 && (
          <p className="mb-4 text-xs text-[#070738]/50">
            Available days: {Object.keys(availability).join(', ')}
          </p>
        )}

        {/* Time Slots */}
        {selectedDay && (
          <>
            <h4 className="mb-2 text-sm font-semibold text-[#070738]">Available time slots</h4>
            {displaySlots.length === 0 ? (
              <p className="text-sm text-[#070738]/50">
                No slots available for this day. Sessions must be booked at least 12 hours in advance.
              </p>
            ) : (
              <div className="mb-5 flex flex-wrap gap-2">
                {displaySlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                      selectedSlot === slot
                        ? 'border-[#070738] bg-[#070738] text-white'
                        : 'border-[#070738]/15 bg-white text-[#070738] hover:border-[#070738]/40'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Duration */}
        <h4 className="mb-2 text-sm font-semibold text-[#070738]">Session duration</h4>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((d, idx) => (
            <button
              key={d.label}
              onClick={() => setDurationIdx(idx)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                durationIdx === idx
                  ? 'border-[#070738] bg-[#070738] text-white'
                  : 'border-[#070738]/15 bg-white text-[#070738] hover:border-[#070738]/40'
              }`}
            >
              {d.label}
              {hourlyRate > 0 && ` · $${(hourlyRate * d.multiplier).toFixed(0)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {selectedDay && selectedSlot && (
        <div className="rounded-2xl border border-[#070738]/8 bg-[#f5f7fc] p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#070738]">
            <Clock className="h-4 w-4" /> Session Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between pb-2 border-b border-[#070738]/8"><span className="text-[#070738]/55">Date</span><span className="font-semibold text-[#070738]">{selectedDate}</span></div>
            <div className="flex justify-between pb-2 border-b border-[#070738]/8"><span className="text-[#070738]/55">Time</span><span className="font-semibold text-[#070738]">{selectedSlot}</span></div>
            <div className="flex justify-between pb-2 border-b border-[#070738]/8"><span className="text-[#070738]/55">Duration</span><span className="font-semibold text-[#070738]">{duration.minutes} minutes</span></div>
            <div className="flex justify-between"><span className="font-bold text-[#070738]">Session Cost</span><span className="font-bold text-[#070738]">{hourlyRate > 0 ? `$${sessionCost.toFixed(2)}` : 'Free'}</span></div>
          </div>
        </div>
      )}
    </div>
  )

  /* ================================================================ */
  /*  STEP 2 — Session Details                                        */
  /* ================================================================ */
  const Step2 = () => (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#070738]/8 bg-[#f5f7fc] p-6">
        <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-[#070738]">
          <Calendar className="h-5 w-5" /> Session Details
        </h3>

        <div className="mb-5">
          <p className="mb-2 text-sm font-semibold text-[#070738]">What type of session would you like?</p>
          <div className="flex flex-wrap gap-2">
            {SESSION_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setSessionType(t)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                  sessionType === t
                    ? 'border-[#070738] bg-[#070738] text-white'
                    : 'border-[#070738]/15 bg-white text-[#070738] hover:border-[#070738]/40'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <p className="mb-2.5 text-sm font-semibold text-[#070738]">Topics to discuss</p>
          <div className="grid grid-cols-2 gap-2">
            {TOPICS.map((topic) => {
              const checked = selectedTopics.includes(topic)
              return (
                <label key={topic} className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#070738]/8 bg-white px-3 py-2 text-sm hover:border-[#070738]/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTopic(topic)}
                    className="h-4 w-4 rounded accent-[#070738]"
                  />
                  <span className={checked ? 'font-medium text-[#070738]' : 'text-[#070738]/55'}>{topic}</span>
                </label>
              )
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-[#070738]">Additional notes for your mentor</p>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows={3}
            placeholder="Share specific questions, goals, or background that will help your mentor prepare…"
            className="w-full rounded-xl border border-[#070738]/15 bg-white px-3 py-2.5 text-sm text-[#070738] outline-none placeholder:text-[#070738]/30 focus:border-[#070738]/40"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-[#070738]/8 bg-[#f5f7fc] p-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#070738]">Session Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between pb-2 border-b border-[#070738]/8"><span className="text-[#070738]/55">Date &amp; Time</span><span className="font-semibold text-[#070738]">{selectedDate} at {selectedSlot}</span></div>
          <div className="flex justify-between pb-2 border-b border-[#070738]/8"><span className="text-[#070738]/55">Duration</span><span className="font-semibold text-[#070738]">{duration.minutes} minutes</span></div>
          <div className="flex justify-between"><span className="text-[#070738]/55">Session Type</span><span className="font-semibold text-[#070738]">{sessionType}</span></div>
        </div>
      </div>
    </div>
  )

  /* ================================================================ */
  /*  STEP 3 — Payment                                                */
  /* ================================================================ */
  const Step3 = () => (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#070738]/8 bg-[#f5f7fc] p-6">
        <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-[#070738]">
          <CreditCard className="h-5 w-5" /> Payment Method
        </h3>

        {/* Card option */}
        <label className="mb-4 flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="radio" name="pay" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="h-4 w-4 accent-[#070738]" />
          <CreditCard className="h-4 w-4 text-[#070738]/50" />
          <span className="font-semibold text-[#070738]">Credit or Debit Card</span>
        </label>
        {paymentMethod === 'card' && (
          <div className="mb-5 ml-6 space-y-3.5">
            <div>
              <p className="mb-1 text-xs font-semibold text-[#070738]/70">Card Number</p>
              <input placeholder="1234 5678 9012 3456" className="w-full rounded-xl border border-[#070738]/15 bg-white px-3 py-2 text-sm text-[#070738] outline-none placeholder:text-[#070738]/30 focus:border-[#070738]/40" />
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <p className="mb-1 text-xs font-semibold text-[#070738]/70">Expiry Date</p>
                <input placeholder="MM/YY" className="w-full rounded-xl border border-[#070738]/15 bg-white px-3 py-2 text-sm text-[#070738] outline-none placeholder:text-[#070738]/30 focus:border-[#070738]/40" />
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-[#070738]/70">CVC</p>
                <input placeholder="123" className="w-full rounded-xl border border-[#070738]/15 bg-white px-3 py-2 text-sm text-[#070738] outline-none placeholder:text-[#070738]/30 focus:border-[#070738]/40" />
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-[#070738]/70">Cardholder Name</p>
              <input placeholder="John Doe" className="w-full rounded-xl border border-[#070738]/15 bg-white px-3 py-2 text-sm text-[#070738] outline-none placeholder:text-[#070738]/30 focus:border-[#070738]/40" />
            </div>
          </div>
        )}

        {/* PayPal option */}
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="radio" name="pay" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="h-4 w-4 accent-[#070738]" />
          <span className="font-semibold text-[#070738]">PayPal</span>
        </label>
      </div>

      {/* Order Summary */}
      <div className="rounded-2xl border border-[#070738]/8 bg-[#f5f7fc] p-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#070738]">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-[#070738]">Session with {guide.name}</span><span className="font-semibold text-[#070738]">{hourlyRate > 0 ? `$${sessionCost.toFixed(2)}` : 'Free'}</span></div>
          <p className="text-xs text-[#070738]/45">{duration.minutes} min · {selectedDate} at {selectedSlot} · {sessionType}</p>
          {hourlyRate > 0 && (
            <>
              <div className="flex justify-between border-t border-[#070738]/8 pt-2"><span className="text-[#070738]/55">Platform Fee (5%)</span><span className="font-medium text-[#070738]">${platformFee.toFixed(2)}</span></div>
              <div className="flex justify-between border-t border-[#070738]/8 pt-2"><span className="text-base font-bold text-[#070738]">Total</span><span className="text-base font-bold text-[#070738]">${totalCost.toFixed(2)}</span></div>
            </>
          )}
          {hourlyRate === 0 && (
            <div className="flex justify-between border-t border-[#070738]/8 pt-2"><span className="text-base font-bold text-[#070738]">Total</span><span className="text-base font-bold text-[#070738]">Free</span></div>
          )}
        </div>
        <div className="mt-4 flex items-start gap-2 text-xs text-[#070738]/50">
          <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#070738]/40" />
          <div>
            <p className="font-semibold text-[#070738]">Secure Payment</p>
            <p>Your payment information is encrypted and secure. We never store your card details.</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-[#070738]/50">
          <span className="font-semibold text-[#070738]">Cancellation Policy: </span>
          Free cancellation up to 24 hours before the session. Within 24 hours subject to a 50% fee.
        </p>
      </div>

      {bookingError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {bookingError}
        </div>
      )}
    </div>
  )

  /* ================================================================ */
  /*  STEP 4 — Confirmation                                           */
  /* ================================================================ */
  const confirmedDateStr = confirmedAt
    ? confirmedAt.toLocaleString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
        year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : `${selectedDate} at ${selectedSlot}`

  const Step4 = () => (
    <div className="space-y-5">
      {/* Success Banner — booking is PENDING until the mentor accepts */}
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <Clock className="h-7 w-7 text-amber-600" />
        </div>
        <h3 className="text-xl font-bold text-[#070738]">Booking Request Sent!</h3>
        <p className="mt-1.5 text-sm text-[#070738]/55">
          Your request has been sent to <span className="font-semibold text-[#070738]">{guide.name}</span> for approval.
          {user?.email && (
            <> We've emailed a copy to <span className="font-semibold text-[#070738]">{user.email}</span>.</>
          )}
          <br />
          You'll receive a notification once they accept or decline.
        </p>
      </div>

      {/* Session Details */}
      <div className="rounded-2xl border border-[#070738]/8 bg-[#f5f7fc] p-5">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#070738]">Session Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 text-[#070738]/40" />
            <div>
              <p className="font-semibold text-[#070738]">{confirmedDateStr}</p>
              <p className="text-xs text-[#070738]/45">Date &amp; Time</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 text-[#070738]/40" />
            <div>
              <p className="font-semibold text-[#070738]">{duration.minutes} minutes</p>
              <p className="text-xs text-[#070738]/45">Duration</p>
            </div>
          </div>
          <div>
            <p className="font-semibold text-[#070738]">{sessionType}</p>
            <p className="text-xs text-[#070738]/45">Session Type</p>
          </div>
          <div>
            <p className="font-semibold text-[#070738]">{hourlyRate > 0 ? `$${totalCost.toFixed(2)}` : 'Free'}</p>
            <p className="text-xs text-[#070738]/45">Amount Held</p>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="rounded-2xl border border-[#070738]/8 bg-[#f5f7fc] p-5">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#070738]">What&apos;s Next?</h3>
        <div className="space-y-4">
          {[
            { num: 1, title: 'Mentor Reviews Request', desc: 'Your mentor has been notified and will accept or decline shortly.' },
            { num: 2, title: 'You Get Notified', desc: 'You\'ll receive an email and an in-app notification once the mentor responds.' },
            { num: 3, title: 'Once Confirmed', desc: "You'll receive a video call link 30 minutes before your session starts." },
          ].map((item) => (
            <div key={item.num} className="flex items-start gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#070738] text-xs font-bold text-white">
                {item.num}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#070738]">{item.title}</p>
                <p className="text-xs text-[#070738]/55">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  /* ================================================================ */
  /*  Navigation                                                      */
  /* ================================================================ */
  const canProceed = step === 0 ? !!(selectedDay && selectedSlot) : true

  const nextLabel =
    step === 0 ? 'Continue to Details' :
    step === 1 ? 'Continue to Payment' :
    step === 2 ? (submitting ? 'Confirming…' : 'Complete Booking') : ''

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {/* Back */}
        <button
          onClick={() => navigate(`/guides/${guide.id}`)}
          className="mb-5 flex items-center gap-2 text-sm text-[#070738]/55 hover:text-[#070738] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Profile
        </button>

        <div className="flex flex-col gap-5 md:flex-row">
          {/* Sidebar */}
          <div className="w-full shrink-0 md:w-[280px] lg:w-[300px]">
            <MentorSidebar />
          </div>

          {/* Main */}
          <div className="min-w-0 flex-1">
            <Stepper />
            {step === 0 && <Step1 />}
            {step === 1 && <Step2 />}
            {step === 2 && <Step3 />}
            {step === 3 && <Step4 />}

            {/* Footer Nav */}
            <div className="mt-6 flex items-center justify-between">
              {step > 0 && step < 4 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 rounded-xl border border-[#070738]/15 px-4 py-2.5 text-sm font-medium text-[#070738] hover:bg-[#f5f7fc] transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              ) : <div />}

              {step < 3 && (
                <button
                  disabled={!canProceed || submitting}
                  onClick={step === 2 ? handleConfirm : () => setStep(step + 1)}
                  className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors ${
                    canProceed && !submitting
                      ? 'bg-[#070738] text-white hover:bg-[#070738]/90'
                      : 'bg-[#070738]/20 text-[#070738]/40 cursor-not-allowed'
                  }`}
                >
                  {step === 2 && <Lock className="h-4 w-4" />}
                  {nextLabel}
                </button>
              )}

              {step === 3 && (
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="rounded-xl border border-[#070738]/15 px-4 py-2.5 text-sm font-medium text-[#070738] hover:bg-[#f5f7fc] transition-colors"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/guides')}
                    className="rounded-xl bg-[#070738] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#070738]/90 transition-colors"
                  >
                    Book Another Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}