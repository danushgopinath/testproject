import { useForm } from 'react-hook-form'
import { useAuthStore } from '../../stores/authStore'
import { Mail, MapPin, Briefcase, GraduationCap, Save } from 'lucide-react'
import { Button } from '../../components/atoms/Button'
import { useNavigate } from 'react-router-dom'

interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
  bio: string
  location: string
  company: string
  position: string
  education: string
}

export function ProfileSettingsPage() {
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      bio: '',
      location: '',
      company: '',
      position: '',
      education: '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    if (user && accessToken) {
      // Update auth store so the new info appears across the app
      setAuth(
        {
          ...user,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        },
        accessToken,
      )
    }
    // TODO: send data to backend when API is ready
    console.log('Updating profile:', data)
    navigate('/profile')
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Profile Settings</h1>
        <p className="mt-2 text-sm text-text-muted">Update your basic information, goals, and visibility settings.</p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Basic Information</h2>
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
              {errors.firstName && <p className="text-xs text-error">{errors.firstName.message}</p>}
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
              {errors.lastName && <p className="text-xs text-error">{errors.lastName.message}</p>}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="email"
                  type="email"
                  className="w-full rounded-lg border border-border bg-background pl-11 pr-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  {...register('email', { required: 'Email is required' })}
                />
              </div>
              {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Bio</h2>
          <div className="space-y-1.5">
            <label htmlFor="bio" className="block text-sm font-medium text-text-primary">
              About You
            </label>
            <textarea
              id="bio"
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Tell others about yourself, your experience, and how you can help..."
              {...register('bio')}
            />
            <p className="text-xs text-text-muted">This will be displayed on your public profile.</p>
          </div>
        </div>

        {/* Professional Information */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Professional Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="location" className="block text-sm font-medium text-text-primary">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="location"
                  type="text"
                  placeholder="City, State/Country"
                  className="w-full rounded-lg border border-border bg-background pl-11 pr-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  {...register('location')}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="company" className="block text-sm font-medium text-text-primary">
                Company
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="company"
                  type="text"
                  placeholder="Your current company"
                  className="w-full rounded-lg border border-border bg-background pl-11 pr-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  {...register('company')}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="position" className="block text-sm font-medium text-text-primary">
                Position
              </label>
              <input
                id="position"
                type="text"
                placeholder="Your current role"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                {...register('position')}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="education" className="block text-sm font-medium text-text-primary">
                Education
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="education"
                  type="text"
                  placeholder="Your education background"
                  className="w-full rounded-lg border border-border bg-background pl-11 pr-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  {...register('education')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-7 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-background"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-7 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

