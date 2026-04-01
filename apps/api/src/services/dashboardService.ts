import { prisma } from '../config/prisma'

function initials(firstName: string | null | undefined, lastName: string | null | undefined) {
  const a = (firstName?.trim()?.[0] ?? '').toUpperCase()
  const b = (lastName?.trim()?.[0] ?? '').toUpperCase()
  return (a + b) || 'U'
}

export const dashboardService = {
  async getSeekerDashboard(userId: string) {
    // SeekerProfile may not exist for older users; handle gracefully
    const seekerProfile = await prisma.seekerProfile.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!seekerProfile) {
      return {
        stats: {
          upcomingSessions: 0,
          unreadMessages: 0,
          guidesConnected: 0,
          sessionsCompleted: 0,
        },
        upcomingSessions: [],
        recentMessages: [],
      }
    }

    const now = new Date()

    const [upcomingSessionsCount, sessionsCompletedCount, connectedGuides, unreadMessagesCount] =
      await Promise.all([
        prisma.session.count({
          where: {
            seekerId: seekerProfile.id,
            scheduledAt: { gt: now },
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
        }),
        prisma.session.count({
          where: {
            seekerId: seekerProfile.id,
            status: 'COMPLETED',
          },
        }),
        prisma.session.findMany({
          where: { seekerId: seekerProfile.id },
          select: { guideId: true },
          distinct: ['guideId'],
        }),
        prisma.message.count({
          where: {
            receiverId: userId,
            isRead: false,
          },
        }),
      ])

    const upcomingSessions = await prisma.session.findMany({
      where: {
        seekerId: seekerProfile.id,
        scheduledAt: { gt: now },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 3,
      include: {
        guide: {
          include: {
            user: true,
          },
        },
      },
    })

    const recentMessages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        sender: true,
        receiver: true,
      },
    })

    return {
      stats: {
        upcomingSessions: upcomingSessionsCount,
        unreadMessages: unreadMessagesCount,
        guidesConnected: connectedGuides.length,
        sessionsCompleted: sessionsCompletedCount,
      },
      upcomingSessions: upcomingSessions.map((s) => {
        const guideUser = s.guide.user
        return {
          id: s.id,
          name: `${guideUser.firstName} ${guideUser.lastName}`.trim(),
          initials: initials(guideUser.firstName, guideUser.lastName),
          headline: s.guide.currentRole
            ? `${s.guide.currentRole}${s.guide.currentCompany ? ` @ ${s.guide.currentCompany}` : ''}`
            : s.guide.headline,
          topic: s.topic,
          scheduledAt: s.scheduledAt.toISOString(),
          durationMinutes: s.durationMinutes,
          status: s.status,
        }
      }),
      recentMessages: recentMessages.map((m) => {
        const other = m.senderId === userId ? m.receiver : m.sender
        return {
          id: m.id,
          name: `${other.firstName} ${other.lastName}`.trim(),
          initials: initials(other.firstName, other.lastName),
          message: m.content,
          createdAt: m.createdAt.toISOString(),
          isUnread: m.receiverId === userId ? !m.isRead : false,
        }
      }),
    }
  },

  async getGuideDashboard(userId: string) {
    const guideProfile = await prisma.guideProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        averageRating: true,
        totalSessions: true,
        sessionRate: true,
      },
    })

    if (!guideProfile) {
      return {
        stats: {
          upcomingSessions: 0,
          pendingRequests: 0,
          monthlyEarnings: 0,
          avgRating: null as number | null,
        },
        upcomingSessions: [],
        pendingRequests: [],
        recentMessages: [],
      }
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    const [upcomingCount, pendingCount, monthlyEarningsCents] = await Promise.all([
      prisma.session.count({
        where: {
          guideId: guideProfile.id,
          scheduledAt: { gt: now },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      }),
      prisma.session.count({
        where: {
          guideId: guideProfile.id,
          status: 'PENDING',
        },
      }),
      prisma.session.aggregate({
        where: {
          guideId: guideProfile.id,
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          scheduledAt: { gte: startOfMonth, lt: endOfMonth },
        },
        _sum: {
          // sessionRate is stored on GuideProfile; sessions don't store amount yet.
          // Until billing exists, use 0.
          durationMinutes: true,
        },
      }),
    ])

    const upcomingSessions = await prisma.session.findMany({
      where: {
        guideId: guideProfile.id,
        scheduledAt: { gt: now },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 3,
      include: {
        seeker: {
          include: {
            user: true,
          },
        },
      },
    })

    const pendingRequests = await prisma.session.findMany({
      where: {
        guideId: guideProfile.id,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        seeker: {
          include: {
            user: true,
          },
        },
      },
    })

    const recentMessages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        sender: true,
        receiver: true,
      },
    })

    // Billing not implemented yet; keep as 0 for now.
    const monthlyEarnings = 0
    void monthlyEarningsCents
    void guideProfile.sessionRate

    return {
      stats: {
        upcomingSessions: upcomingCount,
        pendingRequests: pendingCount,
        monthlyEarnings,
        avgRating: guideProfile.averageRating,
      },
      upcomingSessions: upcomingSessions.map((s) => {
        const u = s.seeker.user
        return {
          id: s.id,
          name: `${u.firstName} ${u.lastName}`.trim(),
          initials: initials(u.firstName, u.lastName),
          role: 'Seeker',
          topic: s.topic,
          scheduledAt: s.scheduledAt.toISOString(),
          durationMinutes: s.durationMinutes,
          status: s.status,
        }
      }),
      pendingRequests: pendingRequests.map((s) => {
        const u = s.seeker.user
        return {
          id: s.id,
          name: `${u.firstName} ${u.lastName}`.trim(),
          initials: initials(u.firstName, u.lastName),
          topic: s.topic,
          scheduledAt: s.scheduledAt.toISOString(),
          durationMinutes: s.durationMinutes,
          status: s.status,
        }
      }),
      recentMessages: recentMessages.map((m) => {
        const other = m.senderId === userId ? m.receiver : m.sender
        return {
          id: m.id,
          name: `${other.firstName} ${other.lastName}`.trim(),
          initials: initials(other.firstName, other.lastName),
          message: m.content,
          createdAt: m.createdAt.toISOString(),
          isUnread: m.receiverId === userId ? !m.isRead : false,
        }
      }),
    }
  },
}

