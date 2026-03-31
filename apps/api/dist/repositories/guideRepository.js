"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guideRepository = void 0;
const prisma_1 = require("../config/prisma");
exports.guideRepository = {
    async findManyPublic(filters) {
        const { take, cursor, university, specialization, language, search } = filters;
        const where = {
            isApproved: true,
            user: {
                isEmailVerified: true,
            },
        };
        if (university) {
            where.university = {
                contains: university,
                mode: 'insensitive',
            };
        }
        if (specialization) {
            where.specializations = {
                has: specialization,
            };
        }
        if (language) {
            where.languages = {
                has: language,
            };
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
            ];
        }
        const results = await prisma_1.prisma.guideProfile.findMany({
            where,
            include: {
                user: true,
                journeys: true,
                reviews: true,
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
        });
        const hasNextPage = results.length > take;
        const items = results.slice(0, take);
        return {
            items,
            nextCursor: hasNextPage ? items[items.length - 1]?.id ?? null : null,
        };
    },
    async findPublicById(id) {
        return prisma_1.prisma.guideProfile.findFirst({
            where: {
                id,
                isApproved: true,
                user: {
                    isEmailVerified: true,
                },
            },
            include: {
                user: true,
                journeys: true,
                reviews: true,
            },
        });
    },
};
//# sourceMappingURL=guideRepository.js.map