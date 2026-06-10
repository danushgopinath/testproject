import { prisma } from '../config/prisma'

function initials(firstName: string | null | undefined, lastName: string | null | undefined) {
  const a = (firstName?.trim()?.[0] ?? '').toUpperCase()
  const b = (lastName?.trim()?.[0] ?? '').toUpperCase()
  return (a + b) || 'U'
}

// Lazily flip session statuses based on elapsed time.
// CONFIRMED + end time passed → COMPLETED
// PENDING   + end time passed → CANCELLED (missed / never accepted)
async function autoUpdateSessions(seekerId: string) {
  const now = new Date()

  const active = await prisma.session.findMany({
    where: {
      seekerId,
      status: { in: ['CONFIRMED', 'PENDING'] },
    },
    select: { id: true, status: true, scheduledAt: true, durationMinutes: true },
  })

  const toComplete: string[] = []
  const toCancel: string[] = []

  for (const s of active) {
    const endTime = new Date(s.scheduledAt.getTime() + s.durationMinutes * 60_000)
    if (endTime < now) {
      if (s.status === 'CONFIRMED') toComplete.push(s.id)
      else toCancel.push(s.id)
    }
  }

  await Promise.all([
    toComplete.length > 0 &&
      prisma.session.updateMany({ where: { id: { in: toComplete } }, data: { status: 'COMPLETED' } }),
    toCancel.length > 0 &&
      prisma.session.updateMany({ where: { id: { in: toCancel } }, data: { status: 'CANCELLED' } }),
  ])
}

