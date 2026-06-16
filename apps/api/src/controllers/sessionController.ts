import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/requireAuth'
import { catchAsync } from '../utils/catchAsync'
import { sessionService } from '../services/sessionService'
import { ValidationError, AppError } from '../utils/errors'

export const sessionController = {
  create: catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.auth?.userId) throw new ValidationError('Unauthenticated')

    const { guideId, scheduledAt, durationMinutes, sessionType, topics, notes, totalCost } = req.body

    if (!guideId || !scheduledAt || !durationMinutes || !sessionType) {
      throw new ValidationError('Missing required booking fields')
    }

    const result = await sessionService.createSession(req.auth.userId, {
      guideId,
      scheduledAt,
      durationMinutes: Number(durationMinutes),
      sessionType,
      topics: Array.isArray(topics) ? topics : [],
      notes: notes ?? undefined,
      totalCost: Number(totalCost ?? 0),
    })

    res.status(201).json(result)
  }),

  accept: catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.auth?.userId) throw new AppError('Unauthenticated', 401)
    const sessionId = req.params['id'] as string
    if (!sessionId) throw new AppError('Missing session id', 400)
    const result = await sessionService.acceptSession(req.auth.userId, sessionId)
    res.json(result)
  }),

  decline: catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.auth?.userId) throw new AppError('Unauthenticated', 401)
    const sessionId = req.params['id'] as string
    if (!sessionId) throw new AppError('Missing session id', 400)
    const result = await sessionService.declineSession(req.auth.userId, sessionId)
    res.json(result)
  }),

  join: catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.auth?.userId) throw new AppError('Unauthenticated', 401)
    const sessionId = req.params['id'] as string
    if (!sessionId) throw new AppError('Missing session id', 400)
    const result = await sessionService.joinSession(req.auth.userId, sessionId)
    res.json(result)
  }),
}