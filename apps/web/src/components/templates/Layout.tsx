import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { RoleSwitcher } from '../molecules/RoleSwitcher'
import { useState, useEffect, useRef } from 'react'
import { User, Settings, LogOut, Bell } from 'lucide-react'


// ── Landing pill nav link (unchanged) ─────────────────────────────────────────
function PillNavLink({ to, children, dark }: { to: string; children: React.ReactNode; dark: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive
          ? `text-[#F5B400] text-xs font-medium uppercase tracking-widest`
          : 'group relative inline-block overflow-hidden text-xs font-medium uppercase tracking-widest'
      }
    >
      {({ isActive }) =>
        isActive ? (
          <span>{children}</span>
        ) : (
          <span className="flex h-4 flex-col overflow-hidden">
            <span className="flex flex-col transition-transform duration-300 ease-out group-hover:-translate-y-1/2">
              <span className={`leading-4 ${dark ? 'text-white/75' : 'text-[#070738]/60'}`}>{children}</span>
              <span className={`leading-4 ${dark ? 'text-white' : 'text-[#070738]'}`}>{children}</span>
            </span>
          </span>
        )
      }
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
  const isDashboard = location.pathname === '/dashboard'
  const hideFooter = location.pathname === '/sessions' || location.pathname === '/messages'
  const isLanding = location.pathname === '/'
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileNav, setShowMobileNav] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const shapeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [pillShape, setPillShape] = useState('rounded-2xl')

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
    }
    if (showUserMenu) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

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
            'w-[calc(100%-2rem)] sm:w-[70vw]',
            'transition-[border-radius,background,border-color,box-shadow] duration-300 ease-in-out',
            pillShape,
          ].join(' ')}
        >
          {/* Main row */}
          <div className="flex items-center justify-between w-full gap-x-6 sm:gap-x-8">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="flex h-6 w-6 items-center justify-center rounded text-[11px] font-bold bg-[#F5B400] text-[#070738]">E</div>
              <span className="text-sm font-semibold tracking-wide uppercase text-white">Expertify</span>
            </Link>

            <nav className="hidden sm:flex items-center gap-6">
              {navLinks.map(({ label, to }) => (
                <PillNavLink key={to} to={to} dark={true}>{label}</PillNavLink>
              ))}
            </nav>

            <div className="hidden sm:flex items-center gap-2">
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
                  <div className="relative flex items-center gap-2" ref={userMenuRef}>
                    <Link to="/messages" style={{ color: 'rgba(255,255,255,0.8)' }} className="relative flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:opacity-100">
                      <Bell className="h-4 w-4" />
                      <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#F5B400] text-[9px] font-bold text-[#070738]">3</span>
                    </Link>
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5B400] text-[10px] font-bold text-[#070738] hover:opacity-90 transition-opacity">
                      {user.firstName[0]}{user.lastName[0]}
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
                </>
              ) : (
                <Link to="/auth/login" className="px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full transition-all text-[#0f172a] bg-gradient-to-br from-gray-100 to-gray-300 hover:from-white hover:to-gray-200">
                  Sign In
                </Link>
              )}
            </div>

            <button
              type="button"
              className="sm:hidden flex items-center justify-center w-8 h-8 focus:outline-none text-white/75"
              onClick={() => setShowMobileNav((o) => !o)}
              aria-label={showMobileNav ? 'Close menu' : 'Open menu'}
            >
              {showMobileNav
                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              }
            </button>
          </div>

          <div className={['sm:hidden flex flex-col items-center w-full overflow-hidden transition-all ease-in-out duration-300', showMobileNav ? 'max-h-[32rem] opacity-100 pt-4' : 'max-h-0 opacity-0 pt-0 pointer-events-none'].join(' ')}>
            <nav className="flex flex-col items-center gap-1 w-full mb-3">
              {[...navLinks, ...(user ? [{ label: 'Dashboard', to: '/dashboard' }] : [])].map(({ label, to }) => (
                <NavLink key={to} to={to} onClick={() => setShowMobileNav(false)}
                  className={({ isActive }) => ['w-full text-center px-2 py-2.5 text-xs font-medium uppercase tracking-widest rounded-lg transition-colors', isActive ? 'text-[#F5B400]' : 'text-white hover:bg-white/10'].join(' ')}
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
                  <Link to="/profile" onClick={() => setShowMobileNav(false)} className="flex items-center gap-2 w-full px-2 py-2 text-xs text-white hover:bg-white/10 rounded-lg transition-colors">
                    <User className="h-3.5 w-3.5" /> Profile
                  </Link>
                  <Link to="/settings" onClick={() => setShowMobileNav(false)} className="flex items-center gap-2 w-full px-2 py-2 text-xs text-white hover:bg-white/10 rounded-lg transition-colors">
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
            <nav className="hidden sm:flex items-center gap-8">
              {navLinks.map(({ label, to }) => (
                <SimpleNavLink key={to} to={to}>{label}</SimpleNavLink>
              ))}
            </nav>

            {/* Right side */}
            <div className="hidden sm:flex items-center gap-3">
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
                  <div className="relative flex items-center gap-2" ref={userMenuRef}>
                    <Link to="/messages" className="relative flex h-7 w-7 items-center justify-center rounded-full transition-colors text-[#070738]/50 hover:text-[#070738]">
                      <Bell className="h-4 w-4" />
                      <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#F5B400] text-[9px] font-bold text-[#070738]">3</span>
                    </Link>
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5B400] text-[10px] font-bold text-[#070738] hover:opacity-90 transition-opacity">
                      {user.firstName[0]}{user.lastName[0]}
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
              className="sm:hidden flex items-center justify-center w-8 h-8 focus:outline-none text-[#070738]/60"
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
          <div className={['sm:hidden overflow-hidden transition-all ease-in-out duration-300 border-t border-[#070738]/8 bg-white', showMobileNav ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'].join(' ')}>
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
                  {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((label) => (
                    <li key={label}><button className="text-sm text-[#5B6B85] hover:text-[#070738] transition-colors">{label}</button></li>
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
