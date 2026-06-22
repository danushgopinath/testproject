import type { Response } from 'express'
import { dashboardService } from '../services/dashboardService'
import { AppError } from '../utils/errors'
import type { AuthenticatedRequest } from '../middleware/requireAuth'

export async function getMyProfile(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Missing user context', 401)
  const result = await dashboardService.getMyProfile(userId)
  if (!result) throw new AppError('User not found', 404)
  res.json(result)
}

export async function getNotifications(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Missing user context', 401)
  const result = await dashboardService.getNotifications(userId)
  res.json(result)
}

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
  if (!userId) throw new AppError('Missing user context', 401)
  const result = await dashboardService.getGuideDashboard(userId)
  res.json(result)
}

export async function getSeekerSessions(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Missing user context', 401)
  const result = await dashboardService.getSeekerSessions(userId)
  res.json(result)
}

export async function getGuideSessions(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Missing user context', 401)
  const result = await dashboardService.getGuideSessions(userId)
  res.json(result)
}

export async function getSeekerAnalytics(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Missing user context', 401)
  const result = await dashboardService.getSeekerAnalytics(userId)
  res.json(result)
}

export async function getGuidePendingRequests(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Missing user context', 401)
  const result = await dashboardService.getGuidePendingRequests(userId)
  res.json(result)
}

export async function getGuideAnalytics(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Missing user context', 401)
  const result = await dashboardService.getGuideAnalytics(userId)
  res.json(result)
}

