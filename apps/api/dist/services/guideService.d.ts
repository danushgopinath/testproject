export declare const guideService: {
    listPublicGuides(query: {
        cursor?: string;
        university?: string;
        specialization?: string;
        language?: string;
        search?: string;
        limit?: string;
    }): Promise<{
        guides: {
            id: string;
            name: string;
            headline: string;
            university: string | null;
            languages: string[];
            totalSessions: number;
            averageRating: number | null;
            journeys: {
                id: string;
                title: string;
                type: import("../../generated/prisma").$Enums.JourneyType;
                institution: string;
                year: number;
            }[];
        }[];
        nextCursor: string | null;
    }>;
    getPublicGuide(id: string): Promise<{
        id: string;
        name: string;
        headline: string;
        currentRole: string;
        currentCompany: string | null;
        university: string | null;
        graduationYear: number | null;
        languages: string[];
        totalSessions: number;
        averageRating: number | null;
        journeys: {
            id: string;
            type: import("../../generated/prisma").$Enums.JourneyType;
            title: string;
            institution: string;
            year: number;
            description: string;
            outcomes: string[];
        }[];
    }>;
};
//# sourceMappingURL=guideService.d.ts.map