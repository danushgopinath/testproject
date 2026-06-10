import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUserSettings, useUpdatePrivacy } from '../../hooks/useSettings'
import { CheckCircle2, ChevronLeft, Globe, Lock, FileText, ShieldCheck } from 'lucide-react'

export function PrivacySettingsPage() {
  const { data: settings, isLoading } = useUserSettings()
  const updatePrivacy = useUpdatePrivacy()
  const [profileIsPublic, setProfileIsPublic] = useState(true)
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings) {
      setProfileIsPublic(settings.profileIsPublic)
    }
  }, [settings])

  const handleSave = async () => {
    await updatePrivacy.mutateAsync(profileIsPublic)
    setDirty(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-border" />
        <div className="mt-6 h-48 animate-pulse rounded-2xl bg-border" />
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
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Privacy Settings</h1>
        <p className="mt-1 text-sm text-text-muted">Control who can see your profile and how your data is used.</p>
      </div>

      <div className="space-y-5">
        {/* Profile visibility */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-sm font-semibold text-text-primary">Profile Visibility</h2>
          <div className="space-y-3">
            <label
              className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors ${
                profileIsPublic ? 'border-primary bg-primary/5' : 'border-border bg-background hover:bg-background/80'
              }`}
              onClick={() => { setProfileIsPublic(true); setDirty(true) }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">Public</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  Your profile is visible to everyone, including non-logged-in visitors. Guides appear in search results.
                </p>
              </div>
              <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 transition-colors ${profileIsPublic ? 'border-primary bg-primary' : 'border-border'}`} />
            </label>

            <label
              className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors ${
                !profileIsPublic ? 'border-primary bg-primary/5' : 'border-border bg-background hover:bg-background/80'
              }`}
              onClick={() => { setProfileIsPublic(false); setDirty(true) }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">Private</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  Only users who have an active or past session with you can view your profile.
                </p>
              </div>
              <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 transition-colors ${!profileIsPublic ? 'border-primary bg-primary' : 'border-border'}`} />
            </label>
          </div>
        </div>

        {/* Data practices */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-sm font-semibold text-text-primary">Data & Security</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-text-primary">Data encryption</p>
                <p className="text-xs text-text-muted">All data is encrypted at rest and in transit using industry-standard protocols.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-text-primary">What we store</p>
                <p className="text-xs text-text-muted">
                  We store your name, email, session history, and messages. We do not sell your data to third parties.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delete account reminder */}
        <p className="text-xs text-text-muted px-1">
          To permanently delete your account and all associated data, go to{' '}
          <a href="/settings" className="text-primary hover:underline">Settings → Delete Account</a>.
        </p>
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            Saved
          </span>
        )}
        {updatePrivacy.isError && (
          <span className="text-sm text-red-500">Failed to save</span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={updatePrivacy.isPending || !dirty}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updatePrivacy.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}