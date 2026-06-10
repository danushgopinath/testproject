import { useRef, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { GraduationCap, Star, MessageSquare, Camera, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMyProfile } from '../hooks/useDashboard'

export function ProfilePage() {
  const { user } = useAuthStore()
  const { data: profile, isLoading } = useMyProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`

  const joinedLabel = profile?.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : null

  const guide = profile?.guide ?? null

  const educationLabel = guide?.education[0]
    ? `${guide.education[0].degree}, ${guide.education[0].school}`
    : null

  const roleLabel = guide
    ? guide.currentCompany
      ? `${guide.currentRole} @ ${guide.currentCompany}`
      : guide.currentRole
    : null

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-border" />
        <div className="mt-6 h-48 animate-pulse rounded-xl bg-border" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-8">

      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Profile</h1>
        <p className="mt-1 text-sm text-text-muted">View and manage your public profile</p>
      </div>

      {/* Main profile card */}
      <div className="mb-5 rounded-2xl border border-border bg-surface shadow-sm">

        {/* Top banner */}
        <div className="h-24 rounded-t-2xl bg-gradient-to-r from-primary/80 to-primary" />

        {/* Identity row */}
        <div className="relative px-6 pb-6">
          {/* Avatar — overlaps the banner */}
          <div className="relative -mt-12 mb-4 inline-block">
            <div className="relative h-20 w-20 rounded-full ring-4 ring-surface">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                  {initials}
                </div>
              )}
              {/* Camera overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md border border-border text-text-muted hover:text-primary transition-colors"
                title="Change photo"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Name / email / role  +  joined pill */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="mt-0.5 text-sm text-text-muted">{user?.email}</p>
              {roleLabel && (
                <p className="mt-1 text-sm font-medium text-text-primary">{roleLabel}</p>
              )}
              {guide && (
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-text-primary">
                    {guide.averageRating != null ? guide.averageRating.toFixed(1) : '—'}
                  </span>
                  <span className="text-text-muted">· {guide.totalSessions} sessions</span>
                </div>
              )}
            </div>

            {/* Joined badge */}
            {joinedLabel && (
              <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-text-muted">
                Joined {joinedLabel}
              </span>
            )}
          </div>

          {/* Headline */}
          {guide?.headline && (
            <p className="mt-4 text-sm text-text-muted">{guide.headline}</p>
          )}

          {/* Info chips row */}
          {(educationLabel || guide?.linkedinUrl) && (
            <div className="mt-4 flex flex-wrap gap-3">
              {educationLabel && (
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                  <span>{educationLabel}</span>
                </div>
              )}
              {guide?.linkedinUrl && (
                <a
                  href={guide.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  LinkedIn
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Guide stats */}
      {guide && (
        <div className="mb-5 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-muted">Total Sessions</p>
                <p className="mt-0.5 text-lg font-semibold text-text-primary">{guide.totalSessions}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Star className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-muted">Avg. Rating</p>
                <p className="mt-0.5 text-lg font-semibold text-text-primary">
                  {guide.averageRating != null ? guide.averageRating.toFixed(1) : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expertise & Languages */}
      {guide && (guide.specializations.length > 0 || guide.languages.length > 0) && (
        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {guide.specializations.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Areas of Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {guide.specializations.map((area) => (
                  <span
                    key={area}
                    className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
          {guide.languages.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {guide.languages.map((lang) => (
                  <span
                    key={lang}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-text-primary"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Work experience */}
      {guide && guide.education.length > 1 && (
        <div className="mb-5 rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Education</h3>
          <div className="space-y-3">
            {guide.education.map((edu, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <GraduationCap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{edu.school}</p>
                  <p className="text-xs text-text-muted">
                    {edu.degree} · {edu.major} · {edu.startYear}–{edu.endYear ?? 'Present'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/settings/profile"
          style={{ color: 'white' }}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-primary/90"
        >
          Edit Profile
        </Link>
        <Link
          to="/settings"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-background"
        >
          Settings
        </Link>
      </div>
    </div>
  )
}