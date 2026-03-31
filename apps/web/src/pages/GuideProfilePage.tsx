import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Star, Clock, Globe } from 'lucide-react'
import { Button } from '../components/atoms/Button'
import { mentors } from '../data/mentors'

export function GuideProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const mentor = mentors.find((m) => m.id === id)

  if (!mentor) {
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
              {mentor.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-text-primary">{mentor.name}</h1>
                  <p className="mt-1 text-base text-text-muted">{mentor.title}</p>
                  <p className="text-base text-text-muted">{mentor.university}</p>
                </div>
                <Button size="lg" onClick={() => navigate(`/guides/${mentor.id}/book`)} className="hidden shrink-0 sm:flex">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Book Session
                  </span>
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-text-muted">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-medium text-text-primary">{mentor.rating}</span>
                  <span>({mentor.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {mentor.availability}
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {mentor.languages.join(', ')}
                </div>
              </div>
              {/* Mobile Book Session button */}
              <Button size="lg" fullWidth onClick={() => navigate(`/guides/${mentor.id}/book`)} className="mt-4 sm:hidden">
                <span className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Book Session
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-text-primary">About</h2>
          <p className="text-sm leading-relaxed text-text-muted">{mentor.bio}</p>
        </div>

        {/* Expertise */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-text-primary">Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {mentor.expertise.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-text-primary">
            Reviews ({mentor.reviews})
          </h2>
          <div className="space-y-4">
            {[
              {
                initials: 'SJ',
                name: 'Sarah Johnson',
                text: 'Incredibly helpful session. Clear, structured advice that helped me navigate my grad school applications.',
                rating: 5,
              },
              {
                initials: 'MK',
                name: 'Michael Kim',
                text: 'Great insights into the industry. Really helped me understand what recruiters look for.',
                rating: 5,
              },
              {
                initials: 'AP',
                name: 'Ananya Patel',
                text: 'Very knowledgeable and approachable. Would definitely book another session.',
                rating: 5,
              },
            ].map((review) => (
              <div key={review.name} className="rounded-xl border border-border bg-background p-4">
                <div className="mb-2 flex items-center gap-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-text-muted">&ldquo;{review.text}&rdquo;</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    {review.initials}
                  </div>
                  <span className="text-xs font-medium text-text-primary">{review.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
