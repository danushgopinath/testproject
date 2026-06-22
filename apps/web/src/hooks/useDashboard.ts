import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../services/apiClient'

export interface MyProfileResponse {
  id: string
  firstName: string
  lastName: string
  email: string
  joinedAt: string
  guide: {
    headline: string
    currentRole: string
    currentCompany: string | null
    specializations: string[]
    languages: string[]
    totalSessions: number
    averageRating: number | null
    linkedinUrl: string | null
    availability: Record<string, string[]> | null
    education: { school: string; degree: string; major: string; startYear: number; endYear: number | null }[]
  } | null
}

export function useMyProfile() {
  return useQuery({
    queryKey: ['me', 'profile'],
    queryFn: async () => {
      const res = await apiClient.get<MyProfileResponse>('/dashboard/me/profile')
      return res.data
    },
  })
}

export interface NotificationsResponse {
  unreadMessages: number
  unreadNotificationCount: number
  pendingSessionRequests: number   // guide: new requests awaiting acceptance
  pendingAwaitingConfirmation: number  // seeker: sessions booked, awaiting guide acceptance
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await apiClient.get<NotificationsResponse>('/dashboard/notifications')
      return res.data
    },
    refetchInterval: 5000,
  })
}

export interface GuidePendingRequest {
  id: string
  name: string
  initials: string
  email: string
  topic: string
  notes: string | null
  scheduledAt: string
  durationMinutes: number
  totalCost: number // cents
  createdAt: string
}

export function useGuidePendingRequests(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ['dashboard', 'guide', 'pending-requests'],
    queryFn: async () => {
      const res = await apiClient.get<GuidePendingRequest[]>('/dashboard/guide/pending-requests')
      return res.data
    },
    refetchInterval: 5000,
  })
}

export interface GuideAnalyticsResponse {
  earnings: {
    totalEarnings: number
    thisMonth: number
    averagePerSession: number
    sessionsThisMonth: number
  }
  students: {
    totalStudents: number
    activeStudents: number
    averageRating: number | null
    totalSessions: number
  }
  performance: {
    responseRate: number
    averageRating: number | null
    averageResponseTimeHours: number | null
    repeatClientsPct: number
  }
}

export function useGuideAnalytics(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ['dashboard', 'guide', 'analytics'],
    queryFn: async () => {
      const res = await apiClient.get<GuideAnalyticsResponse>('/dashboard/guide/analytics')
      return res.data
    },
  })
}

export interface SeekerDashboardResponse {
  stats: {
    upcomingSessions: number
    unreadMessages: number
    guidesConnected: number
    sessionsCompleted: number
  }
  upcomingSessions: {
    id: string
    otherUserId: string
    name: string
    initials: string
    headline: string
    topic: string
    scheduledAt: string
    durationMinutes: number
    status: 'PENDING' | 'CONFIRMED'
  }[]
  recentMessages: {
    id: string
    name: string
    initials: string
    message: string
    createdAt: string
    isUnread: boolean
  }[]
}

export function useSeekerDashboard(enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: ['dashboard', 'seeker'],
    queryFn: async () => {
      const res = await apiClient.get<SeekerDashboardResponse>('/dashboard/seeker')
      return res.data
    },
  })
}

export interface GuideDashboardResponse {
  stats: {
    upcomingSessions: number
    pendingRequests: number
    monthlyEarnings: number
    avgRating: number | null
  }
  upcomingSessions: {
    id: string
    otherUserId: string
    name: string
    initials: string
    role: string
    topic: string
    scheduledAt: string
    durationMinutes: number
    status: 'PENDING' | 'CONFIRMED'
  }[]
  pastSessions: {
    id: string
    otherUserId: string
    name: string
    initials: string
    role: string
    topic: string
    scheduledAt: string
    durationMinutes: number
    status: 'COMPLETED' | 'CANCELLED'
  }[]
  pendingRequests: {
    id: string
    name: string
    initials: string
    topic: string
    scheduledAt: string
    durationMinutes: number
    status: 'PENDING'
  }[]
  recentMessages: SeekerDashboardResponse['recentMessages']
}

export function useGuideDashboard(enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: ['dashboard', 'guide'],
    queryFn: async () => {
      const res = await apiClient.get<GuideDashboardResponse>('/dashboard/guide')
      return res.data
    },
  })
}

export interface SeekerSessionItem {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  name: string
  initials: string
  role: string
  guideId: string
  topic: string
  scheduledAt: string
  durationMinutes: number
  totalCost: number // cents
}

export interface SeekerSessionsResponse {
  upcoming: SeekerSessionItem[]
  past: SeekerSessionItem[]
}

export function useSeekerSessions(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ['seeker', 'sessions'],
    queryFn: async () => {
      const res = await apiClient.get<SeekerSessionsResponse>('/dashboard/seeker/sessions')
      return res.data
    },
  })
}

export interface GuideSessionItem {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  name: string
  initials: string
  role: string
  otherUserId: string
  topic: string
  scheduledAt: string
  durationMinutes: number
  totalCost: number // cents
}

export interface GuideSessionsResponse {
  upcoming: GuideSessionItem[]
  past: GuideSessionItem[]
}

export function useGuideSessions(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ['guide', 'sessions'],
    queryFn: async () => {
      const res = await apiClient.get<GuideSessionsResponse>('/dashboard/guide/sessions')
      return res.data
    },
  })
}

export interface SeekerAnalyticsResponse {
  spending: {
    totalSpent: number
    thisMonth: number
    averagePerSession: number
    sessionsThisMonth: number
    totalSessions: number
  }
  mentors: {
    id: string
    name: string
    initials: string
    role: string
    completedSessions: number
    lastSessionAt: string | null
  }[]
}

export function useSeekerAnalytics() {
  return useQuery({
    queryKey: ['seeker', 'analytics'],
    queryFn: async () => {
      const res = await apiClient.get<SeekerAnalyticsResponse>('/dashboard/seeker/analytics')
      return res.data
    },
  })
}

