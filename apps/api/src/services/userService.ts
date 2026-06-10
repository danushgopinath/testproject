import bcrypt from 'bcryptjs'
import { prisma } from '../config/prisma'
import { AppError } from '../utils/errors'

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

  async deleteAccount(userId: string) {
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