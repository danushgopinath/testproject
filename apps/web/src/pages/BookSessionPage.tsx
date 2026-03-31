import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Calendar, Clock, Globe, Star,
  ChevronLeft, ChevronRight, Check, CreditCard,
  Shield, Video, MessageCircle, Lock,
} from 'lucide-react'
import { Button } from '../components/atoms/Button'
import { mentors } from '../data/mentors'

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */
const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
const DURATIONS = [
  { label: '1 hour', minutes: 60, multiplier: 1 },
  { label: '2 hours', minutes: 120, multiplier: 2 },
]
const SESSION_TYPES = ['General Mentoring', 'Career Guidance', 'Application Review', 'Mock Interview', 'Portfolio Review']
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
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export function BookSessionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const mentor = mentors.find((m) => m.id === id)

  // Stepper
  const [step, setStep] = useState(0)

  // Step 1 state
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [durationIdx, setDurationIdx] = useState(0)

  // Step 2 state
  const [sessionType, setSessionType] = useState(SESSION_TYPES[0])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [freeText, setFreeText] = useState('')

  // Step 3 state
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card')

  // Derived
  const duration = DURATIONS[durationIdx]
  const sessionCost = mentor ? mentor.hourlyRate * duration.multiplier : 0
  const platformFee = +(sessionCost * PLATFORM_FEE_RATE).toFixed(2)
  const totalCost = +(sessionCost + platformFee).toFixed(2)
  const selectedDate = selectedDay
    ? `${String(calMonth + 1).padStart(2, '0')}/${String(selectedDay).padStart(2, '0')}/${calYear}`
    : null

  // Calendar
  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfMonth(calYear, calMonth)
  const calendarCells = useMemo(() => {
    const cells: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }, [firstDay, daysInMonth])

  const isToday = (day: number) =>
    day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()
  const isPast = (day: number) => {
    const d = new Date(calYear, calMonth, day)
    const t = new Date(); t.setHours(0, 0, 0, 0)
    return d < t
  }
  const isWeekend = (day: number) => {
    const d = new Date(calYear, calMonth, day).getDay()
    return d === 0 || d === 6
  }

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(calYear - 1); setCalMonth(11) }
    else setCalMonth(calMonth - 1)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(calYear + 1); setCalMonth(0) }
    else setCalMonth(calMonth + 1)
    setSelectedDay(null)
  }

  const toggleTopic = (t: string) =>
    setSelectedTopics((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])

  if (!mentor) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        <p className="text-lg font-medium text-text-primary">Mentor not found</p>
      </div>
    )
  }

  /* ---- Stepper UI ---- */
  const Stepper = () => (
    <div className="mb-6 flex items-center justify-between">
      {STEP_LABELS.map((label, idx) => {
        const done = idx < step
        const active = idx === step
        return (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
              done ? 'bg-primary text-white' : active ? 'bg-primary text-white' : 'bg-background text-text-muted'
            }`}>
              {done ? <Check className="h-4 w-4" /> : idx + 1}
            </div>
            <span className={`hidden text-sm font-medium sm:inline ${active || done ? 'text-text-primary' : 'text-text-muted'}`}>
              {label}
            </span>
            {idx < STEP_LABELS.length - 1 && (
              <div className={`mx-2 hidden h-0.5 w-12 sm:block md:w-16 ${done ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )

  /* ---- Mentor Sidebar ---- */
  const MentorSidebar = () => (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-text-primary">Session with</h3>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {mentor.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{mentor.name}</p>
          <p className="text-xs text-text-muted">{mentor.title}</p>
          <p className="text-xs text-text-muted">{mentor.university}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-sm">
        <Star className="h-4 w-4 fill-accent text-accent" />
        <span className="font-medium">{mentor.rating}</span>
        <span className="text-text-muted">({mentor.reviews} reviews)</span>
      </div>
      <div className="mt-2.5 space-y-1.5 text-sm text-text-muted">
        <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{mentor.availability}</div>
        <div className="flex items-center gap-2"><Globe className="h-4 w-4" />{mentor.languages.join(', ')}</div>
      </div>
      <p className="mt-2.5 text-xs text-text-muted">Timezone: PST</p>
      <h4 className="mt-3.5 text-sm font-semibold text-text-primary">Expertise</h4>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {mentor.expertise.map((e) => (
          <span key={e} className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-text-primary">{e}</span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3.5 text-sm">
        <span className="text-text-muted">Hourly Rate</span>
        <span className="text-lg font-semibold text-text-primary">${mentor.hourlyRate}</span>
      </div>
      {step >= 1 && (
        <div className="flex items-center justify-between border-t border-border pt-3 mt-3 text-sm">
          <span className="text-text-muted">Total</span>
          <span className="text-lg font-semibold text-text-primary">${sessionCost}</span>
        </div>
      )}
    </div>
  )

  /* ================================================================ */
  /*  STEP 1 — Select Time                                           */
  /* ================================================================ */
  const Step1 = () => (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-text-primary">
          <Calendar className="h-5 w-5" /> Select Date &amp; Time
        </h3>

        {/* Calendar */}
        <p className="mb-2 text-sm font-medium text-text-primary">Choose a date</p>
        <div className="mb-4 inline-block rounded-xl border border-border p-3.5">
          <div className="mb-2.5 flex items-center justify-between">
            <button onClick={prevMonth} className="rounded p-1 hover:bg-background"><ChevronLeft className="h-4 w-4" /></button>
            <span className="text-sm font-semibold">{MONTH_NAMES[calMonth]} {calYear}</span>
            <button onClick={nextMonth} className="rounded p-1 hover:bg-background"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {DAY_NAMES.map((d) => <div key={d} className="py-1 font-medium text-text-muted">{d}</div>)}
            {calendarCells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />
              const disabled = isPast(day) || isWeekend(day)
              const selected = day === selectedDay
              return (
                <button
                  key={day}
                  disabled={disabled}
                  onClick={() => setSelectedDay(day)}
                  className={`rounded-lg py-1.5 text-sm transition-colors ${
                    selected ? 'bg-primary text-white font-semibold'
                    : isToday(day) ? 'bg-accent/20 font-semibold text-text-primary'
                    : disabled ? 'text-text-muted/40 cursor-not-allowed'
                    : 'hover:bg-background text-text-primary'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
        <p className="mb-4 text-xs text-primary">Sessions are available Monday to Friday. Weekend slots coming soon!</p>

        {/* Time Slots */}
        <h4 className="mb-2 text-sm font-semibold text-text-primary">Available time slots (PST)</h4>
        <div className="mb-5 grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-7">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              onClick={() => setSelectedSlot(slot)}
              className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                selectedSlot === slot
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-surface text-text-primary hover:border-primary/40'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>

        {/* Duration */}
        <h4 className="mb-2 text-sm font-semibold text-text-primary">Session duration</h4>
        <select
          value={durationIdx}
          onChange={(e) => setDurationIdx(Number(e.target.value))}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:border-primary"
        >
          {DURATIONS.map((d, idx) => (
            <option key={d.label} value={idx}>{d.label}  ${mentor.hourlyRate * d.multiplier}</option>
          ))}
        </select>
      </div>

      {/* Summary */}
      {selectedDay && selectedSlot && (
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-text-primary">
            <Clock className="h-5 w-5" /> Session Summary
          </h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between border-b border-border pb-2"><span className="text-text-muted">Date</span><span className="font-medium text-text-primary">{selectedDate}</span></div>
            <div className="flex justify-between border-b border-border pb-2"><span className="text-text-muted">Time</span><span className="font-medium text-text-primary">{selectedSlot} (PST)</span></div>
            <div className="flex justify-between border-b border-border pb-2"><span className="text-text-muted">Duration</span><span className="font-medium text-text-primary">{duration.minutes} minutes</span></div>
            <div className="flex justify-between"><span className="font-semibold text-text-primary">Total Cost</span><span className="text-base font-semibold text-primary">${sessionCost}</span></div>
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
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-text-primary">
          <Calendar className="h-5 w-5" /> Session Details
        </h3>

        <div className="mb-5">
          <p className="mb-2 text-sm font-medium text-text-primary">What type of session would you like?</p>
          <select
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:border-primary"
          >
            {SESSION_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="mb-5">
          <p className="mb-2.5 text-sm font-medium text-text-primary">What topics would you like to discuss? (Select all that apply)</p>
          <div className="grid grid-cols-2 gap-2">
            {TOPICS.map((topic) => {
              const checked = selectedTopics.includes(topic)
              return (
                <label key={topic} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-background">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTopic(topic)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className={checked ? 'text-text-primary' : 'text-text-muted'}>{topic}</span>
                </label>
              )
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-text-primary">Any specific questions or areas you&apos;d like to focus on?</p>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows={3}
            placeholder="Share any specific questions, goals for the session, or background information that would help your mentor prepare..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none placeholder:text-text-muted focus-visible:border-primary"
          />
          <p className="mt-1 text-xs text-text-muted">This helps your mentor prepare and make the most of your time together.</p>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="mb-3 text-base font-semibold text-text-primary">Session Summary</h3>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between border-b border-border pb-2"><span className="text-text-muted">Date &amp; Time</span><span className="font-medium text-text-primary">{selectedDate} at {selectedSlot}</span></div>
          <div className="flex justify-between border-b border-border pb-2"><span className="text-text-muted">Duration</span><span className="font-medium text-text-primary">{duration.minutes} minutes</span></div>
          <div className="flex justify-between border-b border-border pb-2"><span className="text-text-muted">Session Type</span><span className="font-medium text-text-primary">{sessionType}</span></div>
          <div className="flex justify-between"><span className="font-semibold text-text-primary">Total Cost</span><span className="text-base font-semibold text-primary">${sessionCost}</span></div>
        </div>
      </div>
    </div>
  )

  /* ================================================================ */
  /*  STEP 3 — Payment                                                */
  /* ================================================================ */
  const Step3 = () => (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-text-primary">
          <CreditCard className="h-5 w-5" /> Payment Method
        </h3>

        {/* Card */}
        <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm">
          <input type="radio" name="pay" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="h-4 w-4 text-primary focus:ring-primary" />
          <CreditCard className="h-4 w-4 text-text-muted" />
          <span className="font-medium text-text-primary">Credit or Debit Card</span>
        </label>
        {paymentMethod === 'card' && (
          <div className="mb-5 ml-6 space-y-3.5">
            <div>
              <p className="mb-1 text-xs font-medium text-text-primary">Card Number</p>
              <input placeholder="1234 5678 9012 3456" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-text-muted focus-visible:border-primary" />
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <p className="mb-1 text-xs font-medium text-text-primary">Expiry Date</p>
                <input placeholder="MM/YY" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-text-muted focus-visible:border-primary" />
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-text-primary">CVC</p>
                <input placeholder="123" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-text-muted focus-visible:border-primary" />
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-text-primary">Cardholder Name</p>
              <input placeholder="John Doe" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-text-muted focus-visible:border-primary" />
            </div>
          </div>
        )}

        {/* PayPal */}
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="radio" name="pay" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="h-4 w-4 text-primary focus:ring-primary" />
          <span className="font-medium text-text-primary">PayPal</span>
        </label>
      </div>

      {/* Order Summary */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="mb-3 text-base font-semibold text-text-primary">Order Summary</h3>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between"><span className="text-text-primary">Session with {mentor.name}</span><span className="font-medium">${sessionCost.toFixed(2)}</span></div>
          <p className="text-xs text-text-muted">Duration: {duration.minutes} minutes</p>
          <p className="text-xs text-text-muted">{selectedDate} at {selectedSlot}</p>
          <p className="text-xs text-text-muted">Session Type: {sessionType}</p>
          <div className="flex justify-between border-t border-border pt-2.5"><span className="text-text-muted">Platform Fee (5%)</span><span className="font-medium">${platformFee.toFixed(2)}</span></div>
          <div className="flex justify-between border-t border-border pt-2.5"><span className="text-base font-semibold text-text-primary">Total</span><span className="text-base font-semibold text-primary">${totalCost.toFixed(2)}</span></div>
        </div>
        <div className="mt-4 flex items-start gap-2 text-xs text-text-muted">
          <Shield className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p className="font-semibold text-text-primary">Secure Payment</p>
            <p>Your payment information is encrypted and secure. We never store your card details.</p>
          </div>
        </div>
        <div className="mt-3 text-xs text-text-muted">
          <p className="font-semibold text-text-primary">Cancellation Policy</p>
          <p>Free cancellation up to 24 hours before the session. Cancellations within 24 hours are subject to a 50% fee.</p>
        </div>
      </div>
    </div>
  )

  /* ================================================================ */
  /*  STEP 4 — Confirmation                                           */
  /* ================================================================ */
  const Step4 = () => (
    <div className="space-y-5">
      {/* Success Banner */}
      <div className="rounded-xl border-2 border-success/30 bg-success/5 p-7 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
          <Check className="h-6 w-6 text-success" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary">Booking Confirmed!</h3>
        <p className="mt-1 text-sm text-text-muted">Your session with {mentor.name} has been successfully booked.</p>
      </div>

      {/* Session Details */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="mb-3 text-base font-semibold text-text-primary">Session Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 text-text-muted" />
            <div><p className="font-medium text-text-primary">{selectedDate}</p><p className="text-xs text-text-muted">Date</p></div>
          </div>
          <div>
            <p className="font-medium text-text-primary">{duration.minutes} minutes</p>
            <p className="text-xs text-text-muted">Duration</p>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 text-text-muted" />
            <div><p className="font-medium text-text-primary">{selectedSlot} (PST)</p><p className="text-xs text-text-muted">Time</p></div>
          </div>
          <div>
            <p className="font-medium text-text-primary">{sessionType}</p>
            <p className="text-xs text-text-muted">Session Type</p>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-text-primary">What&apos;s Next?</h3>
        <div className="space-y-3.5">
          {[
            { num: 1, title: 'Confirmation Email', desc: "You'll receive a confirmation email with session details and calendar invite." },
            { num: 2, title: 'Mentor Introduction', desc: 'Your mentor may reach out before the session to introduce themselves.' },
            { num: 3, title: 'Join the Session', desc: "You'll receive a video call link 30 minutes before your session starts." },
          ].map((item) => (
            <div key={item.num} className="flex items-start gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">{item.num}</div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Video className="h-5 w-5 text-text-muted" />
            <div>
              <p className="text-sm font-semibold text-text-primary">Join Video Call</p>
              <p className="text-xs text-text-muted">Available 30 min before session</p>
            </div>
          </div>
          <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-background">Join Call</button>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <MessageCircle className="h-5 w-5 text-text-muted" />
            <div>
              <p className="text-sm font-semibold text-text-primary">Message Mentor</p>
              <p className="text-xs text-text-muted">Ask questions before your session</p>
            </div>
          </div>
          <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-background">Message</button>
        </div>
      </div>
    </div>
  )

  /* ================================================================ */
  /*  Navigation                                                      */
  /* ================================================================ */
  const canProceed =
    step === 0 ? !!(selectedDay && selectedSlot) :
    step === 1 ? true :
    step === 2 ? true : false

  const nextLabel =
    step === 0 ? 'Continue to Details' :
    step === 1 ? 'Continue to Payment' :
    step === 2 ? 'Complete Payment' : ''

  const nextIcon =
    step === 2 ? <Lock className="h-4 w-4" /> : null

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */
  return (
    <div className="mx-auto overflow-y-auto px-5 py-5 md:px-8">
      {/* Back link */}
      <button onClick={() => navigate('/guides')} className="mb-4 flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Mentors
      </button>

      <div className="flex flex-col gap-5 md:flex-row">
        {/* Sidebar — Mentor Info (LEFT) */}
        <div className="w-full shrink-0 md:sticky md:top-5 md:w-[280px] md:self-start lg:w-[300px]">
          <MentorSidebar />
        </div>

        {/* Main — Step Content (RIGHT) */}
        <div className="min-w-0 flex-1">
          <Stepper />
          {step === 0 && <Step1 />}
          {step === 1 && <Step2 />}
          {step === 2 && <Step3 />}
          {step === 3 && <Step4 />}

          {/* Footer Navigation */}
          <div className="mt-6 flex items-center justify-between">
            {step > 0 && step < 4 ? (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-background">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : <div />}
            {step < 3 ? (
              <Button
                size="lg"
                disabled={!canProceed}
                onClick={() => setStep(step + 1)}
              >
                <span className="flex items-center gap-2">
                  {nextIcon}
                  {nextLabel}
                </span>
              </Button>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => navigate('/dashboard')} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-background">Go to Dashboard</button>
                <Button onClick={() => navigate('/guides')}>Book Another Session</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
