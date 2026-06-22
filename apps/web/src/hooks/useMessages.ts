import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../services/apiClient'

export interface Conversation {
  userId: string
  name: string
  initials: string
  title: string
  guideProfileId: string | null
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

export interface ThreadMessage {
  id: string
  fromMe: boolean
  content: string
  createdAt: string
}

export function useConversations(role: 'SEEKER' | 'GUIDE' = 'SEEKER') {
  return useQuery({
    queryKey: ['messages', 'conversations', role],
    queryFn: async () => {
      const res = await apiClient.get<Conversation[]>('/messages/conversations', { params: { role } })
      return res.data
    },
    refetchInterval: 3000,
  })
}

export function useThread(otherId: string | null) {
  return useQuery({
    queryKey: ['messages', 'thread', otherId],
    queryFn: async () => {
      const res = await apiClient.get<ThreadMessage[]>(`/messages/conversations/${otherId}`)
      return res.data
    },
    enabled: !!otherId,
    refetchInterval: 3000,
    staleTime: 0,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
      const res = await apiClient.post<ThreadMessage>('/messages', { receiverId, content })
      return res.data
    },
    onSuccess: (newMsg, { receiverId }) => {
      queryClient.setQueryData<ThreadMessage[]>(['messages', 'thread', receiverId], (old = []) => [
        ...old,
        newMsg,
      ])
      queryClient.invalidateQueries({ queryKey: ['messages', 'conversations'] })
    },
  })
}