import { apiClient } from './apiClient'

export interface EducationInput {
  school: string
  degree: string
  major: string
  startYear: number
  endYear?: number
}

export interface ExperienceInput {
  organization: string
  role: string
  responsibilities: string
  startYear: number
  endYear?: number
  isCurrent: boolean
}

export interface OnboardingPayload {
  phone: string
  bio: string
  currentRole: string
  linkedinUrl: string
  githubUrl?: string
  resumeFileName?: string
  resumeData?: string
  resumeIsPublic: boolean
  education: EducationInput[]
  experience: ExperienceInput[]
  specializations: string[]
  sessionRate: number
  availability: Record<string, string[]>
  timezone?: string
}

export const onboardingApi = {
  async getStatus(): Promise<{ isComplete: boolean }> {
    const res = await apiClient.get('/onboarding/status')
    return res.data
  },

  async getMyProfile() {
    const res = await apiClient.get('/onboarding/me')
    return res.data
  },

  async submit(payload: OnboardingPayload): Promise<{ success: boolean; guideProfileId: string }> {
    const res = await apiClient.post('/onboarding', payload)
    return res.data
  },

  async updateAvailability(
    availability: Record<string, string[]>,
    timezone?: string,
  ): Promise<{ success: boolean }> {
    const res = await apiClient.patch('/onboarding/availability', { availability, timezone })
    return res.data
  },
}