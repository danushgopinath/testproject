import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/requireAuth'
import { catchAsync } from '../utils/catchAsync'
import { reviewService } from '../services/reviewService'
import { AppError, ValidationError } from '../utils/errors'

export const reviewController = {
  listMine: catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.auth?.userId) throw new AppError('Unauthenticated', 401)
    const result = await reviewService.listSeekerReviewables(req.auth.userId)
    res.json(result)
  }),

  create: catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.auth?.userId) throw new AppError('Unauthenticated', 401)
    const { sessionId, rating, comment } = req.body
    if (!sessionId || rating == null) {
      throw new ValidationError('sessionId and rating are required')
    }
    const result = await reviewService.createReview(req.auth.userId, {
      sessionId,
      rating: Number(rating),
      comment: comment ?? undefined,
    })
    res.status(201).json(result)
  }),
}