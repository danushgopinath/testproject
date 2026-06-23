import { useMemo, useState, useEffect, useRef } from 'react'
import { Search, MoreVertical, ArrowLeft, Send, Trash2 } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { DashboardSidebar } from '../components/organisms/DashboardSidebar'
import { useAuthStore } from '../stores/authStore'
import { useConversations, useThread, useSendMessage, useDeleteMessage, useDeleteConversation } from '../hooks/useMessages'

function formatMessageTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  if (d.toDateString() === now.toDateString()) return `Today, ${time}`
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`
  return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${time}`
}

function formatConvTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  if (hours < 48) return 'Yesterday'
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function MessagesPage() {
  const [activeUserId, setActiveUserId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [draft, setDraft] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const withParam = searchParams.get('with')

  const { dashboardRole, user } = useAuthStore()
  const activeRole = (dashboardRole as 'SEEKER' | 'GUIDE') || ((user?.role as 'SEEKER' | 'GUIDE') ?? 'SEEKER')

  const { data: conversations = [], isLoading: convsLoading } = useConversations(activeRole)
  const { data: thread = [] } = useThread(activeUserId)
  const sendMessage = useSendMessage()
  const deleteMessage = useDeleteMessage()
  const deleteConversation = useDeleteConversation()

  const handleDeleteConversation = () => {
    if (!activeUserId) return
    if (!window.confirm('Delete this entire conversation? This cannot be undone.')) return
    deleteConversation.mutate(activeUserId, {
      onSuccess: () => {
        setShowMenu(false)
        setActiveUserId(null)
      },
    })
  }

  // Honour ?with=<userId> deep links from "Message" buttons elsewhere
  useEffect(() => {
    if (withParam) {
      setActiveUserId(withParam)
    }
  }, [withParam])

  useEffect(() => {
    if (!activeUserId && conversations.length > 0) {
      setActiveUserId(conversations[0].userId)
    }
  }, [conversations, activeUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  const filteredConversations = useMemo(() => {
    if (!search) return conversations
    const q = search.toLowerCase()
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q),
    )
  }, [conversations, search])

  const activeConversation = conversations.find((c) => c.userId === activeUserId) ?? null
  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0)

  function handleSend() {
    if (!draft.trim() || !activeUserId || sendMessage.isPending) return
    sendMessage.mutate({ receiverId: activeUserId, content: draft.trim() })
    setDraft('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex w-full">
      <DashboardSidebar />
      <div className="flex-1 overflow-x-hidden">
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
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Messages</h1>
              <p className="text-sm text-text-muted">Keep conversations with seekers and guides in one place.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)]">

            {/* Conversation list */}
            <div className="rounded-xl border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">Messages</h2>
                  <p className="text-xs text-text-muted">
                    {totalUnread > 0 ? `${totalUnread} unread` : 'All caught up'}
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

              <div className="max-h-[560px] overflow-y-auto">
                {convsLoading && (
                  <div className="px-4 py-6 text-center text-sm text-text-muted">Loading conversations…</div>
                )}
                {!convsLoading && filteredConversations.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-text-muted">
                    {search ? 'No results.' : 'No conversations yet.'}
                  </div>
                )}
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.userId}
                    onClick={() => setActiveUserId(conv.userId)}
                    className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left text-sm transition-colors ${
                      conv.userId === activeUserId ? 'bg-background' : 'bg-surface hover:bg-background/60'
                    }`}
                  >
                    <div className="relative mt-1 shrink-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {conv.initials}
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-semibold text-white">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium text-text-primary">{conv.name}</p>
                        <span className="shrink-0 text-xs text-text-muted">{formatConvTime(conv.lastMessageAt)}</span>
                      </div>
                      {conv.title && <p className="truncate text-xs text-text-muted">{conv.title}</p>}
                      <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">{conv.lastMessage}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat panel */}
            <div className="flex h-[600px] flex-col rounded-xl border border-border bg-surface">
              {!activeConversation ? (
                <div className="flex flex-1 items-center justify-center text-sm text-text-muted">
                  {convsLoading ? 'Loading…' : 'Select a conversation to start messaging.'}
                </div>
              ) : (
                <>
                  {/* Chat header */}
                  <div className="flex items-center justify-between border-b border-border px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {activeConversation.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{activeConversation.name}</p>
                        {activeConversation.title && (
                          <p className="text-xs text-text-muted">{activeConversation.title}</p>
                        )}
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
                          {activeConversation.guideProfileId && (
                            <>
                              <button
                                className="block w-full px-3 py-2 text-left text-text-primary hover:bg-background"
                                onClick={() => {
                                  setShowMenu(false)
                                  navigate(`/guides/${activeConversation.guideProfileId}`)
                                }}
                              >
                                View profile
                              </button>
                              <button
                                className="block w-full px-3 py-2 text-left text-text-primary hover:bg-background"
                                onClick={() => {
                                  setShowMenu(false)
                                  navigate(`/guides/${activeConversation.guideProfileId}/book`)
                                }}
                              >
                                Book session
                              </button>
                            </>
                          )}
                          <button
                            className="block w-full px-3 py-2 text-left text-red-600 hover:bg-red-50"
                            onClick={handleDeleteConversation}
                          >
                            Delete conversation
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 space-y-3 overflow-y-auto bg-background/60 px-5 py-4">
                    {thread.length === 0 && (
                      <p className="text-center text-sm text-text-muted">
                        No messages yet. Start the conversation below.
                      </p>
                    )}
                    {thread.map((msg) => (
                      <div key={msg.id} className={`group flex items-center gap-2 ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                        {msg.fromMe && (
                          <button
                            onClick={() => deleteMessage.mutate(msg.id)}
                            title="Delete message"
                            className="opacity-0 transition-opacity group-hover:opacity-100 text-text-muted hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                            msg.fromMe
                              ? 'rounded-br-sm bg-primary text-white'
                              : 'rounded-bl-sm border border-border bg-surface text-text-primary'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={`mt-1 text-[11px] ${msg.fromMe ? 'text-white/50' : 'text-text-muted'}`}>
                            {formatMessageTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t border-border bg-surface px-5 py-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message…"
                        maxLength={2000}
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!draft.trim() || sendMessage.isPending}
                        className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Send
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}