import { Link, useLocation } from 'react-router-dom'
import { Calendar, MessageSquare, Bell, DollarSign, Users, TrendingUp, BarChart3, X } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { cloneElement } from 'react'

interface SidebarItem {
  label: string
  icon: React.ReactElement<{ style?: React.CSSProperties; className?: string }>
  path: string
  badge?: number
}

interface SidebarSection {
  title: string
  items: SidebarItem[]
}

export function DashboardSidebar({ onClose }: { onClose?: () => void } = {}) {
  const location = useLocation()
  const { dashboardRole, user } = useAuthStore()
  const activeRole = (dashboardRole as 'SEEKER' | 'GUIDE') || ((user?.role as 'SEEKER' | 'GUIDE') ?? 'SEEKER')

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }

  const seekerManageItems: SidebarItem[] = [
    {
      label: 'Sessions',
      icon: <Calendar className="h-5 w-5" />,
      path: '/sessions',
    },
    {
      label: 'Messages',
      icon: <MessageSquare className="h-5 w-5" />,
      path: '/messages',
      badge: 7,
    },
  ]

  const guideManageItems: SidebarItem[] = [
    {
      label: 'Sessions',
      icon: <Calendar className="h-5 w-5" />,
      path: '/sessions',
    },
    {
      label: 'Messages',
      icon: <MessageSquare className="h-5 w-5" />,
      path: '/messages',
      badge: 5,
    },
    {
      label: 'Requests',
      icon: <Bell className="h-5 w-5" />,
      path: '/dashboard/requests',
      badge: 3,
    },
  ]

  const seekerAnalyticsItems: SidebarItem[] = [
    {
      label: 'Spending Overview',
      icon: <DollarSign className="h-5 w-5" />,
      path: '/dashboard/analytics/spending',
    },
    {
      label: 'Mentors Connected',
      icon: <Users className="h-5 w-5" />,
      path: '/dashboard/analytics/mentors',
    },
    {
      label: 'Session History',
      icon: <BarChart3 className="h-5 w-5" />,
      path: '/dashboard/analytics/sessions',
    },
  ]

  const guideAnalyticsItems: SidebarItem[] = [
    {
      label: 'Earnings',
      icon: <DollarSign className="h-5 w-5" />,
      path: '/dashboard/analytics/earnings',
    },
    {
      label: 'Students Helped',
      icon: <Users className="h-5 w-5" />,
      path: '/dashboard/analytics/students',
    },
    {
      label: 'Performance',
      icon: <TrendingUp className="h-5 w-5" />,
      path: '/dashboard/analytics/performance',
    },
  ]

  const manageItems = activeRole === 'SEEKER' ? seekerManageItems : guideManageItems
  const analyticsItems = activeRole === 'SEEKER' ? seekerAnalyticsItems : guideAnalyticsItems

  const sections: SidebarSection[] = [
    { title: 'Manage', items: manageItems },
    { title: 'Analytics', items: analyticsItems },
  ]

  return (
    <aside className={`${onClose ? 'block' : 'hidden lg:block'} w-64 shrink-0 border-r border-border bg-surface`}>
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-6">
        {/* Close button — only shown when used in mobile drawer */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mb-4 flex items-center justify-end w-full text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {/* Dashboard Home Link */}
        {(() => {
          const dashboardActive = isActive('/dashboard') && location.pathname === '/dashboard'
          return (
            <Link
              to="/dashboard"
              className={`mb-6 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                dashboardActive
                  ? 'bg-primary'
                  : 'text-text-muted hover:bg-background hover:text-text-primary'
              }`}
              style={dashboardActive ? { color: 'white' } : undefined}
            >
              {cloneElement(<BarChart3 className="h-5 w-5" />, {
                style: dashboardActive ? { color: 'white' } : undefined,
              })}
              <span style={dashboardActive ? { color: 'white' } : undefined}>Overview</span>
            </Link>
          )
        })()}

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary'
                        : 'text-text-muted hover:bg-background hover:text-text-primary'
                    }`}
                    style={active ? { color: 'white' } : undefined}
                  >
                    <div className="flex items-center gap-3" style={active ? { color: 'white' } : undefined}>
                      {cloneElement(item.icon, {
                        style: active ? { color: 'white' } : undefined,
                      })}
                      <span style={active ? { color: 'white' } : undefined}>{item.label}</span>
                    </div>
                  {item.badge && item.badge > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  )
}
