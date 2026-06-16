import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../services/apiClient'

export function useAcceptSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await apiClient.patch(`/sessions/${sessionId}/accept`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'guide'] })
      queryClient.invalidateQueries({ queryKey: ['seeker', 'sessions'] })
    },
  })
}

export function useDeclineSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await apiClient.patch(`/sessions/${sessionId}/decline`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'guide'] })
      queryClient.invalidateQueries({ queryKey: ['seeker', 'sessions'] })
    },
  })
}

export type JoinSessionResponse =
  | { status: 'ok'; roomUrl: string; token: string; expiresAt: string; role: 'guide' | 'seeker' }
  | { status: 'too_early'; opensAt: string }
  | { status: 'expired' }

export function useJoinSession() {
  return useMutation({
    mutationFn: async (sessionId: string): Promise<JoinSessionResponse> => {
      const res = await apiClient.post<JoinSessionResponse>(`/sessions/${sessionId}/join`)
      return res.data
    },
  })
}