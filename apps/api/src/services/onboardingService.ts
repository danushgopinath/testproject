import { prisma } from '../config/prisma'
import { uploadToS3, getSignedUrl } from '../utils/s3'

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
  resumeData?: string   // base64 DataURL from frontend, e.g. "data:application/pdf;base64,..."
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

    // If a resume was uploaded, decode from base64 and push to S3
    let resumeUrl: string | null = null
    if (data.resumeData && data.resumeFileName) {
      // DataURL format: "data:<mimeType>;base64,<data>"
      const matches = data.resumeData.match(/^data:([^;]+);base64,(.+)$/)
      if (matches && matches[1] && matches[2]) {
        const contentType = matches[1]
        const base64Data = matches[2]
        const buffer = Buffer.from(base64Data, 'base64')
        const timestamp = Date.now()
        const key = `resumes/${userId}/${timestamp}-${data.resumeFileName}`
        resumeUrl = await uploadToS3(buffer, key, contentType)
      }
    }

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
        resumeUrl,
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
        // Only overwrite resumeUrl if a new file was uploaded
        ...(resumeUrl !== null && { resumeUrl }),
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

    // Swap the stored S3 key for a fresh 15-min signed download URL
    let resumeSignedUrl: string | null = null
    if (guideProfile?.resumeUrl && guideProfile.resumeIsPublic) {
      resumeSignedUrl = await getSignedUrl(guideProfile.resumeUrl)
    }

    return {
      guideProfile: guideProfile
        ? { ...guideProfile, resumeSignedUrl }
        : null,
    }
  },

  async getOnboardingStatus(userId: string) {
    const profile = await prisma.guideProfile.findUnique({
      where: { userId },
      select: { id: true },
    })
    return { isComplete: profile !== null }
  },

  async updateAvailability(userId: string, availability: Record<string, string[]>) {
    const profile = await prisma.guideProfile.findUnique({
      where: { userId },
      select: { id: true },
    })
    if (!profile) throw new Error('Guide profile not found')
    await prisma.guideProfile.update({
      where: { userId },
      data: { availability },
    })
    return { success: true }
  },
}