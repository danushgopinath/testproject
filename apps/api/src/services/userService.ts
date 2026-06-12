import bcrypt from 'bcryptjs'
import { prisma } from '../config/prisma'
import { AppError } from '../utils/errors'
import { uploadToS3, getSignedUrl, deletePrefix } from '../utils/s3'
import { logger } from '../config/logger'

const ALLOWED_AVATAR_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_AVATAR_BYTES = 5 * 1024 * 1024 // 5 MB

const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export const userService = {
  async getSettings(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        bio: true,
        authProvider: true,
        profileIsPublic: true,
        notifySessionRequests: true,
        notifySessionConfirmed: true,
        notifySessionReminders: true,
        notifyNewMessages: true,
        notifyMarketing: true,
      },
    })
    if (!user) throw new AppError('User not found', 404)
    return user
  },

  async updateProfile(userId: string, data: { firstName: string; lastName: string; bio?: string | null }) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        bio: data.bio?.trim() ?? null,
      },
      select: { id: true, firstName: true, lastName: true, email: true, bio: true },
    })
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new AppError('User not found', 404)
    if (user.authProvider !== 'EMAIL') {
      throw new AppError('Password change is not available for social login accounts', 400)
    }
    if (!user.passwordHash) throw new AppError('No password set on this account', 400)

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValid) throw new AppError('Current password is incorrect', 400)

    if (newPassword.length < 8) throw new AppError('New password must be at least 8 characters', 400)

    const hash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } })
  },

  async updateNotifications(
    userId: string,
    prefs: {
      notifySessionRequests?: boolean
      notifySessionConfirmed?: boolean
      notifySessionReminders?: boolean
      notifyNewMessages?: boolean
      notifyMarketing?: boolean
    },
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: prefs,
      select: {
        notifySessionRequests: true,
        notifySessionConfirmed: true,
        notifySessionReminders: true,
        notifyNewMessages: true,
        notifyMarketing: true,
      },
    })
  },

  async updatePrivacy(userId: string, profileIsPublic: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { profileIsPublic },
      select: { profileIsPublic: true },
    })
  },

  /**
   * Upload a new avatar from a DataURL (`data:image/<type>;base64,<...>`).
   * Stores the file in S3 under `avatars/{userId}/{ts}.{ext}` and saves
   * that S3 key on User.avatarUrl. Returns a fresh signed download URL.
   */
  async uploadAvatar(userId: string, avatarData: string) {
    const match = avatarData.match(/^data:([^;]+);base64,(.+)$/)
    if (!match || !match[1] || !match[2]) {
      throw new AppError('Invalid image data', 400)
    }
    const contentType = match[1].toLowerCase()
    const base64 = match[2]

    if (!ALLOWED_AVATAR_MIME.has(contentType)) {
      throw new AppError('Unsupported image type. Use JPG, PNG, WEBP, or GIF.', 400)
    }

    const buffer = Buffer.from(base64, 'base64')
    if (buffer.length > MAX_AVATAR_BYTES) {
      throw new AppError('Image is too large. Max 5 MB.', 400)
    }

    const ext = MIME_EXT[contentType] ?? 'bin'
    const key = `avatars/${userId}/${Date.now()}.${ext}`
    await uploadToS3(buffer, key, contentType)

    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: key },
    })

    const signedUrl = await getSignedUrl(key, 24 * 60 * 60)
    return { avatarUrl: signedUrl }
  },

  async deleteAccount(userId: string) {
    // ── 1) Wipe all S3 objects under this user's prefixes.
    // Done before the Postgres transaction so that on failure the user
    // can retry — orphaned DB rows are worse than orphaned S3 objects
    // (the latter can be swept by a bucket lifecycle rule).
    try {
      const [resumeCount, avatarCount] = await Promise.all([
        deletePrefix(`resumes/${userId}/`),
        deletePrefix(`avatars/${userId}/`),
      ])
      logger.info(`Deleted ${resumeCount} resume(s) and ${avatarCount} avatar(s) for user ${userId}`)
    } catch (err) {
      logger.error(`Failed to delete user S3 objects for ${userId}: ${(err as Error).message}`)
      throw new AppError('Failed to remove stored files. Please try again.', 500)
    }

    // ── 2) Wipe Postgres (transactionally).
    await prisma.$transaction(async (tx) => {
      const [guideProfile, seekerProfile] = await Promise.all([
        tx.guideProfile.findUnique({ where: { userId }, select: { id: true } }),
        tx.seekerProfile.findUnique({ where: { userId }, select: { id: true } }),
      ])

      // Reviews first (reference sessions and users)
      await tx.review.deleteMany({ where: { reviewerId: userId } })
      if (guideProfile) {
        await tx.review.deleteMany({ where: { guideId: guideProfile.id } })
      }

      // Messages
      await tx.message.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } })

      // Sessions
      if (guideProfile) await tx.session.deleteMany({ where: { guideId: guideProfile.id } })
      if (seekerProfile) await tx.session.deleteMany({ where: { seekerId: seekerProfile.id } })

      // Journeys (not cascaded from GuideProfile)
      if (guideProfile) await tx.journey.deleteMany({ where: { guideProfileId: guideProfile.id } })

      // Profiles (Education + Experience cascade from GuideProfile)
      if (guideProfile) await tx.guideProfile.delete({ where: { id: guideProfile.id } })
      if (seekerProfile) await tx.seekerProfile.delete({ where: { id: seekerProfile.id } })

      await tx.user.delete({ where: { id: userId } })
    })
  },
}