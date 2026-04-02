import { prisma } from '../config/prisma'

interface EducationInput {
  school: string
  degree: string
  major: string
  startYear: number
  endYear?: number
}

interface ExperienceInput {
  organization: string
  role: string
  responsibilities: string
  startYear: number
  endYear?: number
  isCurrent: boolean
}

interface OnboardingInput {
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
}

export const onboardingService = {
  async submitOnboarding(userId: string, data: OnboardingInput) {
    const headline = data.currentRole

    const guide = await prisma.guideProfile.upsert({
      where: { userId },
      create: {
        userId,
        headline,
        currentRole: data.currentRole,
        phone: data.phone,
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl || null,
        resumeFileName: data.resumeFileName || null,
        resumeData: data.resumeData || null,
        resumeIsPublic: data.resumeIsPublic,
        specializations: data.specializations,
        sessionRate: data.sessionRate * 100, // store in cents
        availability: data.availability,
        isApproved: true,
      },
      update: {
        headline,
        currentRole: data.currentRole,
        phone: data.phone,
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl || null,
        resumeFileName: data.resumeFileName || null,
        resumeData: data.resumeData || null,
        resumeIsPublic: data.resumeIsPublic,
        specializations: data.specializations,
        sessionRate: data.sessionRate * 100,
        availability: data.availability,
      },
    })

    if (data.bio) {
      await prisma.user.update({
        where: { id: userId },
        data: { bio: data.bio },
      })
    }

    // Replace education entries
    await prisma.education.deleteMany({ where: { guideProfileId: guide.id } })
    if (data.education.length > 0) {
      await prisma.education.createMany({
        data: data.education.map((e) => ({ ...e, guideProfileId: guide.id })),
      })
    }

    // Replace experience entries
    await prisma.experience.deleteMany({ where: { guideProfileId: guide.id } })
    if (data.experience.length > 0) {
      await prisma.experience.createMany({
        data: data.experience.map((e) => ({ ...e, guideProfileId: guide.id })),
      })
    }

    return { success: true, guideProfileId: guide.id }
  },

  async getMyProfile(userId: string) {
    const guideProfile = await prisma.guideProfile.findUnique({
      where: { userId },
      include: {
        education: { orderBy: { startYear: 'desc' } },
        experience: { orderBy: { startYear: 'desc' } },
        user: { select: { firstName: true, lastName: true, email: true, bio: true } },
      },
    })
    return { guideProfile }
  },

  async getOnboardingStatus(userId: string) {
    const profile = await prisma.guideProfile.findUnique({
      where: { userId },
      select: { id: true },
    })
    return { isComplete: profile !== null }
  },
}