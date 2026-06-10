import { useState } from 'react'
import { Shield, CreditCard, Globe, Mail, Lock, User, LogOut, Trash2, ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useDeleteAccount } from '../../hooks/useSettings'

export function SettingsPage() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const deleteAccount = useDeleteAccount()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'delete my account') return
    await deleteAccount.mutateAsync()
    await logout()
    navigate('/')
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-muted">Manage your account settings and preferences.</p>
      </div>

      <div className="space-y-5">
        {/* Account + Privacy + Preferences merged into clean list */}
        <div className="rounded-2xl border border-border bg-surface divide-y divide-border">
          {[
            { icon: User, label: 'Profile Settings', description: 'Update your name and bio', link: '/settings/profile' },
            { icon: Mail, label: 'Email & Notifications', description: 'Control which emails you receive', link: '/settings/notifications' },
            { icon: Lock, label: 'Password', description: 'Change your sign-in password', link: '/settings/password' },
            { icon: Shield, label: 'Privacy', description: 'Profile visibility and data preferences', link: '/settings/privacy' },
            { icon: Globe, label: 'Language', description: 'English (US)', link: '/settings/language' },
            { icon: CreditCard, label: 'Payment Methods', description: 'Manage your billing and payment methods', link: '/settings/billing' },
          ].map(({ icon: Icon, label, description, link }) => (
            <Link
              key={link}
              to={link}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-background first:rounded-t-2xl last:rounded-b-2xl"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{label}</p>
                <p className="text-xs text-text-muted truncate">{description}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
            </Link>
          ))}
        </div>

        {/* Logout */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Sign Out</p>
              <p className="text-xs text-text-muted">Sign out of your account on this device.</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-background"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Delete account */}
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Delete Account</p>
              <p className="text-xs text-red-500">Permanently delete your account and all data. This cannot be undone.</p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>

          {showDeleteConfirm && (
            <div className="mt-4 rounded-xl border border-red-200 bg-white p-4">
              <p className="mb-3 text-sm text-red-700">
                This will permanently delete your account, sessions, messages, and all other data. Type{' '}
                <span className="font-mono font-semibold">delete my account</span> to confirm.
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="delete my account"
                className="mb-3 w-full rounded-lg border border-red-200 bg-background px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== 'delete my account' || deleteAccount.isPending}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteAccount.isPending ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
              {deleteAccount.isError && (
                <p className="mt-2 text-xs text-red-500">Failed to delete account. Please try again.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}