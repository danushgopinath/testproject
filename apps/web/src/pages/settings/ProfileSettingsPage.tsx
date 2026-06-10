import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useUserSettings, useUpdateProfile } from '../../hooks/useSettings'
import { CheckCircle2, ChevronLeft } from 'lucide-react'

interface ProfileFormData {
  firstName: string
  lastName: string
  bio: string
}

export function ProfileSettingsPage() {
  const navigate = useNavigate()
  const { user, setAuth, accessToken } = useAuthStore()
  const { data: settings, isLoading } = useUserSettings()
  const updateProfile = useUpdateProfile()
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: { firstName: '', lastName: '', bio: '' },
  })

  useEffect(() => {
    if (settings) {
      reset({
        firstName: settings.firstName,
        lastName: settings.lastName,
        bio: settings.bio ?? '',
      })
    }
  }, [settings, reset])

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfile.mutateAsync({
      firstName: data.firstName,
      lastName: data.lastName,
      bio: data.bio || null,
    })
    // Keep auth store in sync so name updates everywhere
    if (user && accessToken) {
      setAuth({ ...user, firstName: data.firstName, lastName: data.lastName }, accessToken)
    }
    reset(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-border" />
        <div className="mt-6 h-64 animate-pulse rounded-xl bg-border" />
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
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Profile Settings</h1>
        <p className="mt-1 text-sm text-text-muted">Update your name and bio shown on your public profile.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Basic info */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-sm font-semibold text-text-primary">Basic Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="block text-sm font-medium text-text-primary">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                {...register('firstName', { required: 'First name is required' })}
              />
              {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="lastName" className="block text-sm font-medium text-text-primary">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                {...register('lastName', { required: 'Last name is required' })}
              />
              {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
            </div>
            {/* Email read-only */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary">Email</label>
              <input
                type="email"
                value={settings?.email ?? ''}
                readOnly
                className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm text-text-muted outline-none cursor-not-allowed"
              />
              <p className="text-xs text-text-muted">Email cannot be changed here. Contact support if needed.</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-sm font-semibold text-text-primary">About You</h2>
          <div className="space-y-1.5">
            <label htmlFor="bio" className="block text-sm font-medium text-text-primary">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="Tell others about yourself, your experience, and how you can help..."
              {...register('bio')}
            />
            <p className="text-xs text-text-muted">Displayed on your public profile.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </span>
          )}
          {updateProfile.isError && (
            <span className="text-sm text-red-500">
              {(updateProfile.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save'}
            </span>
          )}
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-background"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateProfile.isPending || !isDirty}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}