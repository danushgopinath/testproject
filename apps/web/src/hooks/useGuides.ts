import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../services/apiClient'

export interface GuideListItem {
  id: string
  name: string
  headline: string
  university: string | null
  languages: string[]
  specializations: string[]
  totalSessions: number
  averageRating: number | null
  journeys: {
    id: string
    title: string
    type: string
    institution: string
    year: number
  }[]
}

export interface GuidesResponse {
  guides: GuideListItem[]
  nextCursor: string | null
}

export function useGuides(params?: {
  search?: string
  university?: string
  specialization?: string
  language?: string
  limit?: number
}) {
  const { search, university, specialization, language, limit } = params ?? {}

  return useQuery({
    queryKey: ['guides', { search, university, specialization, language, limit }],
    queryFn: async () => {
      const res = await apiClient.get<GuidesResponse>('/guides', {
        params: { search, university, specialization, language, limit },
      })
      return res.data
    },
  })
}

export interface GuideProfile extends Omit<GuideListItem, 'journeys'> {
  currentRole: string
  currentCompany: string | null
  graduationYear: number | null
  journeys: {
    id: string
    type: string
    title: string
    institution: string
    year: number
    description: string
    outcomes: string[]
  }[]
}

export function useGuide(id: string | undefined) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: ['guide', id],
    queryFn: async () => {
      const res = await apiClient.get<GuideProfile>(`/guides/${id}`)
      return res.data
    },
  })
}