export const dashboardService = {
  async getMyProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        guideProfile: {
          include: { education: { orderBy: { startYear: 'desc' } } },
        },
      },
    })
    if (!user) return null

    const g = user.guideProfile
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      joinedAt: user.createdAt.toISOString(),
      guide: g
        ? {
            headline: g.headline,
            currentRole: g.currentRole,
            currentCompany: g.currentCompany,
            specializations: g.specializations,
            languages: g.languages,
            totalSessions: g.totalSessions,
            averageRating: g.averageRating,
            linkedinUrl: g.linkedinUrl,
            availability: (g.availability as Record<string, string[]> | null) ?? null,
            education: g.education.map((e) => ({
              school: e.school,
              degree: e.degree,
              major: e.major,
              startYear: e.startYear,
              endYear: e.endYear,
            })),
          }
        : null,
    }
  },

  async getNotifications(userId: string) {
    const [unreadMessages, unreadNotificationCount, seekerProfile, guideProfile] = await Promise.all([
      prisma.message.count({ where: { receiverId: userId, isRead: false } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.seekerProfile.findUnique({ where: { userId }, select: { id: true } }),
      prisma.guideProfile.findUnique({ where: { userId }, select: { id: true } }),
    ])

    const [pendingSessionRequests, pendingAwaitingConfirmation] = await Promise.all([
      guideProfile
        ? prisma.session.count({ where: { guideId: guideProfile.id, status: 'PENDING' } })
        : Promise.resolve(0),
      seekerProfile
        ? prisma.session.count({ where: { seekerId: seekerProfile.id, status: 'PENDING' } })
        : Promise.resolve(0),
    ])

    return {
      unreadMessages,
      unreadNotificationCount,
      pendingSessionRequests,
      pendingAwaitingConfirmation,
    }
  },


  async getSeekerDashboard(userId: string) {
    const seekerProfile = await prisma.seekerProfile.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!seekerProfile) {
      return {
        stats: { upcomingSessions: 0, unreadMessages: 0, guidesConnected: 0, sessionsCompleted: 0 },
        upcomingSessions: [],
        recentMessages: [],
      }
    }

    await autoUpdateSessions(seekerProfile.id)

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
          where: { seekerId: seekerProfile.id, status: 'COMPLETED' },
        }),
        prisma.session.findMany({
          where: { seekerId: seekerProfile.id },
          select: { guideId: true },
          distinct: ['guideId'],
        }),
        prisma.message.count({
          where: { receiverId: userId, isRead: false },
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
      include: { guide: { include: { user: true } } },
    })

    const recentMessages = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { sender: true, receiver: true },
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
          otherUserId: guideUser.id,
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

  async getGuidePendingRequests(userId: string) {
    const guideProfile = await prisma.guideProfile.findUnique({
      where: { userId },
      select: { id: true },
    })
    if (!guideProfile) return []

    const requests = await prisma.session.findMany({
      where: { guideId: guideProfile.id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: { seeker: { include: { user: true } } },
    })

    return requests.map((s) => {
      const u = s.seeker.user
      return {
        id: s.id,
        name: `${u.firstName} ${u.lastName}`.trim(),
        initials: initials(u.firstName, u.lastName),
        email: u.email,
        topic: s.topic,
        notes: s.notes,
        scheduledAt: s.scheduledAt.toISOString(),
        durationMinutes: s.durationMinutes,
        totalCost: s.totalCost,
        createdAt: s.createdAt.toISOString(),
      }
    })
  },

  async getSeekerSessions(userId: string) {
    const seekerProfile = await prisma.seekerProfile.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!seekerProfile) return { upcoming: [], past: [] }

    await autoUpdateSessions(seekerProfile.id)

    const all = await prisma.session.findMany({
      where: { seekerId: seekerProfile.id },
      orderBy: { scheduledAt: 'asc' },
      include: { guide: { include: { user: true } } },
    })

    const mapSession = (s: typeof all[number]) => {
      const u = s.guide.user
      return {
        id: s.id,
        status: s.status,
        name: `${u.firstName} ${u.lastName}`.trim(),
        initials: initials(u.firstName, u.lastName),
        role: s.guide.currentRole
          ? `${s.guide.currentRole}${s.guide.currentCompany ? ` @ ${s.guide.currentCompany}` : ''}`
          : s.guide.headline,
        guideId: s.guide.id,
        topic: s.topic,
        scheduledAt: s.scheduledAt.toISOString(),
        durationMinutes: s.durationMinutes,
        totalCost: s.totalCost, // cents
      }
    }

    return {
      upcoming: all.filter((s) => s.status === 'CONFIRMED' || s.status === 'PENDING').map(mapSession),
      past: all
        .filter((s) => s.status === 'COMPLETED' || s.status === 'CANCELLED')
        .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())
        .map(mapSession),
    }
  },

  async getSeekerAnalytics(userId: string) {
    const seekerProfile = await prisma.seekerProfile.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!seekerProfile) {
      return {
        spending: { totalSpent: 0, thisMonth: 0, averagePerSession: 0, sessionsThisMonth: 0, totalSessions: 0 },
        mentors: [],
      }
    }

    await autoUpdateSessions(seekerProfile.id)

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const completed = await prisma.session.findMany({
      where: { seekerId: seekerProfile.id, status: 'COMPLETED' },
      include: { guide: { include: { user: true } } },
      orderBy: { scheduledAt: 'desc' },
    })

    const totalSpentCents = completed.reduce((acc, s) => acc + s.totalCost, 0)
    const thisMonthSessions = completed.filter((s) => s.scheduledAt >= startOfMonth)
    const thisMonthCents = thisMonthSessions.reduce((acc, s) => acc + s.totalCost, 0)
    const avgCents = completed.length > 0 ? Math.round(totalSpentCents / completed.length) : 0

    // Unique guides from all sessions (not just completed — connected = ever booked)
    const allSessions = await prisma.session.findMany({
      where: { seekerId: seekerProfile.id },
      select: { guideId: true, guide: { include: { user: true } } },
      distinct: ['guideId'],
    })

    const mentors = allSessions.map((s) => {
      const u = s.guide.user
      const sessionsWithGuide = completed.filter((c) => c.guideId === s.guideId)
      return {
        id: s.guideId,
        name: `${u.firstName} ${u.lastName}`.trim(),
        initials: initials(u.firstName, u.lastName),
        role: s.guide.currentRole
          ? `${s.guide.currentRole}${s.guide.currentCompany ? ` @ ${s.guide.currentCompany}` : ''}`
          : s.guide.headline,
        completedSessions: sessionsWithGuide.length,
        lastSessionAt: sessionsWithGuide[0]?.scheduledAt.toISOString() ?? null,
      }
    })

    return {
      spending: {
        totalSpent: +(totalSpentCents / 100).toFixed(2),
        thisMonth: +(thisMonthCents / 100).toFixed(2),
        averagePerSession: +(avgCents / 100).toFixed(2),
        sessionsThisMonth: thisMonthSessions.length,
        totalSessions: completed.length,
      },
      mentors,
    }
  },

  async getGuideDashboard(userId: string) {
    const guideProfile = await prisma.guideProfile.findUnique({
      where: { userId },
      select: { id: true, averageRating: true, totalSessions: true, sessionRate: true },
    })

    if (!guideProfile) {
      return {
        stats: { upcomingSessions: 0, pendingRequests: 0, monthlyEarnings: 0, avgRating: null as number | null },
        upcomingSessions: [],
        pendingRequests: [],
        recentMessages: [],
      }
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    const [upcomingCount, pendingCount] = await Promise.all([
      prisma.session.count({
        where: {
          guideId: guideProfile.id,
          scheduledAt: { gt: now },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      }),
      prisma.session.count({
        where: { guideId: guideProfile.id, status: 'PENDING' },
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
      include: { seeker: { include: { user: true } } },
    })

    const pendingRequests = await prisma.session.findMany({
      where: { guideId: guideProfile.id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { seeker: { include: { user: true } } },
    })

    const recentMessages = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { sender: true, receiver: true },
    })

    // Monthly earnings: sum totalCost of confirmed/completed sessions this month
    const monthlyEarningsAgg = await prisma.session.aggregate({
      where: {
        guideId: guideProfile.id,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        scheduledAt: { gte: startOfMonth, lt: endOfMonth },
      },
      _sum: { totalCost: true },
    })
    const monthlyEarnings = +((monthlyEarningsAgg._sum.totalCost ?? 0) / 100).toFixed(2)

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
          otherUserId: u.id,
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