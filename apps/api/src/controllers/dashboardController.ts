import type { Response } from 'express'
import { dashboardService } from '../services/dashboardService'
import { AppError } from '../utils/errors'
import type { AuthenticatedRequest } from '../middleware/requireAuth'

export async function getSeekerDashboard(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) {
    throw new AppError('Missing user context', 401)
  }
  const result = await dashboardService.getSeekerDashboard(userId)
  res.json(result)
}

export async function getGuideDashboard(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) {
    throw new AppError('Missing user context', 401)
  }
  const result = await dashboardService.getGuideDashboard(userId)
  res.json(result)
}

