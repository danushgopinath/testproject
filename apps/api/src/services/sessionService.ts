import { prisma } from '../config/prisma'
import { AppError } from '../utils/errors'
import {
  sendSessionConfirmationEmail,
  sendSessionRequestEmail,
  sendSessionDeclinedEmail,
  sendBookingPlacedEmail,
} from '../utils/email'
import { notificationService } from './notificationService'
import { dailyService } from './dailyService'
import { evaluateJoinEligibility } from './video/joinEligibility'

function fmtDate(d: Date) {
  return d.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

export const sessionService = {
  async createSession(userId: string, body: {
    guideId: string
    scheduledAt: string
    durationMinutes: number
    sessionType: string
    topics: string[]
    notes?: string
    totalCost: number
  }) {
    const { guideId, scheduledAt, durationMinutes, sessionType, topics, notes, totalCost } = body

    // ── Validate scheduled time — must be at least 12 hours in the future
    const scheduledDate = new Date(scheduledAt)
    if (isNaN(scheduledDate.getTime())) {
      throw new AppError('Invalid date', 400)
    }
    const now = new Date()
    const minLeadMs = 12 * 60 * 60 * 1000 // 12 hours
    if (scheduledDate.getTime() < now.getTime() + minLeadMs) {
      throw new AppError('Sessions must be booked at least 12 hours in advance.', 400)
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new AppError('User not found', 404)

    let seeker = await prisma.seekerProfile.findUnique({ where: { userId } })
    if (!seeker) {
      seeker = await prisma.seekerProfile.create({
        data: { userId, currentStatus: 'STUDENT' },
      })
    }

    const guide = await prisma.guideProfile.findFirst({
      where: { id: guideId, isApproved: true },
      include: { user: true },
    })
    if (!guide) throw new AppError('Guide not found', 404)

    // Block self-booking — a user cannot book a session with themselves
    if (guide.userId === userId) {
      throw new AppError('You cannot book a session with yourself.', 400)
    }

    // ── Prevent double-booking the exact same slot with same mentor
    const overlap = await prisma.session.findFirst({
      where: {
        guideId: guide.id,
        seekerId: seeker.id,
        scheduledAt: scheduledDate,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    })
    if (overlap) {
      throw new AppError('You already have a session booked at this exact time with this mentor.', 400)
    }

    const topic = [sessionType, ...topics].filter(Boolean).join(', ')

    const session = await prisma.session.create({
      data: {
        seekerId: seeker.id,
        guideId: guide.id,
        status: 'PENDING',
        scheduledAt: scheduledDate,
        durationMinutes,
        topic,
        notes: notes ?? null,
        totalCost: Math.round(totalCost * 100),
      },
    })

    const seekerName = `${user.firstName} ${user.lastName}`
    const guideName = `${guide.user.firstName} ${guide.user.lastName}`
    const dateStr = fmtDate(scheduledDate)

    // ── In-app notifications (best-effort)
    notificationService.create({
      userId: guide.userId,
      type: 'SESSION_REQUEST',
      title: 'New session request',
      body: `${seekerName} requested a ${sessionType} session on ${dateStr}.`,
      link: '/dashboard/requests',
      sessionId: session.id,
    }).catch(() => {})

    notificationService.create({
      userId: user.id,
      type: 'BOOKING_PLACED',
      title: 'Booking request sent',
      body: `Your request with ${guideName} on ${dateStr} is awaiting their approval.`,
      link: '/sessions',
      sessionId: session.id,
    }).catch(() => {})

    // ── Emails (best-effort, non-blocking)
    sendSessionRequestEmail({
      to: guide.user.email,
      guideName,
      seekerName,
      scheduledAt: scheduledDate,
      durationMinutes,
      sessionType,
      totalCost,
    }).catch(() => {})

    sendBookingPlacedEmail({
      to: user.email,
      seekerName,
      guideName,
      scheduledAt: scheduledDate,
      durationMinutes,
      sessionType,
      totalCost,
    }).catch(() => {})

    return {
      sessionId: session.id,
      status: session.status,
      scheduledAt: session.scheduledAt,
      guideName,
    }
  },

  async acceptSession(guideUserId: string, sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        guide: { include: { user: true } },
        seeker: { include: { user: true } },
      },
    })

    if (!session) throw new AppError('Session not found', 404)
    if (session.guide.userId !== guideUserId) throw new AppError('Not authorized', 403)
    if (session.status !== 'PENDING') throw new AppError('Session is not pending', 400)

    await prisma.session.update({
      where: { id: sessionId },
      data: { status: 'CONFIRMED' },
    })

    const seekerUser = session.seeker.user
    const guideUser = session.guide.user
    const seekerName = `${seekerUser.firstName} ${seekerUser.lastName}`
    const guideName = `${guideUser.firstName} ${guideUser.lastName}`
    const dateStr = fmtDate(session.scheduledAt)

    // Determine sessionType from topic (first segment before comma)
    const sessionType = (session.topic.split(',')[0] ?? session.topic).trim()

    // Notify both seeker (booking confirmed) and guide (you accepted)
    notificationService.create({
      userId: seekerUser.id,
      type: 'SESSION_ACCEPTED',
      title: 'Session confirmed',
      body: `${guideName} accepted your session on ${dateStr}.`,
      link: '/sessions',
      sessionId: session.id,
    }).catch(() => {})

    notificationService.create({
      userId: guideUser.id,
      type: 'SESSION_ACCEPTED',
      title: 'You accepted a session',
      body: `Session with ${seekerName} on ${dateStr} is confirmed.`,
      link: '/sessions',
      sessionId: session.id,
    }).catch(() => {})

    sendSessionConfirmationEmail({
      to: seekerUser.email,
      seekerName,
      guideName,
      scheduledAt: session.scheduledAt,
      durationMinutes: session.durationMinutes,
      sessionType,
      totalCost: session.totalCost / 100,
    }).catch(() => {})

    return { sessionId, status: 'CONFIRMED' }
  },

  async declineSession(guideUserId: string, sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        guide: { include: { user: true } },
        seeker: { include: { user: true } },
      },
    })

    if (!session) throw new AppError('Session not found', 404)
    if (session.guide.userId !== guideUserId) throw new AppError('Not authorized', 403)
    if (session.status !== 'PENDING') throw new AppError('Session is not pending', 400)

    await prisma.session.update({
      where: { id: sessionId },
      data: { status: 'CANCELLED' },
    })

    const seekerUser = session.seeker.user
    const guideUser = session.guide.user
    const seekerName = `${seekerUser.firstName} ${seekerUser.lastName}`
    const guideName = `${guideUser.firstName} ${guideUser.lastName}`
    const dateStr = fmtDate(session.scheduledAt)

    notificationService.create({
      userId: seekerUser.id,
      type: 'SESSION_DECLINED',
      title: 'Session declined',
      body: `${guideName} couldn't accept your session on ${dateStr}. Browse other mentors!`,
      link: '/guides',
      sessionId: session.id,
    }).catch(() => {})

    notificationService.create({
      userId: guideUser.id,
      type: 'SESSION_DECLINED',
      title: 'You declined a session',
      body: `You declined the session with ${seekerName} on ${dateStr}.`,
      link: '/dashboard/requests',
      sessionId: session.id,
    }).catch(() => {})

    sendSessionDeclinedEmail({
      to: seekerUser.email,
      seekerName,
      guideName,
      scheduledAt: session.scheduledAt,
    }).catch(() => {})

    return { sessionId, status: 'CANCELLED' }
  },

  /**
   * Authorize + window-check a join, lazily create the Daily room, and mint a
   * per-user meeting token. Timing outcomes are returned in-band (200); only
   * hard authorization/status failures throw.
   */
  async joinSession(userId: string, sessionId: string): Promise<
    | { status: 'ok'; roomUrl: string; token: string; expiresAt: string; role: 'guide' | 'seeker' }
    | { status: 'too_early'; opensAt: string }
    | { status: 'expired' }
  > {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        seeker: { include: { user: true } },
        guide: { include: { user: true } },
        call: true,
      },
    })
    if (!session) throw new AppError('Session not found', 404)

    const seekerUserId = session.seeker.user.id
    const guideUserId = session.guide.user.id

    const result = evaluateJoinEligibility({
      session: {
        status: session.status,
        scheduledAt: session.scheduledAt,
        durationMinutes: session.durationMinutes,
        seekerUserId,
        guideUserId,
      },
      userId,
      now: new Date(),
    })

    if (!result.ok) {
      if (result.reason === 'not_participant') throw new AppError('You are not a participant in this session', 403)
      if (result.reason === 'not_confirmed') throw new AppError('This session is not confirmed', 409)
      if (result.reason === 'too_early') return { status: 'too_early', opensAt: result.opensAt!.toISOString() }
      return { status: 'expired' }
    }

    // Lazily create (or reuse) the room.
    const roomName = `session-${session.id}`
    let roomUrl = session.call?.dailyRoomUrl
    if (!session.call) {
      const room = await dailyService.createRoom({ name: roomName, expiresAt: result.window.closesAt })
      roomUrl = room.url
      await prisma.sessionCall.create({
        data: {
          sessionId: session.id,
          dailyRoomName: room.name,
          dailyRoomUrl: room.url,
          expiresAt: result.window.closesAt,
        },
      })
    }

    const isOwner = result.role === 'guide'
    const u = isOwner ? session.guide.user : session.seeker.user
    const userName = `${u.firstName} ${u.lastName}`.trim() || 'Participant'

    const token = await dailyService.createMeetingToken({
      roomName,
      userId,
      userName,
      isOwner,
      expiresAt: result.window.closesAt,
    })

    return {
      status: 'ok',
      roomUrl: roomUrl as string,
      token,
      expiresAt: result.window.closesAt.toISOString(),
      role: result.role,
    }
  },
}