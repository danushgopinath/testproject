import type { Prisma } from '../../generated/prisma'
import { prisma } from '../config/prisma'

export interface GuideListFilters {
  take: number
  cursor?: string
  university?: string
  specialization?: string
  language?: string
  search?: string
}

export const guideRepository = {
  async findManyPublic(filters: GuideListFilters) {
    const { take, cursor, university, specialization, language, search } = filters

    const where: Prisma.GuideProfileWhereInput = {
      isApproved: true,
    }

    if (university) {
      where.university = {
        contains: university,
        mode: 'insensitive',
      }
    }

    if (specialization) {
      where.specializations = {
        has: specialization,
      }
    }

    if (language) {
      where.languages = {
        has: language,
      }
    }

    if (search) {
      where.OR = [
        { headline: { contains: search, mode: 'insensitive' } },
        { currentRole: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ]
    }

    const results = await prisma.guideProfile.findMany({
      where,
      include: {
        user: true,
        journeys: true,
        reviews: true,
        education: { orderBy: { startYear: 'desc' } },
        experience: { orderBy: { startYear: 'desc' } },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: take + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
    })

    const hasNextPage = results.length > take
    const items = results.slice(0, take)

    return {
      items,
      nextCursor: hasNextPage ? items[items.length - 1]?.id ?? null : null,
    }
  },

  async findPublicById(id: string) {
    return prisma.guideProfile.findFirst({
      where: {
        id,
        isApproved: true,
      },
      include: {
        user: true,
        journeys: true,
        reviews: true,
        education: { orderBy: { startYear: 'desc' } },
        experience: { orderBy: { startYear: 'desc' } },
      },
    })
  },
}

