"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guideService = void 0;
const guideRepository_1 = require("../repositories/guideRepository");
const errors_1 = require("../utils/errors");
const DEFAULT_PAGE_SIZE = 20;
exports.guideService = {
    async listPublicGuides(query) {
        const take = Math.min(Number.parseInt(query.limit ?? '', 10) || DEFAULT_PAGE_SIZE, 50);
        const filters = {
            take,
        };
        if (query.cursor)
            filters.cursor = query.cursor;
        if (query.university)
            filters.university = query.university;
        if (query.specialization)
            filters.specialization = query.specialization;
        if (query.language)
            filters.language = query.language;
        if (query.search)
            filters.search = query.search;
        const { items, nextCursor } = await guideRepository_1.guideRepository.findManyPublic(filters);
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
        }));
        return {
            guides,
            nextCursor,
        };
    },
    async getPublicGuide(id) {
        const guide = await guideRepository_1.guideRepository.findPublicById(id);
        if (!guide) {
            throw new errors_1.AppError('Guide not found', 404);
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
        };
    },
};
//# sourceMappingURL=guideService.js.map