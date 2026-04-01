import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Star, Globe, GraduationCap, MapPin } from 'lucide-react'
import { Button } from '../components/atoms/Button'
import { useGuide } from '../hooks/useGuides'

export function GuideProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: guide, isLoading, isError } = useGuide(id)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-8 text-sm text-text-muted">
        Loading mentor profile...
      </div>
    )
  }

  if (isError || !guide) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/guides')}>
          <span className="flex items-center gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to all mentors
          </span>
        </Button>
        <div className="mt-8 rounded-2xl border border-border bg-surface p-12 text-center">
          <p className="text-lg font-medium text-text-primary">Mentor not found</p>
          <p className="mt-1 text-sm text-text-muted">
            This mentor profile doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>
    )
  }

  const initials = guide.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
      <Button variant="ghost" size="sm" onClick={() => navigate('/guides')}>
        <span className="flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Mentors
        </span>
      </Button>

      <div className="mt-6 space-y-6">
        {/* Profile Card */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-start gap-5">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-white">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-text-primary">{guide.name}</h1>
                  <p className="mt-1 text-base text-text-muted">{guide.headline}</p>
                  {guide.university && (
                    <p className="text-base text-text-muted">{guide.university}</p>
                  )}
                  {guide.currentRole && (
                    <p className="mt-1 text-sm text-text-muted">
                      {guide.currentRole}
                      {guide.currentCompany ? ` @ ${guide.currentCompany}` : ''}
                    </p>
                  )}
                </div>
                <Button
                  size="lg"
                  onClick={() => navigate(`/guides/${guide.id}/book`)}
                  className="hidden shrink-0 sm:flex"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Book Session
                  </span>
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-text-muted">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-medium text-text-primary">
                    {guide.averageRating ? guide.averageRating.toFixed(1) : 'New'}
                  </span>
                  <span>· {guide.totalSessions} sessions</span>
                </div>
                {guide.graduationYear && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    Class of {guide.graduationYear}
                  </div>
                )}
                {guide.languages.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    {guide.languages.join(', ')}
                  </div>
                )}
              </div>
              {/* Mobile Book Session button */}
              <Button
                size="lg"
                fullWidth
                onClick={() => navigate(`/guides/${guide.id}/book`)}
                className="mt-4 sm:hidden"
              >
                <span className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Book Session
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Journeys */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-text-primary">Journeys</h2>
          {guide.journeys.length === 0 ? (
            <p className="text-sm text-text-muted">
              This mentor hasn&apos;t added any detailed journeys yet.
            </p>
          ) : (
            <div className="space-y-4">
              {guide.journeys.map((journey) => (
                <div
                  key={journey.id}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <GraduationCap className="h-3 w-3" />
                      {journey.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Calendar className="h-3 w-3" />
                      {journey.year}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <MapPin className="h-3 w-3" />
                      {journey.institution}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-text-primary">
                    {journey.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-muted">{journey.description}</p>
                  {journey.outcomes.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 text-xs text-text-muted">
                      {journey.outcomes.map((o) => (
                        <li key={o}>{o}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

