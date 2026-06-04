import { guideRepository } from '../repositories/guideRepository'
import { AppError } from '../utils/errors'
import { getSignedUrl } from '../utils/s3'

const DEFAULT_PAGE_SIZE = 20

export const guideService = {
  async listPublicGuides(query: {
    cursor?: string
    university?: string
    specialization?: string
    language?: string
    search?: string
    limit?: string
  }) {
    const take = Math.min(
      Number.parseInt(query.limit ?? '', 10) || DEFAULT_PAGE_SIZE,
      50,
    )

    const filters: {
      take: number
      cursor?: string
      university?: string
      specialization?: string
      language?: string
      search?: string
    } = {
      take,
    }
    if (query.cursor) filters.cursor = query.cursor
    if (query.university) filters.university = query.university
    if (query.specialization) filters.specialization = query.specialization
    if (query.language) filters.language = query.language
    if (query.search) filters.search = query.search

    const { items, nextCursor } = await guideRepository.findManyPublic(filters)

    const guides = items.map((g) => ({
      id: g.id,
      name: `${g.user.firstName} ${g.user.lastName}`,
      headline: g.headline,
      currentRole: g.currentRole,
      bio: g.user.bio ?? null,
      university: g.university,
      languages: g.languages,
      specializations: g.specializations,
      totalSessions: g.totalSessions,
      averageRating: g.averageRating,
      sessionRate: g.sessionRate,
      reviewCount: g.reviews.length,
      journeys: g.journeys.map((j) => ({
        id: j.id,
        title: j.title,
        type: j.type,
        institution: j.institution,
        year: j.year,
      })),
    }))

    return {
      guides,
      nextCursor,
    }
  },

  async getPublicGuide(id: string) {
    const guide = await guideRepository.findPublicById(id)
    if (!guide) {
      throw new AppError('Guide not found', 404)
    }

    let resumeSignedUrl: string | null = null
    if (guide.resumeIsPublic && guide.resumeUrl) {
      resumeSignedUrl = await getSignedUrl(guide.resumeUrl)
    }

    return {
      id: guide.id,
      name: `${guide.user.firstName} ${guide.user.lastName}`,
      bio: guide.user.bio ?? null,
      headline: guide.headline,
      currentRole: guide.currentRole,
      currentCompany: guide.currentCompany,
      university: guide.university,
      graduationYear: guide.graduationYear,
      languages: guide.languages,
      specializations: guide.specializations,
      sessionRate: guide.sessionRate,
      totalSessions: guide.totalSessions,
      averageRating: guide.averageRating,
      reviewCount: guide.reviews.length,
      linkedinUrl: guide.linkedinUrl ?? null,
      githubUrl: guide.githubUrl ?? null,
      resumeFileName: guide.resumeFileName ?? null,
      resumeIsPublic: guide.resumeIsPublic,
      resumeSignedUrl,
      education: guide.education.map((e) => ({
        id: e.id,
        school: e.school,
        degree: e.degree,
        major: e.major,
        startYear: e.startYear,
        endYear: e.endYear ?? null,
      })),
      experience: guide.experience.map((e) => ({
        id: e.id,
        organization: e.organization,
        role: e.role,
        responsibilities: e.responsibilities,
        startYear: e.startYear,
        endYear: e.endYear ?? null,
        isCurrent: e.isCurrent,
      })),
      journeys: guide.journeys
        .slice()
        .sort((a, b) => b.year - a.year)
        .map((j) => ({
          id: j.id,
          type: j.type,
          title: j.title,
          institution: j.institution,
          year: j.year,
          description: j.description,
          outcomes: j.outcomes,
        })),
    }
  },
}

