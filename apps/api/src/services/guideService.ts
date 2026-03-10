import { guideRepository } from '../repositories/guideRepository'
import { AppError } from '../utils/errors'

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

    const { items, nextCursor } = await guideRepository.findManyPublic({
      take,
      cursor: query.cursor,
      university: query.university,
      specialization: query.specialization,
      language: query.language,
      search: query.search,
    })

    const guides = items.map((g) => ({
      id: g.id,
      name: `${g.user.firstName} ${g.user.lastName}`,
      headline: g.headline,
      university: g.university,
      languages: g.languages,
      totalSessions: g.totalSessions,
      averageRating: g.averageRating,
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

    return {
      id: guide.id,
      name: `${guide.user.firstName} ${guide.user.lastName}`,
      headline: guide.headline,
      currentRole: guide.currentRole,
      currentCompany: guide.currentCompany,
      university: guide.university,
      graduationYear: guide.graduationYear,
      languages: guide.languages,
      totalSessions: guide.totalSessions,
      averageRating: guide.averageRating,
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

