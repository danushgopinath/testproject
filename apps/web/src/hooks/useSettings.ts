import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../services/apiClient'

export interface UserSettings {
  id: string
  firstName: string
  lastName: string
  email: string
  bio: string | null
  authProvider: 'EMAIL' | 'GOOGLE' | 'LINKEDIN'
  profileIsPublic: boolean
  notifySessionRequests: boolean
  notifySessionConfirmed: boolean
  notifySessionReminders: boolean
  notifyNewMessages: boolean
  notifyMarketing: boolean
}

export function useUserSettings() {
  return useQuery({
    queryKey: ['user', 'settings'],
    queryFn: async () => {
      const res = await apiClient.get<UserSettings>('/users/me/settings')
      return res.data
    },
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; bio?: string | null }) => {
      const res = await apiClient.patch('/users/me', data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user', 'settings'] })
      qc.invalidateQueries({ queryKey: ['me', 'profile'] })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiClient.patch('/users/me/password', data)
      return res.data
    },
  })
}

export function useUpdateNotifications() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (prefs: Partial<Pick<UserSettings, 'notifySessionRequests' | 'notifySessionConfirmed' | 'notifySessionReminders' | 'notifyNewMessages' | 'notifyMarketing'>>) => {
      const res = await apiClient.patch('/users/me/notifications', prefs)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user', 'settings'] })
    },
  })
}

export function useUpdatePrivacy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (profileIsPublic: boolean) => {
      const res = await apiClient.patch('/users/me/privacy', { profileIsPublic })
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user', 'settings'] })
    },
  })
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete('/users/me')
      return res.data
    },
  })
}