import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../services/apiClient'

export interface ReviewableSession {
  sessionId: string
  guideId: string
  guideName: string
  guideInitials: string
  role: string
  topic: string
  scheduledAt: string
  review: { rating: number; comment: string | null; createdAt: string } | null
}

export function useMyReviewables() {
  return useQuery({
    queryKey: ['reviews', 'mine'],
    queryFn: async () => {
      const res = await apiClient.get<ReviewableSession[]>('/reviews/mine')
      return res.data
    },
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { sessionId: string; rating: number; comment?: string }) => {
      const res = await apiClient.post('/reviews', input)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'mine'] })
      queryClient.invalidateQueries({ queryKey: ['guides'] })
    },
  })
}