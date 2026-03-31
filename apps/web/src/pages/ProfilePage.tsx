import { useAuthStore } from '../stores/authStore'
import { MapPin, Briefcase, GraduationCap, Calendar, Star, MessageSquare, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ProfilePage() {
  const { user } = useAuthStore()

  // Mock data - replace with real data from API
  const profileData = {
    bio: 'Experienced product manager with 8+ years in tech. Passionate about helping students break into PM roles at FAANG companies.',
    location: 'San Francisco, CA',
    company: 'Google',
    position: 'Senior Product Manager',
    education: 'MBA, Stanford Graduate School of Business',
    joinedDate: 'January 2024',
    rating: 4.9,
    totalSessions: 127,
    responseTime: 'Usually responds within 2 hours',
    expertise: ['Product Management', 'Career Transition', 'FAANG Interviews', 'Tech Industry'],
    languages: ['English', 'Spanish'],
  }

  const stats = [
    { label: 'Total Sessions', value: profileData.totalSessions, icon: MessageSquare },
    { label: 'Avg. Rating', value: profileData.rating, icon: Star },
    { label: 'Response Time', value: profileData.responseTime, icon: Clock },
  ]

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Profile</h1>
        <p className="mt-2 text-sm text-text-muted">View and manage your public profile</p>
      </div>

      {/* Profile Card */}
      <div className="mb-6 rounded-xl border border-border bg-surface p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Avatar Section */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
              {user?.firstName[0]}{user?.lastName[0]}
            </div>
            <div className="mt-4 text-center md:text-left">
              <h2 className="text-xl font-semibold text-text-primary">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="mt-1 text-sm text-text-muted">{user?.email}</p>
              <div className="mt-3 flex items-center gap-1 text-sm text-text-muted">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-text-primary">{profileData.rating}</span>
                <span className="text-text-muted">({profileData.totalSessions} sessions)</span>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-text-muted">Bio</h3>
              <p className="mt-1 text-sm text-text-primary">{profileData.bio}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Location</p>
                  <p className="mt-0.5 text-sm font-medium text-text-primary">{profileData.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Current Role</p>
                  <p className="mt-0.5 text-sm font-medium text-text-primary">
                    {profileData.position} @ {profileData.company}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <GraduationCap className="h-5 w-5 text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Education</p>
                  <p className="mt-0.5 text-sm font-medium text-text-primary">{profileData.education}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Joined</p>
                  <p className="mt-0.5 text-sm font-medium text-text-primary">{profileData.joinedDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <div key={index} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-muted">{stat.label}</p>
                <p className="mt-1 text-lg font-semibold text-text-primary">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expertise & Languages */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h3 className="text-lg font-semibold text-text-primary">Areas of Expertise</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {profileData.expertise.map((area, index) => (
              <span
                key={index}
                className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-text-primary"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h3 className="text-lg font-semibold text-text-primary">Languages</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {profileData.languages.map((language, index) => (
              <span
                key={index}
                className="rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-text-primary"
              >
                {language}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          to="/settings/profile"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-7 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          <span className="text-white">Edit Profile</span>
        </Link>
        <Link
          to="/settings"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-7 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-background"
        >
          Settings
        </Link>
      </div>
    </div>
  )
}
