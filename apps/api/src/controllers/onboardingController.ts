import type { Response } from 'express'
import { onboardingService } from '../services/onboardingService'
import { AppError } from '../utils/errors'
import type { AuthenticatedRequest } from '../middleware/requireAuth'

export async function submitOnboarding(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Unauthorized', 401)

  const data = req.body
  const result = await onboardingService.submitOnboarding(userId, data)
  res.json(result)
}

export async function getMyProfile(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Unauthorized', 401)

  const result = await onboardingService.getMyProfile(userId)
  res.json(result)
}

export async function getOnboardingStatus(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Unauthorized', 401)

  const result = await onboardingService.getOnboardingStatus(userId)
  res.json(result)
}