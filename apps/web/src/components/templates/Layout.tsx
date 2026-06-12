import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { RoleSwitcher } from '../molecules/RoleSwitcher'
import { useState, useEffect, useRef } from 'react'
import { User, Settings, LogOut, Bell, MessageSquare, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useNotifications } from '../../hooks/useDashboard'
import { useNotificationsList, useMarkAllNotificationsRead, type NotificationItem, type NotificationType } from '../../hooks/useNotificationsList'

function relativeTime(iso: string): string {
  const now = Date.now()
  const t = new Date(iso).getTime()
  const diff = Math.max(0, now - t)
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function iconForType(type: NotificationType) {
  switch (type) {
    case 'SESSION_REQUEST':   return Calendar
    case 'SESSION_ACCEPTED':  return CheckCircle
    case 'SESSION_DECLINED':  return XCircle
    case 'SESSION_CANCELLED': return XCircle
    case 'SESSION_REMINDER':  return Clock
    case 'NEW_MESSAGE':       return MessageSquare
    case 'BOOKING_PLACED':    return Clock
    default:                  return Bell
  }
}

function NotificationsPanel({
  theme,
  items,
  unreadMessages,
  onItemClick,
  onMarkAll,
}: {
  theme: 'light' | 'dark'
  items: NotificationItem[]
  unreadMessages: number
  onItemClick: (link: string | null) => void
  onMarkAll: () => void
}) {
  const isDark = theme === 'dark'
  const containerClass = isDark
    ? 'absolute right-0 top-10 z-50 w-[22rem] max-h-[28rem] rounded-xl border border-white/10 bg-[#070738]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col'
    : 'absolute right-0 top-10 z-50 w-[22rem] max-h-[28rem] rounded-xl border border-[#070738]/10 bg-white shadow-xl overflow-hidden flex flex-col'
  const headerBorder = isDark ? 'border-white/8' : 'border-[#070738]/8'
  const titleColor = isDark ? 'text-white/50' : 'text-[#5B6B85]'
  const itemHover = isDark ? 'hover:bg-white/5' : 'hover:bg-[#f4f6fc]'
  const itemTextPrimary = isDark ? 'text-white' : 'text-[#070738]'
  const itemTextSecondary = isDark ? 'text-white/55' : 'text-[#5B6B85]'
  const itemTextMuted = isDark ? 'text-white/40' : 'text-[#070738]/40'
  const iconColor = isDark ? 'text-[#F5B400]' : 'text-[#070738]'
  const unreadDot = 'bg-[#F5B400]'
  const emptyText = isDark ? 'text-white/50' : 'text-[#5B6B85]'
  const dividerColor = isDark ? 'border-white/8' : 'border-[#070738]/8'

  const hasItems = items.length > 0 || unreadMessages > 0

  return (
    <div className={containerClass}>
      <div className={`flex items-center justify-between px-4 py-3 border-b ${headerBorder}`}>
        <p className={`text-xs font-semibold uppercase tracking-wider ${titleColor}`}>Notifications</p>
        {items.some((n) => !n.isRead) && (
          <button
            onClick={(e) => { e.stopPropagation(); onMarkAll() }}
            className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#F5B400] hover:opacity-80' : 'text-[#070738]/60 hover:text-[#070738]'}`}
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {unreadMessages > 0 && (
          <button
            onClick={() => onItemClick('/messages')}
            className={`flex w-full items-start gap-3 px-4 py-3 text-left ${itemHover} transition-colors border-b ${dividerColor}`}
          >
            <MessageSquare className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${itemTextPrimary}`}>
                {unreadMessages} unread message{unreadMessages !== 1 ? 's' : ''}
              </p>
              <p className={`text-xs ${itemTextSecondary}`}>Open Messages</p>
            </div>
          </button>
        )}

        {items.map((n) => {
          const Icon = iconForType(n.type)
          return (
            <button
              key={n.id}
              onClick={() => onItemClick(n.link)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left ${itemHover} transition-colors`}
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${itemTextPrimary} truncate`}>{n.title}</p>
                  {!n.isRead && <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${unreadDot}`} />}
                </div>
                <p className={`text-xs ${itemTextSecondary} line-clamp-2`}>{n.body}</p>
                <p className={`mt-0.5 text-[10px] ${itemTextMuted}`}>{relativeTime(n.createdAt)}</p>
              </div>
            </button>
          )
        })}

        {!hasItems && (
          <div className="px-4 py-6 text-center">
            <p className={`text-sm ${emptyText}`}>You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  )
}


