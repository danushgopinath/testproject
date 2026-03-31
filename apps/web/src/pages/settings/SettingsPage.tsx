import { useState } from 'react'
import { Bell, Shield, CreditCard, Globe, Moon, Sun, Mail, Lock, User, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export function SettingsPage() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile Settings',
          description: 'Update your personal information and preferences',
          link: '/settings/profile',
        },
        {
          icon: Mail,
          label: 'Email & Notifications',
          description: 'Manage your email preferences',
          action: () => setEmailNotifications(!emailNotifications),
          toggle: emailNotifications,
        },
        {
          icon: Bell,
          label: 'Push Notifications',
          description: 'Control push notification settings',
          action: () => setPushNotifications(!pushNotifications),
          toggle: pushNotifications,
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          icon: Lock,
          label: 'Password',
          description: 'Change your password',
          link: '/settings/password',
        },
        {
          icon: Shield,
          label: 'Privacy Settings',
          description: 'Control who can see your profile',
          link: '/settings/privacy',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: darkMode ? Moon : Sun,
          label: 'Theme',
          description: darkMode ? 'Dark mode enabled' : 'Light mode enabled',
          action: () => setDarkMode(!darkMode),
          toggle: darkMode,
        },
        {
          icon: Globe,
          label: 'Language',
          description: 'English (US)',
          link: '/settings/language',
        },
      ],
    },
    {
      title: 'Billing',
      items: [
        {
          icon: CreditCard,
          label: 'Payment Methods',
          description: 'Manage your payment methods',
          link: '/settings/billing',
        },
      ],
    },
  ]

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Settings</h1>
        <p className="mt-2 text-sm text-text-muted">Manage your account settings and preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold text-text-primary">{section.title}</h2>
            <div className="space-y-4">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon
                const content = (
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-text-primary">{item.label}</h3>
                        <p className="mt-0.5 text-sm text-text-muted">{item.description}</p>
                      </div>
                    </div>
                    {item.toggle !== undefined ? (
                      <button
                        onClick={item.action}
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          item.toggle ? 'bg-primary' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                            item.toggle ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    ) : (
                      <span className="text-text-muted">→</span>
                    )}
                  </div>
                )

                if (item.link) {
                  return (
                    <Link
                      key={itemIndex}
                      to={item.link}
                      className="block rounded-lg border border-border bg-background p-4 transition-colors hover:bg-background/80"
                    >
                      {content}
                    </Link>
                  )
                }

                return (
                  <button
                    key={itemIndex}
                    onClick={item.action}
                    className="w-full rounded-lg border border-border bg-background p-4 text-left transition-colors hover:bg-background/80"
                  >
                    {content}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-red-900">Danger Zone</h2>
        <div className="rounded-lg border border-red-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-red-900">Logout</h3>
              <p className="mt-0.5 text-sm text-red-700">Sign out of your account</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
