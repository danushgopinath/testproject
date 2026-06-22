import { useCallback } from 'react'
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

/**
 * Opens the Daily video room for a session in a NEW browser tab (not embedded
 * in the app). The blank tab is opened synchronously inside the click handler
 * so it isn't blocked by the popup blocker, then redirected once the join
 * request resolves with the room URL + meeting token.
 */
export function useOpenSessionCall() {
  const join = useJoinSession()
  return useCallback(
    (sessionId: string) => {
      const tab = window.open('', '_blank')
      join.mutate(sessionId, {
        onSuccess: (data) => {
          if (data.status === 'ok') {
            const url = `${data.roomUrl}?t=${data.token}`
            if (tab) tab.location.href = url
            else window.open(url, '_blank')
            return
          }
          tab?.close()
          if (data.status === 'too_early') {
            window.alert(
              `This session isn't open yet. You can join from ${new Date(data.opensAt).toLocaleString()}.`,
            )
          } else {
            window.alert("This session's join window has closed.")
          }
        },
        onError: (err: unknown) => {
          tab?.close()
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Unable to join this session.'
          window.alert(message)
        },
      })
    },
    [join],
  )
}