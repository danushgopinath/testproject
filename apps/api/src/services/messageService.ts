import { prisma } from '../config/prisma'
import { notificationService } from './notificationService'

function initials(first: string | null | undefined, last: string | null | undefined) {
  const a = (first?.trim()?.[0] ?? '').toUpperCase()
  const b = (last?.trim()?.[0] ?? '').toUpperCase()
  return (a + b) || 'U'
}

export const messageService = {
  /**
   * Conversation list = union of:
   *   1. All users this user has exchanged messages with
   *   2. All users this user has a PENDING/CONFIRMED/COMPLETED session with
   *
   * Users that have a session but no messages yet show with empty lastMessage
   * (the UI renders a "Start a conversation" empty state for these).
   */
  async getConversations(userId: string) {
    const seekerProfile = await prisma.seekerProfile.findUnique({
      where: { userId },
      select: { id: true },
    })
    const guideProfile = await prisma.guideProfile.findUnique({
      where: { userId },
      select: { id: true },
    })

    // Step 1 — fetch all sessions where this user is either seeker OR guide
    const sessionOr: { seekerId?: string; guideId?: string }[] = []
    if (seekerProfile) sessionOr.push({ seekerId: seekerProfile.id })
    if (guideProfile) sessionOr.push({ guideId: guideProfile.id })

    const sessions = sessionOr.length === 0
      ? []
      : await prisma.session.findMany({
          where: {
            OR: sessionOr as any,
            status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] },
          },
          include: {
            seeker: { include: { user: true } },
            guide: { include: { user: true } },
          },
        })

    const otherUsersFromSessions = new Map<string, {
      firstName: string
      lastName: string
      currentRole?: string | null
      currentCompany?: string | null
      headline?: string | null
      guideProfileId?: string | null
    }>()
    for (const s of sessions) {
      const isSeeker = s.seeker.userId === userId
      const otherUserId = isSeeker ? s.guide.userId : s.seeker.userId
      if (otherUserId === userId) continue // skip self
      if (otherUsersFromSessions.has(otherUserId)) continue
      const otherUser = isSeeker ? s.guide.user : s.seeker.user
      otherUsersFromSessions.set(otherUserId, {
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
        currentRole: isSeeker ? s.guide.currentRole : null,
        currentCompany: isSeeker ? s.guide.currentCompany : null,
        headline: isSeeker ? s.guide.headline : null,
        guideProfileId: isSeeker ? s.guide.id : null,
      })
    }

    // Step 2 — fetch all messages
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: 'desc' },
      include: { sender: true, receiver: true },
    })

    const convMap = new Map<string, {
      otherUserId: string
      firstName: string
      lastName: string
      lastMessage: string
      lastMessageAt: string | null
      unreadCount: number
    }>()

    for (const msg of messages) {
      const isFromMe = msg.senderId === userId
      const otherId = isFromMe ? msg.receiverId : msg.senderId
      const otherUser = isFromMe ? msg.receiver : msg.sender

      if (!convMap.has(otherId)) {
        convMap.set(otherId, {
          otherUserId: otherId,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt.toISOString(),
          unreadCount: 0,
        })
      }
      if (!isFromMe && !msg.isRead) {
        convMap.get(otherId)!.unreadCount++
      }
    }

    // Step 3 — add session-only entries (no messages exchanged yet)
    for (const [otherUserId, info] of otherUsersFromSessions) {
      if (!convMap.has(otherUserId)) {
        convMap.set(otherUserId, {
          otherUserId,
          firstName: info.firstName,
          lastName: info.lastName,
          lastMessage: '',
          lastMessageAt: null,
          unreadCount: 0,
        })
      }
    }

    if (convMap.size === 0) return []

    // Step 4 — enrich with guide profile info
    const otherIds = Array.from(convMap.keys())
    const guideProfiles = await prisma.guideProfile.findMany({
      where: { userId: { in: otherIds } },
      select: { id: true, userId: true, currentRole: true, currentCompany: true, headline: true },
    })
    const guideMap = new Map(guideProfiles.map((g) => [g.userId, g]))

    return Array.from(convMap.values())
      .sort((a, b) => {
        // newest message first; conversations without messages go last
        if (a.lastMessageAt && b.lastMessageAt) {
          return b.lastMessageAt.localeCompare(a.lastMessageAt)
        }
        if (a.lastMessageAt) return -1
        if (b.lastMessageAt) return 1
        return 0
      })
      .map(({ otherUserId, firstName, lastName, lastMessage, lastMessageAt, unreadCount }) => {
        const guide = guideMap.get(otherUserId)
        const title = guide
          ? guide.currentRole
            ? `${guide.currentRole}${guide.currentCompany ? ` @ ${guide.currentCompany}` : ''}`
            : (guide.headline ?? '')
          : ''
        return {
          userId: otherUserId,
          name: `${firstName} ${lastName}`.trim() || 'Unknown',
          initials: initials(firstName, lastName),
          title,
          guideProfileId: guide?.id ?? null,
          lastMessage,
          lastMessageAt: lastMessageAt ?? '',
          unreadCount,
        }
      })
  },

  async getThread(userId: string, otherId: string) {
    const [messages] = await Promise.all([
      prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherId },
            { senderId: otherId, receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.message.updateMany({
        where: { senderId: otherId, receiverId: userId, isRead: false },
        data: { isRead: true },
      }),
    ])

    return messages.map((m) => ({
      id: m.id,
      fromMe: m.senderId === userId,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    }))
  },

  async sendMessage(senderId: string, receiverId: string, content: string) {
    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: senderId }, select: { id: true, firstName: true, lastName: true } }),
      prisma.user.findUnique({ where: { id: receiverId }, select: { id: true } }),
    ])
    if (!sender) throw new Error('Sender not found')
    if (!receiver) throw new Error('Recipient not found')

    // Verify a session relationship exists between the two users
    const [senderSeeker, senderGuide, receiverSeeker, receiverGuide] = await Promise.all([
      prisma.seekerProfile.findUnique({ where: { userId: senderId }, select: { id: true } }),
      prisma.guideProfile.findUnique({ where: { userId: senderId }, select: { id: true } }),
      prisma.seekerProfile.findUnique({ where: { userId: receiverId }, select: { id: true } }),
      prisma.guideProfile.findUnique({ where: { userId: receiverId }, select: { id: true } }),
    ])

    const orClauses: { seekerId: string; guideId: string }[] = []
    if (senderSeeker && receiverGuide) orClauses.push({ seekerId: senderSeeker.id, guideId: receiverGuide.id })
    if (senderGuide && receiverSeeker) orClauses.push({ seekerId: receiverSeeker.id, guideId: senderGuide.id })

    if (orClauses.length === 0) throw new Error('You can only message users you have a session with')

    const session = await prisma.session.findFirst({
      where: {
        OR: orClauses,
        status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] },
      },
      select: { id: true },
    })
    if (!session) throw new Error('You can only message users you have a session with')

    const message = await prisma.message.create({
      data: { senderId, receiverId, content, sessionId: session.id },
    })

    // Notify the recipient
    const senderName = `${sender.firstName} ${sender.lastName}`.trim()
    notificationService.create({
      userId: receiverId,
      type: 'NEW_MESSAGE',
      title: `New message from ${senderName}`,
      body: content.length > 80 ? content.slice(0, 80) + '…' : content,
      link: '/messages',
    }).catch(() => {})

    return {
      id: message.id,
      fromMe: true,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    }
  },
}