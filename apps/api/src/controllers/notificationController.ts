import type { Response } from 'express'
import { notificationService } from '../services/notificationService'
import { AppError } from '../utils/errors'
import type { AuthenticatedRequest } from '../middleware/requireAuth'

export async function list(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Missing user context', 401)
  const items = await notificationService.list(userId, 30)
  res.json(items)
}

export async function markRead(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Missing user context', 401)
  const id = req.params['id'] as string
  if (!id) throw new AppError('Missing id', 400)
  await notificationService.markRead(userId, id)
  res.json({ ok: true })
}

export async function markAllRead(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Missing user context', 401)
  await notificationService.markAllRead(userId)
  res.json({ ok: true })
}