import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../services/apiClient'

export interface GuideListItem {
  id: string
  userId: string
  avatarUrl: string | null
  name: string
  headline: string
  currentRole: string
  bio: string | null
  university: string | null
  languages: string[]
  specializations: string[]
  totalSessions: number
  averageRating: number | null
  sessionRate: number | null
  reviewCount: number
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
  currentCompany: string | null
  graduationYear: number | null
  availability: Record<string, string[]> | null
  linkedinUrl: string | null
  githubUrl: string | null
  resumeFileName: string | null
  resumeIsPublic: boolean
  resumeSignedUrl: string | null
  education: {
    id: string
    school: string
    degree: string
    major: string
    startYear: number
    endYear: number | null
  }[]
  experience: {
    id: string
    organization: string
    role: string
    responsibilities: string
    startYear: number
    endYear: number | null
    isCurrent: boolean
  }[]
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

