import { useState } from 'react'
import { ArrowRight, ArrowLeft, Upload, X, Check } from 'lucide-react'

interface MentorOnboardingData {
  // Step 1: Personal Details
  firstName: string
  lastName: string
  email: string
  phone: string
  bio: string
  location: string

  // Step 2: Resume
  resume: File | null
  resumeFileName: string

  // Step 3: LinkedIn
  linkedinUrl: string

  // Step 4: Scheduling
  expertise: string[]
  hourlyRate: string
  availability: {
    days: string[]
    timeSlots: Record<string, string[]>
  }
  sessionDuration: string

  // Step 5: Review (computed from above)
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TIME_OPTIONS = Array.from({ length: 24 }, (_, hour) => `${hour.toString().padStart(2, '0')}:00`)
const EXPERTISE_OPTIONS = [
  'University Admissions',
  'Graduate School Applications',
  'MBA Applications',
  'Career Transition',
  'Technical Interviews',
  'Product Management',
  'Software Engineering',
  'Data Science',
  'Finance',
  'Consulting',
  'Investment Banking',
  'Other',
]

export function MentorOnboardingForm({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<MentorOnboardingData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    resume: null,
    resumeFileName: '',
    linkedinUrl: '',
    expertise: [],
    hourlyRate: '',
    availability: {
      days: [],
      timeSlots: {},
    },
    sessionDuration: '60',
  })

