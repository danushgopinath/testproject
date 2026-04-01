import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../services/apiClient'

export interface SeekerDashboardResponse {
  stats: {
    upcomingSessions: number
    unreadMessages: number
    guidesConnected: number
    sessionsCompleted: number
  }
  upcomingSessions: {
    id: string
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
    name: string
    initials: string
    role: string
    topic: string
    scheduledAt: string
    durationMinutes: number
    status: 'PENDING' | 'CONFIRMED'
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

