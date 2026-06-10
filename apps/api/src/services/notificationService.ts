import { prisma } from '../config/prisma'
import type { NotificationType } from '../../generated/prisma'

export const notificationService = {
  async create(opts: {
    userId: string
    type: NotificationType
    title: string
    body: string
    link?: string
    sessionId?: string
  }) {
    return prisma.notification.create({
      data: {
        userId: opts.userId,
        type: opts.type,
        title: opts.title,
        body: opts.body,
        link: opts.link ?? null,
        sessionId: opts.sessionId ?? null,
      },
    })
  },

  async list(userId: string, limit = 20) {
    const items = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return items.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      link: n.link,
      sessionId: n.sessionId,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    }))
  },

  async unreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } })
  },

  async markRead(userId: string, notificationId: string) {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    })
  },

  async markAllRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
  },
}