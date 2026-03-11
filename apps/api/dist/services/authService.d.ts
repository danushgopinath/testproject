import type { Response } from 'express';
export declare const authService: {
    register(rawData: unknown, res: Response): Promise<{
        user: {
            id: string;
            email: string;
            role: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        accessToken: string;
    }>;
    login(rawData: unknown, res: Response): Promise<{
        user: {
            id: string;
            email: string;
            role: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        accessToken: string;
    }>;
    googleAuth(idToken: string, res: Response): Promise<{
        user: {
            id: string;
            email: string;
            role: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        accessToken: string;
    }>;
    linkedinAuth(code: string, res: Response): Promise<{
        user: {
            id: string;
            email: string;
            role: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        accessToken: string;
    }>;
    me(userId: string): Promise<{
        user: {
            id: string;
            email: string;
            role: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    }>;
    refresh(refreshTokenValue: string, res: Response): Promise<{
        user: {
            id: string;
            email: string;
            role: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        accessToken: string;
    }>;
    logout(res: Response): {
        message: string;
    };
};
//# sourceMappingURL=authService.d.ts.map