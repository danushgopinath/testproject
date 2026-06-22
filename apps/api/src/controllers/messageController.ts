import type { Response } from 'express'
import { messageService } from '../services/messageService'
import { AppError } from '../utils/errors'
import type { AuthenticatedRequest } from '../middleware/requireAuth'

export async function getConversations(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Missing user context', 401)
  const role = req.query['role'] === 'GUIDE' ? 'GUIDE' : 'SEEKER'
  const result = await messageService.getConversations(userId, role)
  res.json(result)
}

export async function getThread(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Missing user context', 401)
  const otherId = req.params['otherId'] as string
  if (!otherId) throw new AppError('Missing otherId', 400)
  const result = await messageService.getThread(userId, otherId)
  res.json(result)
}

export async function sendMessage(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Missing user context', 401)
  const { receiverId, content } = req.body
  if (!receiverId || typeof receiverId !== 'string') throw new AppError('receiverId is required', 400)
  if (!content || typeof content !== 'string' || !content.trim()) throw new AppError('content is required', 400)
  if (content.length > 2000) throw new AppError('Message too long (max 2000 chars)', 400)
  if (receiverId === userId) throw new AppError('Cannot message yourself', 400)
  const result = await messageService.sendMessage(userId, receiverId, content.trim())
  res.status(201).json(result)
}