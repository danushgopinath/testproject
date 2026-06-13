import { useState } from 'react'
import { ArrowRight, ArrowLeft, Upload, X, Check, Plus } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { onboardingApi, type EducationInput, type ExperienceInput } from '../../services/onboardingService'

const STEP_LABELS = ['About', 'Bio & Resume', 'Education', 'Experience', 'Expertise & Schedule']

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

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TIME_OPTIONS = Array.from({ length: 24 }, (_, hour) => `${hour.toString().padStart(2, '0')}:00`)

function formatTimeSlot(time: string) {
  const [hourStr] = time.split(':')
  const startHour = parseInt(hourStr, 10)
  const endHour = (startHour + 1) % 24
  const fmt = (h: number) => {
    const p = h >= 12 ? 'PM' : 'AM'
    const d = h % 12 === 0 ? 12 : h % 12
    return `${d}:00 ${p}`
  }
  return `${fmt(startHour)} – ${fmt(endHour)}`
}

const emptyEducation = (): EducationInput => ({ school: '', degree: '', major: '', startYear: new Date().getFullYear(), endYear: undefined })
const emptyExperience = (): ExperienceInput => ({ organization: '', role: '', responsibilities: '', startYear: new Date().getFullYear(), endYear: undefined, isCurrent: false })

export interface MentorFormInitialValues {
  phone?: string
  currentRole?: string
  bio?: string
  resumeFileName?: string
  resumeIsPublic?: boolean
  linkedinUrl?: string
  githubUrl?: string
  education?: EducationInput[]
  experience?: ExperienceInput[]
  specializations?: string[]
  sessionRate?: number   // in cents (as stored in DB)
  availability?: Record<string, string[]>
}

interface MentorOnboardingFormProps {
  onComplete: () => void
  mode?: 'create' | 'edit'
  initial?: MentorFormInitialValues
  submitLabel?: string
}

