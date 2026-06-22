import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Calendar } from 'lucide-react'
import { DashboardSidebar } from '../components/organisms/DashboardSidebar'
import { useMyReviewables, useCreateReview, type ReviewableSession } from '../hooks/useReviews'

function StarRating({ value, onChange, readOnly }: { value: number; onChange?: (v: number) => void; readOnly?: boolean }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = (hover || value) >= n
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(n)}
            onMouseEnter={() => !readOnly && setHover(n)}
            onMouseLeave={() => !readOnly && setHover(0)}
            className={readOnly ? 'cursor-default' : 'cursor-pointer'}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
          >
            <Star className={`h-6 w-6 ${filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
          </button>
        )
      })}
    </div>
  )
}

function ReviewCard({ item }: { item: ReviewableSession }) {
  const createReview = useCreateReview()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const dt = new Date(item.scheduledAt)
  const when = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

  const submit = () => {
    if (rating < 1) return
    createReview.mutate({ sessionId: item.sessionId, rating, comment: comment.trim() || undefined })
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {item.guideInitials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-medium text-text-primary">{item.guideName}</h3>
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <Calendar className="h-3 w-3" />
              {when}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-text-muted">{item.role}</p>
          <p className="mt-1 text-sm font-medium text-text-primary">{item.topic}</p>

          {item.review ? (
            <div className="mt-3 rounded-lg border border-border bg-background p-3">
              <StarRating value={item.review.rating} readOnly />
              {item.review.comment && (
                <p className="mt-2 text-sm text-text-muted">{item.review.comment}</p>
              )}
              <p className="mt-1 text-xs text-text-muted">
                Reviewed {new Date(item.review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <StarRating value={rating} onChange={setRating} />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share how the session went (optional)"
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary/40 focus:outline-none"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={submit}
                  disabled={rating < 1 || createReview.isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createReview.isPending ? 'Submitting…' : 'Submit review'}
                </button>
                {createReview.isError && (
                  <span className="text-xs text-red-600">Could not submit. Try again.</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ReviewsPage() {
  const { data, isLoading } = useMyReviewables()
  const items = data ?? []

  return (
    <div className="flex w-full">
      <DashboardSidebar />
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-3xl px-6 py-8 md:px-8">
          <h1 className="text-2xl font-semibold text-text-primary">Reviews</h1>
          <p className="mt-1 text-sm text-text-muted">
            Rate the mentors you've completed sessions with.
          </p>

          <div className="mt-6 space-y-4">
        {isLoading && (
          <div className="rounded-xl border border-border bg-surface p-5 text-sm text-text-muted">
            Loading your completed sessions…
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <p className="text-sm font-medium text-text-primary">No completed sessions yet</p>
            <p className="mt-1 text-sm text-text-muted">
              Once you finish a session with a mentor, you can review them here.
            </p>
            <Link
              to="/guides"
              className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              style={{ color: 'white' }}
            >
              Find Mentors
            </Link>
          </div>
        )}

        {items.map((item) => (
          <ReviewCard key={item.sessionId} item={item} />
        ))}
          </div>
        </div>
      </div>
    </div>
  )
}