import { prisma } from '../config/prisma'
import { AppError } from '../utils/errors'

function initials(firstName: string | null | undefined, lastName: string | null | undefined) {
  const a = (firstName?.trim()?.[0] ?? '').toUpperCase()
  const b = (lastName?.trim()?.[0] ?? '').toUpperCase()
  return a + b || 'U'
}

export const reviewService = {
  /**
   * Completed sessions for this seeker, each with its existing review (if any).
   * Drives the seeker "Reviews" page: unreviewed sessions get a form, reviewed
   * ones show what was submitted.
   */
  async listSeekerReviewables(userId: string) {
    const seeker = await prisma.seekerProfile.findUnique({
      where: { userId },
      select: { id: true },
    })
    if (!seeker) return []

    const sessions = await prisma.session.findMany({
      where: { seekerId: seeker.id, status: 'COMPLETED' },
      orderBy: { scheduledAt: 'desc' },
      include: { guide: { include: { user: true } }, review: true },
    })

    return sessions.map((s) => {
      const u = s.guide.user
      return {
        sessionId: s.id,
        guideId: s.guideId,
        guideName: `${u.firstName} ${u.lastName}`.trim(),
        guideInitials: initials(u.firstName, u.lastName),
        role: s.guide.currentRole
          ? `${s.guide.currentRole}${s.guide.currentCompany ? ` @ ${s.guide.currentCompany}` : ''}`
          : s.guide.headline,
        topic: s.topic,
        scheduledAt: s.scheduledAt.toISOString(),
        review: s.review
          ? {
              rating: s.review.rating,
              comment: s.review.comment,
              createdAt: s.review.createdAt.toISOString(),
            }
          : null,
      }
    })
  },

  /** Create a review for a completed session the seeker owns, then refresh the guide's average rating. */
  async createReview(
    userId: string,
    input: { sessionId: string; rating: number; comment?: string },
  ) {
    const rating = Math.round(Number(input.rating))
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400)
    }

    const session = await prisma.session.findUnique({
      where: { id: input.sessionId },
      include: { seeker: { include: { user: true } }, review: true },
    })
    if (!session) throw new AppError('Session not found', 404)
    if (session.seeker.user.id !== userId) {
      throw new AppError('You can only review your own sessions', 403)
    }
    if (session.status !== 'COMPLETED') {
      throw new AppError('Only completed sessions can be reviewed', 409)
    }
    if (session.review) {
      throw new AppError('This session has already been reviewed', 409)
    }

    const review = await prisma.review.create({
      data: {
        sessionId: session.id,
        reviewerId: userId,
        guideId: session.guideId,
        rating,
        comment: input.comment?.trim() || null,
      },
    })

    // Recompute the guide's average rating from all their reviews.
    const agg = await prisma.review.aggregate({
      where: { guideId: session.guideId },
      _avg: { rating: true },
    })
    await prisma.guideProfile.update({
      where: { id: session.guideId },
      data: { averageRating: agg._avg.rating ?? null },
    })

    return {
      id: review.id,
      sessionId: review.sessionId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
    }
  },
}