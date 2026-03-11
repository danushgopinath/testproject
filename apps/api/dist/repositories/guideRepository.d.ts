import type { Prisma } from '../../generated/prisma';
export interface GuideListFilters {
    take: number;
    cursor?: string;
    university?: string;
    specialization?: string;
    language?: string;
    search?: string;
}
export declare const guideRepository: {
    findManyPublic(filters: GuideListFilters): Promise<{
        items: ({
            reviews: {
                id: string;
                createdAt: Date;
                sessionId: string;
                reviewerId: string;
                rating: number;
                comment: string | null;
                isPublic: boolean;
                guideId: string | null;
            }[];
            user: {
                id: string;
                email: string;
                googleId: string | null;
                linkedinId: string | null;
                passwordHash: string | null;
                role: import("../../generated/prisma").$Enums.UserRole;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
                bio: string | null;
                isEmailVerified: boolean;
                authProvider: import("../../generated/prisma").$Enums.AuthProvider;
                createdAt: Date;
                updatedAt: Date;
            };
            journeys: {
                type: import("../../generated/prisma").$Enums.JourneyType;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                year: number;
                guideProfileId: string;
                title: string;
                institution: string;
                description: string;
                outcomes: string[];
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            headline: string;
            currentRole: string;
            currentCompany: string | null;
            university: string | null;
            graduationYear: number | null;
            programs: string[];
            specializations: string[];
            languages: string[];
            sessionRate: number | null;
            availability: Prisma.JsonValue | null;
            isApproved: boolean;
            totalSessions: number;
            averageRating: number | null;
        })[];
        nextCursor: string | null;
    }>;
    findPublicById(id: string): Promise<({
        reviews: {
            id: string;
            createdAt: Date;
            sessionId: string;
            reviewerId: string;
            rating: number;
            comment: string | null;
            isPublic: boolean;
            guideId: string | null;
        }[];
        user: {
            id: string;
            email: string;
            googleId: string | null;
            linkedinId: string | null;
            passwordHash: string | null;
            role: import("../../generated/prisma").$Enums.UserRole;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            bio: string | null;
            isEmailVerified: boolean;
            authProvider: import("../../generated/prisma").$Enums.AuthProvider;
            createdAt: Date;
            updatedAt: Date;
        };
        journeys: {
            type: import("../../generated/prisma").$Enums.JourneyType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            year: number;
            guideProfileId: string;
            title: string;
            institution: string;
            description: string;
            outcomes: string[];
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        headline: string;
        currentRole: string;
        currentCompany: string | null;
        university: string | null;
        graduationYear: number | null;
        programs: string[];
        specializations: string[];
        languages: string[];
        sessionRate: number | null;
        availability: Prisma.JsonValue | null;
        isApproved: boolean;
        totalSessions: number;
        averageRating: number | null;
    }) | null>;
};
//# sourceMappingURL=guideRepository.d.ts.map