// ── Landing pill nav link (unchanged) ─────────────────────────────────────────
function PillNavLink({ to, children, dark }: { to: string; children: React.ReactNode; dark: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive
          ? 'group relative inline-block overflow-hidden text-xs font-medium uppercase tracking-widest'
          : 'group relative inline-block overflow-hidden text-xs font-medium uppercase tracking-widest'
      }
    >
      {({ isActive: _ }) => (
        <span className="flex h-4 flex-col overflow-hidden">
          <span className="flex flex-col transition-transform duration-300 ease-out group-hover:-translate-y-1/2">
            <span className={`leading-4 ${dark ? 'text-white/75' : 'text-[#070738]/60'}`}>{children}</span>
            <span className={`leading-4 ${dark ? 'text-white' : 'text-[#070738]'}`}>{children}</span>
          </span>
        </span>
      )}
    </NavLink>
  )
}

// ── Non-landing simple nav link ────────────────────────────────────────────────
function SimpleNavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive
          ? 'text-[#070738] font-semibold text-sm'
          : 'text-[#5B6B85] font-medium text-sm hover:text-[#070738] transition-colors'
      }
    >
      {children}
    </NavLink>
  )
}

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, logout, dashboardRole, setDashboardRole } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  // "Dashboard context" — anywhere the dashboard sidebar is shown.
  // Role toggle should stay visible across all of these so users always
  // know whether they're acting as a seeker or guide.
  const isDashboard =
    location.pathname === '/dashboard' ||
    location.pathname.startsWith('/dashboard/') ||
    location.pathname === '/sessions' ||
    location.pathname === '/messages'
  const hideFooter = location.pathname === '/sessions' || location.pathname === '/messages'
  const darkNavPages = ['/', '/how-it-works', '/privacy-policy', '/terms-of-service', '/cookie-policy', '/guides', '/team', '/contact']
  const isLanding = darkNavPages.includes(location.pathname)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMobileNav, setShowMobileNav] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const shapeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [pillShape, setPillShape] = useState('rounded-2xl')

  const { data: notifs } = useNotifications()
  const unreadMessages = notifs?.unreadMessages ?? 0
  const unreadNotificationCount = notifs?.unreadNotificationCount ?? 0
  const totalNotifCount = unreadMessages + unreadNotificationCount
  const activeRole = (dashboardRole as 'SEEKER' | 'GUIDE') || ((user?.role as 'SEEKER' | 'GUIDE') ?? 'SEEKER')
  void activeRole

  const { data: notifList } = useNotificationsList(Boolean(user))
  const markAllRead = useMarkAllNotificationsRead()

  useEffect(() => {
    if (shapeTimeoutRef.current) clearTimeout(shapeTimeoutRef.current)
    if (showMobileNav) {
      setPillShape('rounded-2xl')
    } else {
      shapeTimeoutRef.current = setTimeout(() => setPillShape('rounded-2xl'), 300)
    }
    return () => { if (shapeTimeoutRef.current) clearTimeout(shapeTimeoutRef.current) }
  }, [showMobileNav])

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setShowUserMenu(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    if (showUserMenu || showNotifications) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu, showNotifications])

  const navLinks = [
    { label: 'About', to: '/about' },
    { label: 'Find Mentors', to: '/guides' },
    { label: 'Team', to: '/team' },
    { label: 'Contact', to: '/contact' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background text-text-primary">

      {/* ── LANDING: floating pill navbar (unchanged) ── */}
      {isLanding && (
        <header
          className={[
            'fixed top-5 left-1/2 -translate-x-1/2 z-50',
            'flex flex-col items-center',
            'px-6 py-4',
            'border border-white/10 bg-[#070738]/70 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
            'w-[calc(100%-2rem)] md:w-[75vw]',
            'transition-[border-radius,background,border-color,box-shadow] duration-300 ease-in-out',
            pillShape,
          ].join(' ')}
        >
          {/* Main row */}
          <div className="flex items-center justify-between w-full gap-x-6 min-[1100px]:gap-x-8">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="flex h-6 w-6 items-center justify-center rounded text-[11px] font-bold bg-[#F5B400] text-[#070738]">E</div>
              <span className="text-sm font-semibold tracking-wide uppercase text-white">Expertify</span>
            </Link>

            <nav className="hidden min-[1100px]:flex items-center gap-6">
              {navLinks.map(({ label, to }) => (
                <PillNavLink key={to} to={to} dark={true}>{label}</PillNavLink>
              ))}
            </nav>

            <div className="hidden min-[1100px]:flex items-center gap-2">
              {user ? (
                <>
                  {isDashboard && (
                    <RoleSwitcher
                      currentRole={(dashboardRole as 'SEEKER' | 'GUIDE') || ((user?.role as 'SEEKER' | 'GUIDE') ?? 'SEEKER')}
                      onRoleChange={setDashboardRole}
                    />
                  )}
                  <Link to="/dashboard" className="px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full transition-all text-[#0f172a] bg-gradient-to-br from-gray-100 to-gray-300 hover:from-white hover:to-gray-200">
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-2">
                    {/* Notifications bell */}
                    <div className="relative" ref={notificationsRef}>
                      <button
                        onClick={() => { setShowNotifications((v) => !v); setShowUserMenu(false) }}
                        style={{ color: 'rgba(255,255,255,0.8)' }}
                        className="relative flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:opacity-100"
                      >
                        <Bell className="h-4 w-4" />
                        {totalNotifCount > 0 && (
                          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#F5B400] text-[9px] font-bold text-[#070738]">
                            {totalNotifCount > 9 ? '9+' : totalNotifCount}
                          </span>
                        )}
                      </button>
                      {showNotifications && (
                        <NotificationsPanel
                          theme="dark"
                          items={notifList ?? []}
                          unreadMessages={unreadMessages}
                          onItemClick={(link) => {
                            setShowNotifications(false)
                            markAllRead.mutate()
                            if (link) navigate(link)
                          }}
                          onMarkAll={() => markAllRead.mutate()}
                        />
                      )}
                    </div>
                    {/* User menu */}
                    <div className="relative" ref={userMenuRef}>
                      <button onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false) }} className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#F5B400] text-[10px] font-bold text-[#070738] hover:opacity-90 transition-opacity">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="h-7 w-7 object-cover" />
                        ) : (
                          <>{user.firstName[0]}{user.lastName[0]}</>
                        )}
                      </button>
                      {showUserMenu && (
                        <div className="absolute right-0 top-10 z-50 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-[#070738]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                          <div className="p-4 border-b border-white/8">
                            <p className="font-medium text-sm" style={{ color: 'white' }}>{user.firstName} {user.lastName}</p>
                            <p className="mt-0.5 break-all text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{user.email}</p>
                          </div>
                          <div>
                            <Link to="/profile" onClick={() => setShowUserMenu(false)} style={{ color: 'white' }} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors"><User className="h-4 w-4" />Profile</Link>
                            <Link to="/settings" onClick={() => setShowUserMenu(false)} style={{ color: 'white' }} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors"><Settings className="h-4 w-4" />Settings</Link>
                          </div>
                          <div className="border-t border-white/8">
                            <button onClick={handleLogout} style={{ color: '#f87171' }} className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-red-500/10 transition-colors"><LogOut className="h-4 w-4" />Logout</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <Link to="/auth/login" className="px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full transition-all text-[#0f172a] bg-gradient-to-br from-gray-100 to-gray-300 hover:from-white hover:to-gray-200">
                  Sign In
                </Link>
              )}
            </div>

            <button
              type="button"
              className="min-[1100px]:hidden flex items-center justify-center w-8 h-8 focus:outline-none text-white/75"
              onClick={() => setShowMobileNav((o) => !o)}
              aria-label={showMobileNav ? 'Close menu' : 'Open menu'}
            >
              {showMobileNav
                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              }
            </button>
          </div>

          <div className={['min-[1100px]:hidden flex flex-col items-center w-full overflow-hidden transition-all ease-in-out duration-300', showMobileNav ? 'max-h-[32rem] opacity-100 pt-4' : 'max-h-0 opacity-0 pt-0 pointer-events-none'].join(' ')}>
            <nav className="flex flex-col items-center gap-1 w-full mb-3">
              {[...navLinks, ...(user ? [{ label: 'Dashboard', to: '/dashboard' }] : [])].map(({ label, to }) => (
                <NavLink key={to} to={to} onClick={() => setShowMobileNav(false)}
                  className="w-full text-center px-2 py-2.5 text-xs font-medium uppercase tracking-widest rounded-lg transition-colors hover:bg-white/10"
                  style={({ isActive }) => ({ color: isActive ? '#F5B400' : '#ffffff' })}
                >{label}</NavLink>
              ))}
            </nav>
            {user ? (
              <>
                {isDashboard && (
                  <div className="w-full mb-3 flex justify-center">
                    <RoleSwitcher
                      currentRole={(dashboardRole as 'SEEKER' | 'GUIDE') || ((user?.role as 'SEEKER' | 'GUIDE') ?? 'SEEKER')}
                      onRoleChange={(r) => { setDashboardRole(r); setShowMobileNav(false) }}
                    />
                  </div>
                )}
                <div className="w-full border-t border-white/10 pt-3 space-y-1">
                  <div className="px-2 pb-2">
                    <p className="text-xs font-semibold text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-[11px] text-white/50 break-all">{user.email}</p>
                  </div>
                  <Link to="/profile" onClick={() => setShowMobileNav(false)} style={{ color: '#ffffff' }} className="flex items-center gap-2 w-full px-2 py-2 text-xs hover:bg-white/10 rounded-lg transition-colors">
                    <User className="h-3.5 w-3.5" /> Profile
                  </Link>
                  <Link to="/settings" onClick={() => setShowMobileNav(false)} style={{ color: '#ffffff' }} className="flex items-center gap-2 w-full px-2 py-2 text-xs hover:bg-white/10 rounded-lg transition-colors">
                    <Settings className="h-3.5 w-3.5" /> Settings
                  </Link>
                  <button onClick={() => { handleLogout(); setShowMobileNav(false) }} className="flex items-center gap-2 w-full px-2 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg transition-colors">
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              </>
            ) : (
              <Link to="/auth/login" onClick={() => setShowMobileNav(false)} className="w-full text-center px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#0f172a] bg-gradient-to-br from-gray-100 to-gray-300 rounded-full hover:from-white hover:to-gray-200 transition-all">
                Sign In
              </Link>
            )}
          </div>
        </header>
      )}

      {/* ── NON-LANDING: full-width edge-to-edge navbar ── */}
      {!isLanding && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#070738]/8">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 md:px-12 py-4 flex items-center justify-between gap-x-8">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-[#070738] text-xs font-bold text-[#F5B400]">E</div>
              <span className="text-sm font-semibold tracking-wide text-[#070738]">Expertify</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden min-[1100px]:flex items-center gap-8">
              {navLinks.map(({ label, to }) => (
                <SimpleNavLink key={to} to={to}>{label}</SimpleNavLink>
              ))}
            </nav>

            {/* Right side */}
            <div className="hidden min-[1100px]:flex items-center gap-3">
              {user ? (
                <>
                  {isDashboard && (
                    <RoleSwitcher
                      currentRole={(dashboardRole as 'SEEKER' | 'GUIDE') || ((user?.role as 'SEEKER' | 'GUIDE') ?? 'SEEKER')}
                      onRoleChange={setDashboardRole}
                    />
                  )}
                  <Link to="/dashboard" className="px-3 py-1.5 text-xs font-medium border border-[#070738]/20 rounded-full text-[#070738]/70 hover:border-[#070738]/50 hover:text-[#070738] transition-colors">
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-2">
                    {/* Notifications bell */}
                    <div className="relative" ref={notificationsRef}>
                      <button
                        onClick={() => { setShowNotifications((v) => !v); setShowUserMenu(false) }}
                        className="relative flex h-7 w-7 items-center justify-center rounded-full transition-colors text-[#070738]/50 hover:text-[#070738]"
                      >
                        <Bell className="h-4 w-4" />
                        {totalNotifCount > 0 && (
                          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#F5B400] text-[9px] font-bold text-[#070738]">
                            {totalNotifCount > 9 ? '9+' : totalNotifCount}
                          </span>
                        )}
                      </button>
                      {showNotifications && (
                        <NotificationsPanel
                          theme="light"
                          items={notifList ?? []}
                          unreadMessages={unreadMessages}
                          onItemClick={(link) => {
                            setShowNotifications(false)
                            markAllRead.mutate()
                            if (link) navigate(link)
                          }}
                          onMarkAll={() => markAllRead.mutate()}
                        />
                      )}
                    </div>
                    {/* User menu */}
                    <div className="relative" ref={userMenuRef}>
                      <button onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false) }} className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#F5B400] text-[10px] font-bold text-[#070738] hover:opacity-90 transition-opacity">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="h-7 w-7 object-cover" />
                        ) : (
                          <>{user.firstName[0]}{user.lastName[0]}</>
                        )}
                      </button>
                      {showUserMenu && (
                        <div className="absolute right-0 top-10 z-50 w-64 rounded-xl border border-[#070738]/10 bg-white shadow-xl overflow-hidden">
                          <div className="p-4 border-b border-[#070738]/8">
                            <p className="font-medium text-[#070738] text-sm">{user.firstName} {user.lastName}</p>
                            <p className="mt-0.5 break-all text-xs text-[#5B6B85]">{user.email}</p>
                          </div>
                          <div>
                            <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-[#5B6B85] hover:text-[#070738] hover:bg-[#f4f6fc] transition-colors"><User className="h-4 w-4" />Profile</Link>
                            <Link to="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-[#5B6B85] hover:text-[#070738] hover:bg-[#f4f6fc] transition-colors"><Settings className="h-4 w-4" />Settings</Link>
                          </div>
                          <div className="border-t border-[#070738]/8">
                            <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"><LogOut className="h-4 w-4" />Logout</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <Link to="/auth/login" className="text-sm font-semibold text-[#070738] hover:text-[#070738] transition-colors">
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="min-[1100px]:hidden flex items-center justify-center w-8 h-8 focus:outline-none text-[#070738]/60"
              onClick={() => setShowMobileNav((o) => !o)}
              aria-label={showMobileNav ? 'Close menu' : 'Open menu'}
            >
              {showMobileNav
                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              }
            </button>
          </div>

          {/* Mobile dropdown */}
          <div className={['min-[1100px]:hidden overflow-hidden transition-all ease-in-out duration-300 border-t border-[#070738]/8 bg-white', showMobileNav ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'].join(' ')}>
            <nav className="flex flex-col px-6 pt-3 pb-1 gap-1">
              {[...navLinks, ...(user ? [{ label: 'Dashboard', to: '/dashboard' }] : [])].map(({ label, to }) => (
                <NavLink key={to} to={to} onClick={() => setShowMobileNav(false)}
                  className={({ isActive }) => ['px-2 py-2.5 text-sm font-medium rounded-lg transition-colors', isActive ? 'text-[#070738] font-semibold' : 'text-[#5B6B85] hover:text-[#070738] hover:bg-[#f4f6fc]'].join(' ')}
                >{label}</NavLink>
              ))}
            </nav>
            {user ? (
              <div className="px-6 pb-4 border-t border-[#070738]/8 pt-3 space-y-1">
                {isDashboard && (
                  <div className="mb-3 flex">
                    <RoleSwitcher
                      currentRole={(dashboardRole as 'SEEKER' | 'GUIDE') || ((user?.role as 'SEEKER' | 'GUIDE') ?? 'SEEKER')}
                      onRoleChange={(r) => { setDashboardRole(r); setShowMobileNav(false) }}
                    />
                  </div>
                )}
                <div className="px-2 pb-2">
                  <p className="text-sm font-semibold text-[#070738]">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-[#5B6B85] break-all">{user.email}</p>
                </div>
                <Link to="/profile" onClick={() => setShowMobileNav(false)} className="flex items-center gap-2 px-2 py-2.5 text-sm text-[#5B6B85] hover:text-[#070738] hover:bg-[#f4f6fc] rounded-lg transition-colors">
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link to="/settings" onClick={() => setShowMobileNav(false)} className="flex items-center gap-2 px-2 py-2.5 text-sm text-[#5B6B85] hover:text-[#070738] hover:bg-[#f4f6fc] rounded-lg transition-colors">
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <button onClick={() => { handleLogout(); setShowMobileNav(false) }} className="flex items-center gap-2 w-full px-2 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="px-6 pb-4">
                <Link to="/auth/login" onClick={() => setShowMobileNav(false)} className="block px-2 py-2.5 text-sm font-semibold text-[#070738]">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </header>
      )}

      <main className={['flex-1', isLanding ? '' : 'pt-[61px]'].join(' ')}>
        {children}
      </main>

      {!hideFooter && (
        <footer className="bg-white border-t border-[#070738]/10">
          <div className="mx-auto max-w-6xl px-6 md:px-10 py-16 md:py-20">

            <div className="grid grid-cols-1 gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
              <div className="space-y-5">
                <Link to="/" className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-[#070738] text-sm font-bold text-[#F5B400]">E</div>
                  <span className="text-sm font-semibold tracking-wide uppercase text-[#070738]">Expertify</span>
                </Link>
                <p className="text-sm leading-relaxed text-[#5B6B85] max-w-xs">
                  One conversation with the right person beats a hundred articles. Connect with guides who've been there.
                </p>
                <Link to="/guides" className="inline-flex items-center gap-2 text-sm font-semibold text-[#070738] border-b border-[#070738] pb-px hover:gap-3 transition-all">
                  Find a Guide
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#070738]">Platform</p>
                <ul className="space-y-3">
                  {[{ label: 'Find Mentors', to: '/guides' }, { label: 'About', to: '/about' }, { label: 'How It Works', to: '/how-it-works' }].map(({ label, to }) => (
                    <li key={label}><Link to={to} className="text-sm text-[#5B6B85] hover:text-[#070738] transition-colors">{label}</Link></li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#070738]">Company</p>
                <ul className="space-y-3">
                  {[{ label: 'About Us', to: '/about' }, { label: 'Team', to: '/team' }, { label: 'Contact', to: '/contact' }].map(({ label, to }) => (
                    <li key={label}><Link to={to} className="text-sm text-[#5B6B85] hover:text-[#070738] transition-colors">{label}</Link></li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#070738]">Legal</p>
                <ul className="space-y-3">
                  {[
                    { label: 'Privacy Policy', to: '/privacy-policy' },
                    { label: 'Terms of Service', to: '/terms-of-service' },
                    { label: 'Cookie Policy', to: '/cookie-policy' },
                  ].map(({ label, to }) => (
                    <li key={label}><Link to={to} className="text-sm text-[#5B6B85] hover:text-[#070738] transition-colors">{label}</Link></li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-14 pt-8 border-t border-[#070738]/10 flex flex-col md:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#5B6B85]">© {new Date().getFullYear()} Expertify. All rights reserved.</span>
              <span className="text-xs text-[#5B6B85] uppercase tracking-widest">Peer Guidance Marketplace</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