  const updateFormData = (updates: Partial<MentorOnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      updateFormData({ resume: file, resumeFileName: file.name })
    }
  }

  const toggleDay = (day: string) => {
    const days = formData.availability.days.includes(day)
      ? formData.availability.days.filter((d) => d !== day)
      : [...formData.availability.days, day].sort(
          (a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b)
        )
    updateFormData({ availability: { ...formData.availability, days } })
  }

  const addTimeSlot = (day: string, time: string) => {
    const slots = formData.availability.timeSlots[day] || []
    if (!slots.includes(time)) {
      updateFormData({
        availability: {
          ...formData.availability,
          timeSlots: {
            ...formData.availability.timeSlots,
            [day]: [...slots, time].sort(),
          },
        },
      })
    }
  }

  const removeTimeSlot = (day: string, time: string) => {
    const slots = (formData.availability.timeSlots[day] ?? []).filter((t) => t !== time)

    const nextTimeSlots: Record<string, string[]> =
      slots.length > 0
        ? { ...formData.availability.timeSlots, [day]: slots }
        : (() => {
            const { [day]: _removed, ...rest } = formData.availability.timeSlots
            return rest
          })()

    updateFormData({
      availability: {
        ...formData.availability,
        timeSlots: nextTimeSlots,
      },
    })
  }

  const toggleExpertise = (expertise: string) => {
    const list = formData.expertise.includes(expertise)
      ? formData.expertise.filter((e) => e !== expertise)
      : [...formData.expertise, expertise]
    updateFormData({ expertise: list })
  }

  const formatTimeSlot = (time: string) => {
    const [hourStr] = time.split(':')
    const startHour = parseInt(hourStr, 10)
    const endHour = (startHour + 1) % 24

    const formatHour = (h: number) => {
      const period = h >= 12 ? 'PM' : 'AM'
      let display = h % 12
      if (display === 0) display = 12
      return `${display}:00 ${period}`
    }

    return `${formatHour(startHour)} – ${formatHour(endHour)}`
  }

  const handleSubmit = () => {
    // In a real app, you would submit this to the backend
    console.log('Mentor onboarding data:', formData)
    // Store completion status (in real app, this would be in backend)
    localStorage.setItem('mentorOnboardingComplete', 'true')
    onComplete()
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.firstName.trim() !== '' &&
          formData.lastName.trim() !== '' &&
          formData.email.trim() !== '' &&
          formData.bio.trim() !== '' &&
          formData.location.trim() !== ''
        )
      case 2:
        return formData.resume !== null
      case 3:
        return formData.linkedinUrl.trim() !== '' && formData.linkedinUrl.includes('linkedin.com')
      case 4:
        return (
          formData.expertise.length > 0 &&
          formData.hourlyRate.trim() !== '' &&
          formData.availability.days.length > 0 &&
          Object.keys(formData.availability.timeSlots).length > 0
        )
      case 5:
        return true
      default:
        return false
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8 md:px-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm text-text-muted">
          <span>Step {currentStep} of 5</span>
          <span>{Math.round((currentStep / 5) * 100)}% Complete</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-background">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-xl border border-border bg-surface p-8">
        {/* Step 1: Personal Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-text-primary">Personal Details</h2>
              <p className="text-sm text-text-muted">Tell us about yourself</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateFormData({ firstName: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData({ lastName: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                placeholder="john.doe@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateFormData({ location: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                placeholder="New York, NY, USA"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => updateFormData({ bio: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                placeholder="Tell us about your background, experience, and what makes you a great mentor..."
              />
            </div>
          </div>
        )}

        {/* Step 2: Resume Upload */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-text-primary">Upload Resume</h2>
              <p className="text-sm text-text-muted">Share your professional background</p>
            </div>
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
              {formData.resume ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-text-primary">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>{formData.resumeFileName}</span>
                    <button
                      onClick={() => updateFormData({ resume: null, resumeFileName: '' })}
                      className="ml-2 text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <label className="cursor-pointer">
                      <span className="text-sm font-medium text-primary hover:underline">
                        Click to upload
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-1 text-xs text-text-muted">PDF, DOC, or DOCX (max 10MB)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: LinkedIn URL */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-text-primary">LinkedIn Profile</h2>
              <p className="text-sm text-text-muted">Connect your LinkedIn profile</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">LinkedIn URL</label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => updateFormData({ linkedinUrl: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                placeholder="https://www.linkedin.com/in/yourprofile"
              />
              <p className="mt-1.5 text-xs text-text-muted">
                This helps students learn more about your professional background
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Scheduling */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-text-primary">Scheduling & Expertise</h2>
              <p className="text-sm text-text-muted">Set your availability and rates</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">Areas of Expertise</label>
              <div className="flex flex-wrap gap-2">
                {EXPERTISE_OPTIONS.map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => toggleExpertise(exp)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      formData.expertise.includes(exp)
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-background text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">Hourly Rate ($)</label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => updateFormData({ hourlyRate: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                  placeholder="50"
                  min="0"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">Session Duration (min)</label>
                <select
                  value={formData.sessionDuration}
                  onChange={(e) => updateFormData({ sessionDuration: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">Availability</label>
              <div className="mb-4 flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      formData.availability.days.includes(day)
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-background text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>

              {formData.availability.days.length > 0 && (
                <div className="space-y-3">
                  {formData.availability.days.map((day) => {
                    const slots = formData.availability.timeSlots[day] || []
                    return (
                      <div key={day} className="rounded-lg border border-border bg-background p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-text-primary">{day}</span>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                addTimeSlot(day, e.target.value)
                                e.target.value = ''
                              }
                            }}
                            className="rounded-md border border-border bg-surface px-2 py-1 text-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                          >
                            <option value="">Add time slot</option>
                            {TIME_OPTIONS.map((time) => (
                              <option key={time} value={time}>
                                {formatTimeSlot(time)}
                              </option>
                            ))}
                          </select>
                        </div>
                        {slots.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {slots.map((time) => (
                              <button
                                key={time}
                                type="button"
                                onClick={() => removeTimeSlot(day, time)}
                                className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary"
                              >
                                <span>{formatTimeSlot(time)}</span>
                                <X className="h-3 w-3" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-text-muted">No time slots added</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-text-primary">Review & Submit</h2>
              <p className="text-sm text-text-muted">Review your information before submitting</p>
            </div>

            <div className="space-y-4 rounded-lg border border-border bg-background p-4">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-text-primary">Personal Information</h3>
                <div className="space-y-1 text-sm text-text-muted">
                  <p>
                    <span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {formData.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {formData.phone || 'Not provided'}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span> {formData.location}
                  </p>
                  <p>
                    <span className="font-medium">Bio:</span> {formData.bio}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-text-primary">Resume</h3>
                <p className="text-sm text-text-muted">{formData.resumeFileName || 'Not uploaded'}</p>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-text-primary">LinkedIn</h3>
                <p className="text-sm text-text-muted">{formData.linkedinUrl || 'Not provided'}</p>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-text-primary">Expertise & Rates</h3>
                <div className="space-y-1 text-sm text-text-muted">
                  <p>
                    <span className="font-medium">Expertise:</span> {formData.expertise.join(', ')}
                  </p>
                  <p>
                    <span className="font-medium">Hourly Rate:</span> ${formData.hourlyRate}/hour
                  </p>
                  <p>
                    <span className="font-medium">Session Duration:</span> {formData.sessionDuration} minutes
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-text-primary">Availability</h3>
                <div className="space-y-1 text-sm text-text-muted">
                  {formData.availability.days.map((day) => {
                    const slots = formData.availability.timeSlots[day] || []
                    return (
                      <p key={day}>
                        <span className="font-medium">{day}:</span>{' '}
                        {slots.length > 0
                          ? slots.map((t) => formatTimeSlot(t)).join(', ')
                          : 'No slots'}
                      </p>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors ${
              currentStep === 1
                ? 'cursor-not-allowed opacity-50'
                : 'text-text-primary hover:bg-background'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!isStepValid()}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                isStepValid()
                  ? 'bg-primary hover:bg-primary/90'
                  : 'cursor-not-allowed bg-gray-400'
              }`}
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Submit
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
