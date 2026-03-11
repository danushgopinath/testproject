import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { RoleSwitcher } from '../molecules/RoleSwitcher'
import { useState, useEffect, useRef } from 'react'
import { User, Settings, LogOut, Bell } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, logout, dashboardRole, setDashboardRole } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const isDashboard = location.pathname === '/dashboard'
  const hideFooter = location.pathname === '/sessions' || location.pathname === '/messages'
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setShowUserMenu(false)
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  return (
    <div className="flex min-h-screen flex-col bg-background text-text-primary">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
              E
            </div>
            <span className="text-lg font-semibold tracking-tight text-text-primary">
              Expertify
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-text-muted md:flex">
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive
                  ? 'text-text-primary font-semibold'
                  : 'hover:text-text-primary transition-colors'
              }
            >
              About
            </NavLink>
            <NavLink
              to="/guides"
              className={({ isActive }) =>
                isActive
                  ? 'text-text-primary font-semibold'
                  : 'hover:text-text-primary transition-colors'
              }
            >
              Find Mentors
            </NavLink>
            <NavLink
              to="/team"
              className={({ isActive }) =>
                isActive
                  ? 'text-text-primary font-semibold'
                  : 'hover:text-text-primary transition-colors'
              }
            >
              Team
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive
                  ? 'text-text-primary font-semibold'
                  : 'hover:text-text-primary transition-colors'
              }
            >
              Contact
            </NavLink>
            <NavLink
              to="/career"
              className={({ isActive }) =>
                isActive
                  ? 'text-text-primary font-semibold'
                  : 'hover:text-text-primary transition-colors'
              }
            >
              Career
            </NavLink>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                {isDashboard && (
                  <RoleSwitcher
                    currentRole={
                      (dashboardRole as 'SEEKER' | 'GUIDE') ||
                      ((user?.role as 'SEEKER' | 'GUIDE') ?? 'SEEKER')
                    }
                    onRoleChange={setDashboardRole}
                  />
                )}
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <div className="relative flex items-center gap-3" ref={userMenuRef}>
                  <Link
                    to="/messages"
                    className="relative flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:text-text-primary"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-xs font-semibold text-white">
                      3
                    </span>
                  </Link>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    {user.firstName[0]}{user.lastName[0]}
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 top-10 z-50 w-72 rounded-lg border border-border bg-surface shadow-lg">
                      <div className="p-4">
                        <p className="font-medium text-text-primary">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="mt-0.5 break-all text-xs text-text-muted">{user.email}</p>
                      </div>
                      <div className="border-t border-border">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-text-primary transition-colors hover:bg-background"
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-text-primary transition-colors hover:bg-background"
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                      </div>
                      <div className="border-t border-border">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition-colors hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/auth/login"
                className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      {!hideFooter && (
        <footer className="border-t border-border bg-surface py-12 text-text-muted">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            {/* Brand column */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
                  E
                </div>
                <span className="text-lg font-semibold tracking-tight text-text-primary">
                  Expertify
                </span>
              </Link>
              <p className="text-sm leading-relaxed">
                Connecting students with expert mentors for academic and career success.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                Available worldwide
              </div>
            </div>

            {/* Platform column */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-text-primary">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/guides" className="hover:text-text-primary transition-colors">Find Mentors</Link></li>
                <li><Link to="/about" className="hover:text-text-primary transition-colors">About</Link></li>
                <li><button className="hover:text-text-primary transition-colors">Pricing</button></li>
              </ul>
            </div>

            {/* Support column */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-text-primary">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><button className="hover:text-text-primary transition-colors">Help Center</button></li>
                <li><button className="hover:text-text-primary transition-colors">Contact Us</button></li>
                <li><button className="hover:text-text-primary transition-colors">Safety</button></li>
                <li><button className="hover:text-text-primary transition-colors">Community</button></li>
              </ul>
            </div>

            {/* Company column */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-text-primary">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/about" className="hover:text-text-primary transition-colors">About</Link></li>
                <li><button className="hover:text-text-primary transition-colors">Careers</button></li>
                <li><button className="hover:text-text-primary transition-colors">Privacy</button></li>
                <li><button className="hover:text-text-primary transition-colors">Terms</button></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs md:flex-row">
            <span>© {new Date().getFullYear()} Expertify. All rights reserved.</span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Trusted Platform
            </span>
          </div>
        </div>
      </footer>
      )}
    </div>
  )
}
