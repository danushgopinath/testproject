import { prisma } from '../config/prisma'
import { notificationService } from './notificationService'

function initials(first: string | null | undefined, last: string | null | undefined) {
  const a = (first?.trim()?.[0] ?? '').toUpperCase()
  const b = (last?.trim()?.[0] ?? '').toUpperCase()
  return (a + b) || 'U'
}

export const messageService = {
  /**
   * Role-scoped conversation list. Messaging mirrors the session relationship:
   *   - SEEKER role: only the guides you have a session with (you're the seeker)
   *   - GUIDE role:  only the seekers who have a session with you (you're the guide)
   *
   * Partners with a session but no messages yet show with empty lastMessage
   * (the UI renders a "Start a conversation" empty state for these).
   */
  async getConversations(userId: string, role: 'SEEKER' | 'GUIDE') {
    const profile = role === 'SEEKER'
      ? await prisma.seekerProfile.findUnique({ where: { userId }, select: { id: true } })
      : await prisma.guideProfile.findUnique({ where: { userId }, select: { id: true } })
    if (!profile) return []

    // Sessions in this role direction define who can be messaged.
    const sessions = await prisma.session.findMany({
      where: {
        ...(role === 'SEEKER' ? { seekerId: profile.id } : { guideId: profile.id }),
        status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] },
      },
      include: {
        seeker: { include: { user: true } },
        guide: { include: { user: true } },
      },
    })

    const partners = new Map<string, {
      firstName: string
      lastName: string
      title: string
      guideProfileId: string | null
    }>()
    for (const s of sessions) {
      const otherUser = role === 'SEEKER' ? s.guide.user : s.seeker.user
      if (otherUser.id === userId || partners.has(otherUser.id)) continue
      const title = role === 'SEEKER'
        ? s.guide.currentRole
          ? `${s.guide.currentRole}${s.guide.currentCompany ? ` @ ${s.guide.currentCompany}` : ''}`
          : (s.guide.headline ?? '')
        : 'Seeker'
      partners.set(otherUser.id, {
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
        title,
        guideProfileId: role === 'SEEKER' ? s.guide.id : null,
      })
    }

    if (partners.size === 0) return []
    const allowedIds = new Set(partners.keys())

    // Last message + unread count per allowed partner only.
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: 'desc' },
    })

    const convMap = new Map<string, { lastMessage: string; lastMessageAt: string; unreadCount: number }>()
    for (const msg of messages) {
      const isFromMe = msg.senderId === userId
      const otherId = isFromMe ? msg.receiverId : msg.senderId
      if (!allowedIds.has(otherId)) continue
      if (!convMap.has(otherId)) {
        convMap.set(otherId, { lastMessage: msg.content, lastMessageAt: msg.createdAt.toISOString(), unreadCount: 0 })
      }
      if (!isFromMe && !msg.isRead) convMap.get(otherId)!.unreadCount++
    }

    return Array.from(partners.entries())
      .map(([otherUserId, info]) => {
        const conv = convMap.get(otherUserId)
        return {
          userId: otherUserId,
          name: `${info.firstName} ${info.lastName}`.trim() || 'Unknown',
          initials: initials(info.firstName, info.lastName),
          title: info.title,
          guideProfileId: info.guideProfileId,
          lastMessage: conv?.lastMessage ?? '',
          lastMessageAt: conv?.lastMessageAt ?? '',
          unreadCount: conv?.unreadCount ?? 0,
        }
      })
      .sort((a, b) => {
        // newest message first; conversations without messages go last
        if (a.lastMessageAt && b.lastMessageAt) return b.lastMessageAt.localeCompare(a.lastMessageAt)
        if (a.lastMessageAt) return -1
        if (b.lastMessageAt) return 1
        return 0
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