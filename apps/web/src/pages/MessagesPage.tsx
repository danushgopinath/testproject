import { useMemo, useState } from 'react'
import { Search, MoreVertical, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

interface Conversation {
  id: number
  name: string
  initials: string
  title: string
  preview: string
  time: string
  unread: number
}

interface Message {
  id: number
  fromMe: boolean
  text: string
  time: string
}

const CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    name: 'Sarah Chen',
    initials: 'SC',
    title: 'Product Manager @ Google',
    preview: 'Looking forward to our session today!',
    time: '2 min ago',
    unread: 2,
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    initials: 'MJ',
    title: 'Software Engineer @ Meta',
    preview: 'Great question about system design!',
    time: '1 hour ago',
    unread: 1,
  },
  {
    id: 3,
    name: 'Alex Kim',
    initials: 'AK',
    title: 'Stanford Admissions Mentor',
    preview: 'Thanks for booking! I saw your profile and think...',
    time: '3 hours ago',
    unread: 0,
  },
  {
    id: 4,
    name: 'Emily Rodriguez',
    initials: 'ER',
    title: 'Investment Banking Analyst @ Goldman Sachs',
    preview: 'Just sent over the interview prep guide we...',
    time: 'Yesterday',
    unread: 0,
  },
]

const GUIDE_IDS_BY_CONVERSATION: Record<number, string> = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
}

const MESSAGES_BY_CONVERSATION: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      fromMe: true,
      text: 'Hi Sarah! Looking forward to our session today. Could you share any specific topics you want to focus on?',
      time: 'Yesterday, 4:00 PM',
    },
    {
      id: 2,
      fromMe: false,
      text: "Thanks so much for taking the time! I'd love to talk about breaking into PM roles at FAANG.",
      time: 'Yesterday, 4:10 PM',
    },
  ],
  2: [
    {
      id: 1,
      fromMe: false,
      text: 'Great question about system design! Here are a few resources I recommend.',
      time: 'Yesterday, 5:30 PM',
    },
  ],
  3: [],
  4: [
    {
      id: 1,
      fromMe: false,
      text: 'Just sent over the interview prep guide we discussed. Let me know if you have any questions!',
      time: 'Yesterday, 5:30 PM',
    },
  ],
}

export function MessagesPage() {
  const [activeId, setActiveId] = useState<number>(1)
  const [search, setSearch] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const navigate = useNavigate()

  const filteredConversations = useMemo(
    () =>
      CONVERSATIONS.filter((c) => {
        const q = search.toLowerCase()
        if (!q) return true
        return (
          c.name.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.preview.toLowerCase().includes(q)
        )
      }),
    [search],
  )

  const activeConversation =
    CONVERSATIONS.find((c) => c.id === activeId) || CONVERSATIONS[0]
  const messages = MESSAGES_BY_CONVERSATION[activeConversation.id] || []

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/dashboard"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-text-muted transition-colors hover:bg-background hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Messages
          </h1>
          <p className="text-sm text-text-muted">
            Keep conversations with seekers and guides in one place.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)]">
        {/* Conversation list */}
        <div className="rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Messages</h2>
              <p className="text-xs text-text-muted">
                {CONVERSATIONS.filter((c) => c.unread > 0).length} unread
              </p>
            </div>
          </div>

          <div className="border-b border-border px-4 py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left text-sm transition-colors ${
                  conv.id === activeId ? 'bg-background' : 'bg-surface hover:bg-background/60'
                }`}
              >
                <div className="relative mt-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {conv.initials}
                  </div>
                  {conv.unread > 0 && (
                    <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-semibold text-white">
                      {conv.unread}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-text-primary">{conv.name}</p>
                    <span className="shrink-0 text-xs text-text-muted">{conv.time}</span>
                  </div>
                  <p className="truncate text-xs text-text-muted">{conv.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">{conv.preview}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Active conversation */}
        <div className="flex h-[600px] flex-col rounded-xl border border-border bg-surface">
          {/* Header with kebab menu */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {activeConversation.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {activeConversation.name}
                </p>
                <p className="text-xs text-text-muted">{activeConversation.title}</p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-background hover:text-text-primary"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-border bg-surface text-sm shadow-lg">
                  <button
                    className="block w-full px-3 py-2 text-left text-text-primary hover:bg-background"
                    onClick={() => {
                      const guideId = GUIDE_IDS_BY_CONVERSATION[activeConversation.id] || '1'
                      setShowMenu(false)
                      navigate(`/guides/${guideId}`)
                    }}
                  >
                    View profile
                  </button>
                  <button
                    className="block w-full px-3 py-2 text-left text-text-primary hover:bg-background"
                    onClick={() => {
                      const guideId = GUIDE_IDS_BY_CONVERSATION[activeConversation.id] || '1'
                      setShowMenu(false)
                      navigate(`/guides/${guideId}/book`)
                    }}
                  >
                    Book session
                  </button>
                  <button
                    className="block w-full px-3 py-2 text-left text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setShowMenu(false)
                      console.log('Block user')
                    }}
                  >
                    Block user
                  </button>
                  <button
                    className="block w-full px-3 py-2 text-left text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setShowMenu(false)
                      console.log('Delete conversation')
                    }}
                  >
                    Delete conversation
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-background/60 px-5 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    message.fromMe
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-surface text-text-primary rounded-bl-sm border border-border'
                  }`}
                >
                  <p>{message.text}</p>
                  <p
                    className={`mt-1 text-[11px] ${
                      message.fromMe ? 'text-primary/20' : 'text-text-muted'
                    }`}
                  >
                    {message.time}
                  </p>
                </div>
              </div>
            ))}

            {messages.length === 0 && (
              <p className="text-center text-sm text-text-muted">
                No messages yet. Start the conversation below.
              </p>
            )}
          </div>

          {/* Input (non-functional for now) */}
          <div className="border-t border-border bg-surface px-5 py-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

