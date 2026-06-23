import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MentorOnboardingForm, type MentorFormInitialValues } from '../../components/organisms/MentorOnboardingForm'
import { onboardingApi } from '../../services/onboardingService'

interface GuideProfileResponse {
  guideProfile: {
    phone: string | null
    currentRole: string
    bio: string | null
    linkedinUrl: string | null
    githubUrl: string | null
    resumeFileName: string | null
    resumeIsPublic: boolean
    sessionRate: number | null
    availability: Record<string, string[]> | null
    timezone: string | null
    specializations: string[]
    education: {
      school: string
      degree: string
      major: string
      startYear: number
      endYear: number | null
    }[]
    experience: {
      organization: string
      role: string
      responsibilities: string
      startYear: number
      endYear: number | null
      isCurrent: boolean
    }[]
    user: { firstName: string; lastName: string; email: string; bio: string | null }
  } | null
}

export function EditMentorProfilePage() {
  const navigate = useNavigate()
  const [initial, setInitial] = useState<MentorFormInitialValues | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    onboardingApi.getMyProfile()
      .then((data: GuideProfileResponse) => {
        if (cancelled) return
        const g = data.guideProfile
        if (!g) {
          setError('You haven\'t set up a mentor profile yet.')
          setLoading(false)
          return
        }
        setInitial({
          phone: g.phone ?? '',
          currentRole: g.currentRole,
          bio: g.user.bio ?? '',
          linkedinUrl: g.linkedinUrl ?? '',
          githubUrl: g.githubUrl ?? '',
          resumeFileName: g.resumeFileName ?? '',
          resumeIsPublic: g.resumeIsPublic,
          specializations: g.specializations,
          sessionRate: g.sessionRate ?? undefined,
          availability: g.availability ?? {},
          timezone: g.timezone ?? undefined,
          education: g.education.map((e) => ({
            school: e.school,
            degree: e.degree,
            major: e.major,
            startYear: e.startYear,
            endYear: e.endYear ?? undefined,
          })),
          experience: g.experience.map((e) => ({
            organization: e.organization,
            role: e.role,
            responsibilities: e.responsibilities,
            startYear: e.startYear,
            endYear: e.endYear ?? undefined,
            isCurrent: e.isCurrent,
          })),
        })
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError('Failed to load your mentor profile.')
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
      <button
        onClick={() => navigate('/profile')}
        className="mb-4 flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Profile
      </button>

      {loading && (
        <div className="rounded-xl border border-border bg-surface p-10 text-center text-sm text-text-muted">
          Loading your mentor profile…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && initial && (
        <MentorOnboardingForm
          mode="edit"
          initial={initial}
          onComplete={() => navigate('/profile')}
        />
      )}
    </div>
  )
}