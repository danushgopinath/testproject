import type { Response } from 'express'
import { userService } from '../services/userService'
import { AppError } from '../utils/errors'
import type { AuthenticatedRequest } from '../middleware/requireAuth'

export async function getSettings(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Missing user context', 401)
  const result = await userService.getSettings(userId)
  res.json(result)
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Missing user context', 401)

  const { firstName, lastName, bio } = req.body as { firstName?: string; lastName?: string; bio?: string }
  if (!firstName?.trim() || !lastName?.trim()) {
    throw new AppError('First name and last name are required', 400)
  }

  const result = await userService.updateProfile(userId, { firstName, lastName, bio: bio ?? null })
  res.json(result)
}

export async function changePassword(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Missing user context', 401)

  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string
    newPassword?: string
  }
  if (!currentPassword || !newPassword) {
    throw new AppError('currentPassword and newPassword are required', 400)
  }

  await userService.changePassword(userId, currentPassword, newPassword)
  res.json({ message: 'Password updated successfully' })
}

export async function updateNotifications(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Missing user context', 401)

  const { notifySessionRequests, notifySessionConfirmed, notifySessionReminders, notifyNewMessages, notifyMarketing } =
    req.body as {
      notifySessionRequests?: boolean
      notifySessionConfirmed?: boolean
      notifySessionReminders?: boolean
      notifyNewMessages?: boolean
      notifyMarketing?: boolean
    }

  const prefs: Parameters<typeof userService.updateNotifications>[1] = {}
  if (notifySessionRequests !== undefined) prefs.notifySessionRequests = notifySessionRequests
  if (notifySessionConfirmed !== undefined) prefs.notifySessionConfirmed = notifySessionConfirmed
  if (notifySessionReminders !== undefined) prefs.notifySessionReminders = notifySessionReminders
  if (notifyNewMessages !== undefined) prefs.notifyNewMessages = notifyNewMessages
  if (notifyMarketing !== undefined) prefs.notifyMarketing = notifyMarketing

  const result = await userService.updateNotifications(userId, prefs)
  res.json(result)
}

export async function updatePrivacy(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Missing user context', 401)

  const { profileIsPublic } = req.body as { profileIsPublic?: boolean }
  if (typeof profileIsPublic !== 'boolean') {
    throw new AppError('profileIsPublic must be a boolean', 400)
  }

  const result = await userService.updatePrivacy(userId, profileIsPublic)
  res.json(result)
}

export async function deleteAccount(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Missing user context', 401)

  await userService.deleteAccount(userId)
  res.clearCookie('refreshToken')
  res.json({ message: 'Account deleted successfully' })
}

export async function uploadAvatar(req: AuthenticatedRequest, res: Response) {
  const userId = req.auth?.userId
  if (!userId) throw new AppError('Missing user context', 401)

  const { avatarData } = req.body as { avatarData?: string }
  if (!avatarData || typeof avatarData !== 'string') {
    throw new AppError('avatarData (data URL) is required', 400)
  }

  const result = await userService.uploadAvatar(userId, avatarData)
  res.json(result)
}