import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { useChangePassword, useUserSettings } from '../../hooks/useSettings'
import { Eye, EyeOff, CheckCircle2, ChevronLeft } from 'lucide-react'

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function PasswordSettingsPage() {
  const navigate = useNavigate()
  const { data: settings, isLoading } = useUserSettings()
  const changePassword = useChangePassword()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>()

  const newPassword = watch('newPassword', '')

  const onSubmit = async (data: PasswordFormData) => {
    await changePassword.mutateAsync({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
    reset()
    setSaved(true)
    setTimeout(() => setSaved(false), 4000)
  }

  const isSocialLogin = settings?.authProvider !== 'EMAIL'

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-8">
      <div className="mb-6">
        <Link to="/settings" className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Settings
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Password</h1>
        <p className="mt-1 text-sm text-text-muted">Change the password used to sign in to your account.</p>
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-2xl bg-border" />
      ) : isSocialLogin ? (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-text-muted">
            Your account uses {settings?.authProvider === 'GOOGLE' ? 'Google' : 'LinkedIn'} sign-in. Password management
            is handled by your social provider.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
            {/* Current password */}
            <div className="space-y-1.5">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-text-primary">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 pr-11 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  {...register('currentPassword', { required: 'Current password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-xs text-red-500">{errors.currentPassword.message}</p>}
            </div>

            {/* New password */}
            <div className="space-y-1.5">
              <label htmlFor="newPassword" className="block text-sm font-medium text-text-primary">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 pr-11 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 8, message: 'Must be at least 8 characters' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
              {/* Strength hint */}
              {newPassword.length > 0 && (
                <div className="flex gap-1 pt-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        newPassword.length >= [8, 12, 16, 20][i]
                          ? ['bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'][i]
                          : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 pr-11 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (v) => v === newPassword || 'Passwords do not match',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Password updated
              </span>
            )}
            {changePassword.isError && (
              <span className="text-sm text-red-500">
                {(changePassword.error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                  'Failed to update password'}
              </span>
            )}
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-background"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={changePassword.isPending}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changePassword.isPending ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}