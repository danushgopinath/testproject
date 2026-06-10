import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUserSettings, useUpdateNotifications } from '../../hooks/useSettings'
import { CheckCircle2, ChevronLeft } from 'lucide-react'

interface NotifPrefs {
  notifySessionRequests: boolean
  notifySessionConfirmed: boolean
  notifySessionReminders: boolean
  notifyNewMessages: boolean
  notifyMarketing: boolean
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-border'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export function NotificationsSettingsPage() {
  const { data: settings, isLoading } = useUserSettings()
  const updateNotifications = useUpdateNotifications()
  const [prefs, setPrefs] = useState<NotifPrefs | null>(null)
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (settings && !prefs) {
      setPrefs({
        notifySessionRequests: settings.notifySessionRequests,
        notifySessionConfirmed: settings.notifySessionConfirmed,
        notifySessionReminders: settings.notifySessionReminders,
        notifyNewMessages: settings.notifyNewMessages,
        notifyMarketing: settings.notifyMarketing,
      })
    }
  }, [settings, prefs])

  const handleToggle = (key: keyof NotifPrefs, value: boolean) => {
    setPrefs((prev) => (prev ? { ...prev, [key]: value } : prev))
    setDirty(true)
  }

  const handleSave = async () => {
    if (!prefs) return
    await updateNotifications.mutateAsync(prefs)
    setDirty(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const sections: { title: string; description: string; items: { key: keyof NotifPrefs; label: string; detail: string }[] }[] = [
    {
      title: 'Sessions',
      description: 'Emails related to your session activity.',
      items: [
        { key: 'notifySessionRequests', label: 'New session requests', detail: 'Get notified when someone books a session with you.' },
        { key: 'notifySessionConfirmed', label: 'Session confirmed', detail: 'Get notified when a guide confirms your booking.' },
        { key: 'notifySessionReminders', label: 'Session reminders', detail: 'Receive a reminder email 24 hours before a session.' },
      ],
    },
    {
      title: 'Messages',
      description: 'Notifications about new messages.',
      items: [
        { key: 'notifyNewMessages', label: 'New messages', detail: 'Get an email when you receive a new message.' },
      ],
    },
    {
      title: 'Marketing',
      description: 'Product updates and promotional emails.',
      items: [
        { key: 'notifyMarketing', label: 'Product updates & tips', detail: 'Occasional emails about new features and platform improvements.' },
      ],
    },
  ]

  if (isLoading || !prefs) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-8">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-border" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-border" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-8">
      <div className="mb-6">
        <Link to="/settings" className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Settings
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Email & Notifications</h1>
        <p className="mt-1 text-sm text-text-muted">Choose which emails you receive from Expertify.</p>
      </div>

      <div className="space-y-5">
        {sections.map((section) => (
          <div key={section.title} className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-0.5 text-sm font-semibold text-text-primary">{section.title}</h2>
            <p className="mb-4 text-xs text-text-muted">{section.description}</p>
            <div className="space-y-4">
              {section.items.map(({ key, label, detail }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{label}</p>
                    <p className="text-xs text-text-muted">{detail}</p>
                  </div>
                  <Toggle checked={prefs[key]} onChange={(v) => handleToggle(key, v)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            Saved
          </span>
        )}
        {updateNotifications.isError && (
          <span className="text-sm text-red-500">Failed to save preferences</span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={updateNotifications.isPending || !dirty}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateNotifications.isPending ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}