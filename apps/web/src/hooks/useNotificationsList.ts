import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../services/apiClient'

export type NotificationType =
  | 'SESSION_REQUEST'
  | 'SESSION_ACCEPTED'
  | 'SESSION_DECLINED'
  | 'SESSION_REMINDER'
  | 'SESSION_CANCELLED'
  | 'NEW_MESSAGE'
  | 'BOOKING_PLACED'

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  body: string
  link: string | null
  sessionId: string | null
  isRead: boolean
  createdAt: string
}

export function useNotificationsList(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ['notifications', 'list'],
    queryFn: async () => {
      const res = await apiClient.get<NotificationItem[]>('/notifications')
      return res.data
    },
    refetchInterval: 5000,
  })
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await apiClient.patch('/notifications/read-all')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications', 'list'] })
    },
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/notifications/${id}/read`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications', 'list'] })
    },
  })
}