export function MentorOnboardingForm({ onComplete, mode = 'create', initial, submitLabel }: MentorOnboardingFormProps) {
  const { user } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Step 1: About
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [email] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [currentRole, setCurrentRole] = useState(initial?.currentRole ?? '')

  // Step 2: Bio & Resume
  const [bio, setBio] = useState(initial?.bio ?? '')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeFileName, setResumeFileName] = useState(initial?.resumeFileName ?? '')
  const [resumeIsPublic, setResumeIsPublic] = useState(initial?.resumeIsPublic ?? true)
  const [linkedinUrl, setLinkedinUrl] = useState(initial?.linkedinUrl ?? '')
  const [githubUrl, setGithubUrl] = useState(initial?.githubUrl ?? '')

  // Step 3: Education
  const [education, setEducation] = useState<EducationInput[]>(
    initial?.education && initial.education.length > 0 ? initial.education : [emptyEducation()],
  )

  // Step 4: Experience
  const [experience, setExperience] = useState<ExperienceInput[]>(
    initial?.experience && initial.experience.length > 0 ? initial.experience : [emptyExperience()],
  )

  // Step 5: Expertise & Availability
  const [specializations, setSpecializations] = useState<string[]>(initial?.specializations ?? [])
  // sessionRate from backend is stored in cents — convert back to dollars for the UI
  const [sessionRate, setSessionRate] = useState(
    initial?.sessionRate != null ? String(Math.round(initial.sessionRate / 100)) : '',
  )
  const [availability, setAvailability] = useState<Record<string, string[]>>(initial?.availability ?? {})

  // ── Education helpers ──
  const updateEdu = (i: number, patch: Partial<EducationInput>) =>
    setEducation((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)))
  const addEdu = () => setEducation((prev) => [...prev, emptyEducation()])
  const removeEdu = (i: number) => setEducation((prev) => prev.filter((_, idx) => idx !== i))

  // ── Experience helpers ──
  const updateExp = (i: number, patch: Partial<ExperienceInput>) =>
    setExperience((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)))
  const addExp = () => setExperience((prev) => [...prev, emptyExperience()])
  const removeExp = (i: number) => setExperience((prev) => prev.filter((_, idx) => idx !== i))

  // ── Availability helpers ──
  const toggleDay = (day: string) => {
    setAvailability((prev) => {
      if (prev[day]) {
        const next = { ...prev }
        delete next[day]
        return next
      }
      return { ...prev, [day]: [] }
    })
  }
  const addSlot = (day: string, time: string) => {
    setAvailability((prev) => {
      const slots = prev[day] ?? []
      if (slots.includes(time)) return prev
      return { ...prev, [day]: [...slots, time].sort() }
    })
  }
  const removeSlot = (day: string, time: string) => {
    setAvailability((prev) => ({ ...prev, [day]: (prev[day] ?? []).filter((t) => t !== time) }))
  }

  const toggleSpecialization = (s: string) => {
    setSpecializations((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  // ── Step validation ──
  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        return firstName.trim() !== '' && lastName.trim() !== '' && email.trim() !== '' && currentRole.trim() !== ''
      case 2:
        return bio.trim().length >= 10 && linkedinUrl.trim() !== '' && linkedinUrl.includes('linkedin.com')
      case 3:
        return education.every((e) => e.school.trim() !== '' && e.degree.trim() !== '' && e.major.trim() !== '')
      case 4:
        return experience.every((e) => e.organization.trim() !== '' && e.role.trim() !== '' && e.responsibilities.trim() !== '')
      case 5:
        return specializations.length > 0 && sessionRate !== '' && Object.keys(availability).length > 0
      default:
        return false
    }
  }

  // ── Submit ──
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      let resumeData: string | undefined
      if (resumeFile) {
        resumeData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(resumeFile)
        })
      }

      await onboardingApi.submit({
        phone,
        bio,
        currentRole,
        linkedinUrl,
        githubUrl: githubUrl || undefined,
        resumeFileName: resumeFileName || undefined,
        resumeData,
        resumeIsPublic,
        education: education.map((e) => ({ ...e, endYear: e.endYear || undefined })),
        experience: experience.map((e) => ({ ...e, endYear: e.isCurrent ? undefined : e.endYear || undefined })),
        specializations,
        sessionRate: Number(sessionRate),
        availability,
      })

      onComplete()
    } catch {
      setSubmitError('Failed to save your profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-text-primary">
          {mode === 'edit' ? 'Edit Mentor Profile' : 'Become a Mentor'}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {mode === 'edit'
            ? 'Update your mentor profile. Changes are visible to seekers immediately.'
            : 'Share your journey and help others succeed'}
        </p>
      </div>

      {/* Step circles */}
      <div className="mb-8 flex items-center justify-center gap-0">
        {STEP_LABELS.map((label, idx) => {
          const step = idx + 1
          const done = currentStep > step
          const active = currentStep === step
          return (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                    done
                      ? 'border-primary bg-primary text-white'
                      : active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-text-muted'
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : step}
                </div>
                <span className={`mt-1 hidden text-[10px] font-medium sm:block ${active ? 'text-primary' : 'text-text-muted'}`}>
                  {label}
                </span>
              </div>
              {step < 5 && (
                <div className={`mb-4 h-0.5 w-8 sm:w-12 md:w-16 ${done ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Card */}
      <div className="rounded-xl border border-border bg-surface p-6 md:p-8">

        {/* ── Step 1: About ── */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-text-primary">About You</h2>
              <p className="mt-0.5 text-sm text-text-muted">Your basic information — email is pre-filled from your account</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Email</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm text-text-muted outline-none cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-text-muted">Fetched from your account</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Current Role <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                placeholder="e.g. Software Engineer at Google"
              />
            </div>
          </div>
        )}

        {/* ── Step 2: Bio & Resume ── */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Bio & Resume</h2>
              <p className="mt-0.5 text-sm text-text-muted">Tell students about yourself and share your background</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Short Bio <span className="text-red-500">*</span></label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
                placeholder="Tell students about your background, experience, and what makes you a great mentor..."
              />
              <p className="mt-1 text-right text-xs text-text-muted">{bio.length}/500</p>
            </div>

            {/* Resume upload */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Resume</label>
              <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                {resumeFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-text-primary">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>{resumeFileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setResumeFile(null); setResumeFileName('') }}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="mx-auto mb-2 h-8 w-8 text-text-muted" />
                    <span className="text-sm font-medium text-primary hover:underline">
                      {mode === 'edit' && resumeFileName ? 'Replace resume' : 'Click to upload'}
                    </span>
                    <p className="mt-1 text-xs text-text-muted">PDF, DOC, or DOCX (max 10 MB)</p>
                    {mode === 'edit' && resumeFileName && (
                      <p className="mt-1 text-xs font-medium text-text-primary">
                        Current: {resumeFileName}
                      </p>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) { setResumeFile(f); setResumeFileName(f.name) }
                      }}
                    />
                  </label>
                )}
              </div>
              {(resumeFile || (mode === 'edit' && resumeFileName)) && (
                <label className="mt-2 flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resumeIsPublic}
                    onChange={(e) => setResumeIsPublic(e.target.checked)}
                    className="rounded"
                  />
                  Show resume on my public profile
                </label>
              )}
            </div>

            {/* LinkedIn & GitHub */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">LinkedIn URL <span className="text-red-500">*</span></label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                placeholder="https://www.linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">GitHub URL <span className="text-text-muted text-xs">(optional)</span></label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                placeholder="https://github.com/yourusername"
              />
            </div>
          </div>
        )}

        {/* ── Step 3: Education ── */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Education</h2>
              <p className="mt-0.5 text-sm text-text-muted">Add your educational background</p>
            </div>
            {education.map((edu, i) => (
              <div key={i} className="relative rounded-lg border border-border bg-background p-4 space-y-3">
                {education.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEdu(i)}
                    className="absolute right-3 top-3 text-text-muted hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-primary">Name of School <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => updateEdu(i, { school: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    placeholder="University of Toronto"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-primary">Degree <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEdu(i, { degree: e.target.value })}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      placeholder="Bachelor of Science"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-primary">Major <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={edu.major}
                      onChange={(e) => updateEdu(i, { major: e.target.value })}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      placeholder="Computer Science"
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-primary">Start Year</label>
                    <input
                      type="number"
                      value={edu.startYear}
                      onChange={(e) => updateEdu(i, { startYear: Number(e.target.value) })}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      placeholder="2018"
                      min="1950"
                      max="2100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-primary">End Year (Expected)</label>
                    <input
                      type="number"
                      value={edu.endYear ?? ''}
                      onChange={(e) => updateEdu(i, { endYear: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      placeholder="2022"
                      min="1950"
                      max="2100"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addEdu}
              className="flex items-center gap-2 rounded-lg border border-dashed border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
            >
              <Plus className="h-4 w-4" /> Add Another Education
            </button>
          </div>
        )}

        {/* ── Step 4: Experience ── */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Experience</h2>
              <p className="mt-0.5 text-sm text-text-muted">Add your work experience</p>
            </div>
            {experience.map((exp, i) => (
              <div key={i} className="relative rounded-lg border border-border bg-background p-4 space-y-3">
                {experience.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExp(i)}
                    className="absolute right-3 top-3 text-text-muted hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-primary">Organization <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={exp.organization}
                    onChange={(e) => updateExp(i, { organization: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    placeholder="Google"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-primary">Role <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => updateExp(i, { role: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-primary">Responsibilities <span className="text-red-500">*</span></label>
                  <textarea
                    value={exp.responsibilities}
                    onChange={(e) => updateExp(i, { responsibilities: e.target.value })}
                    rows={5}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
                    placeholder="Describe your key responsibilities and achievements..."
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-primary">Start Year</label>
                    <input
                      type="number"
                      value={exp.startYear}
                      onChange={(e) => updateExp(i, { startYear: Number(e.target.value) })}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      placeholder="2020"
                      min="1950"
                      max="2100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-primary">
                      End Year {exp.isCurrent && <span className="text-text-muted">(current)</span>}
                    </label>
                    <input
                      type="number"
                      value={exp.isCurrent ? '' : (exp.endYear ?? '')}
                      onChange={(e) => updateExp(i, { endYear: e.target.value ? Number(e.target.value) : undefined })}
                      disabled={exp.isCurrent}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
                      placeholder="2023"
                      min="1950"
                      max="2100"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exp.isCurrent}
                    onChange={(e) => updateExp(i, { isCurrent: e.target.checked, endYear: undefined })}
                    className="rounded"
                  />
                  Currently working here
                </label>
              </div>
            ))}
            <button
              type="button"
              onClick={addExp}
              className="flex items-center gap-2 rounded-lg border border-dashed border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
            >
              <Plus className="h-4 w-4" /> Add Another Experience
            </button>
          </div>
        )}

        {/* ── Step 5: Expertise & Schedule ── */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Expertise & Schedule</h2>
              <p className="mt-0.5 text-sm text-text-muted">Set your areas of expertise, pricing, and availability</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">Areas of Expertise <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {EXPERTISE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleSpecialization(opt)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      specializations.includes(opt)
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-background text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Hourly Rate (USD) <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={sessionRate}
                onChange={(e) => setSessionRate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                placeholder="50"
                min="0"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">Availability <span className="text-red-500">*</span></label>
              <div className="mb-3 flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      availability[day] !== undefined
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-background text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>

              {Object.keys(availability).length > 0 && (
                <div className="space-y-2">
                  {Object.keys(availability).map((day) => (
                    <div key={day} className="rounded-lg border border-border bg-background p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-text-primary">{day}</span>
                        <select
                          onChange={(e) => { if (e.target.value) { addSlot(day, e.target.value); e.target.value = '' } }}
                          className="rounded-md border border-border bg-surface px-2 py-1 text-xs outline-none focus:border-primary"
                        >
                          <option value="">Add time slot</option>
                          {TIME_OPTIONS.map((t) => (
                            <option key={t} value={t}>{formatTimeSlot(t)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(availability[day] ?? []).length === 0 && (
                          <span className="text-xs text-text-muted">No slots added</span>
                        )}
                        {(availability[day] ?? []).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => removeSlot(day, t)}
                            className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary"
                          >
                            {formatTimeSlot(t)} <X className="h-3 w-3" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {submitError && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{submitError}</p>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors ${
              currentStep === 1 ? 'cursor-not-allowed opacity-40' : 'bg-surface text-text-primary hover:bg-background'
            }`}
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={!isStepValid()}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                isStepValid() ? 'bg-primary hover:bg-primary/90' : 'cursor-not-allowed bg-gray-300'
              }`}
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isStepValid() || isSubmitting}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-white transition-colors ${
                isStepValid() && !isSubmitting ? 'bg-primary hover:bg-primary/90' : 'cursor-not-allowed bg-gray-300'
              }`}
            >
              {isSubmitting ? 'Saving...' : (submitLabel ?? (mode === 'edit' ? 'Save Changes' : 'Submit'))} {!isSubmitting && <Check className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}