"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const userRepository_1 = require("../repositories/userRepository");
const errors_1 = require("../utils/errors");
const env_1 = require("../config/env");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    role: zod_1.z.enum(['SEEKER', 'GUIDE']),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_ACCESS_SECRET, {
        expiresIn: env_1.env.JWT_ACCESS_EXPIRES_IN,
    });
}
function signRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_REFRESH_SECRET, {
        expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN,
    });
}
function setRefreshCookie(res, refreshToken) {
    const isProd = env_1.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProd,
        // Needed for cross-site cookies (Vercel frontend -> Railway API) in production.
        // Browsers require SameSite=None cookies to also be Secure.
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
}
function sanitizeUser(user) {
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl ?? null,
    };
}
exports.authService = {
    // ── Email/Password Registration ──────────────────────────
    async register(rawData, res) {
        const parsed = registerSchema.safeParse(rawData);
        if (!parsed.success) {
            throw new errors_1.ValidationError('Invalid registration data');
        }
        const { email, password, firstName, lastName, role } = parsed.data;
        const existing = await userRepository_1.userRepository.findByEmail(email);
        if (existing) {
            throw new errors_1.AppError('Email already in use', 409);
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const user = await userRepository_1.userRepository.createUser({
            email,
            passwordHash,
            role,
            firstName,
            lastName,
            authProvider: 'EMAIL',
        });
        const accessToken = signAccessToken({ sub: user.id, role: user.role });
        const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
        setRefreshCookie(res, refreshToken);
        return {
            user: sanitizeUser(user),
            accessToken,
        };
    },
    // ── Email/Password Login ─────────────────────────────────
    async login(rawData, res) {
        const parsed = loginSchema.safeParse(rawData);
        if (!parsed.success) {
            throw new errors_1.ValidationError('Invalid login data');
        }
        const { email, password } = parsed.data;
        const user = await userRepository_1.userRepository.findByEmail(email);
        if (!user || !user.passwordHash) {
            throw new errors_1.AuthError('Invalid credentials', 401);
        }
        const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!valid) {
            throw new errors_1.AuthError('Invalid credentials', 401);
        }
        const accessToken = signAccessToken({ sub: user.id, role: user.role });
        const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
        setRefreshCookie(res, refreshToken);
        return {
            user: sanitizeUser(user),
            accessToken,
        };
    },
    // ── Google OAuth ─────────────────────────────────────────
    async googleAuth(idToken, res) {
        if (!env_1.env.GOOGLE_CLIENT_ID) {
            throw new errors_1.AppError('Google OAuth is not configured', 501);
        }
        // Verify Google ID token by calling Google's tokeninfo endpoint
        const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        if (!googleRes.ok) {
            throw new errors_1.AuthError('Invalid Google token', 401);
        }
        const payload = (await googleRes.json());
        if (payload.email === undefined) {
            throw new errors_1.AuthError('Google token missing email', 401);
        }
        // Check if user already exists by Google ID or email
        let user = await userRepository_1.userRepository.findByGoogleId(payload.sub);
        if (!user) {
            // Check if a user with this email exists (e.g. registered with password)
            user = await userRepository_1.userRepository.findByEmail(payload.email);
            if (user) {
                // Link Google account to existing user
                const updateData = {
                    googleId: payload.sub,
                    isEmailVerified: true,
                };
                const avatarUrl = user.avatarUrl ?? payload.picture;
                if (avatarUrl) {
                    updateData.avatarUrl = avatarUrl;
                }
                user = await userRepository_1.userRepository.updateUser(user.id, updateData);
            }
            else {
                // Create new user
                const createData = {
                    email: payload.email,
                    firstName: payload.given_name ?? '',
                    lastName: payload.family_name ?? '',
                    role: 'SEEKER',
                    googleId: payload.sub,
                    authProvider: 'GOOGLE',
                    isEmailVerified: true,
                };
                if (payload.picture) {
                    createData.avatarUrl = payload.picture;
                }
                user = await userRepository_1.userRepository.createUser(createData);
            }
        }
        const accessToken = signAccessToken({ sub: user.id, role: user.role });
        const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
        setRefreshCookie(res, refreshToken);
        return {
            user: sanitizeUser(user),
            accessToken,
        };
    },
    // ── LinkedIn OAuth (Authorization Code flow) ─────────────
    async linkedinAuth(code, res) {
        if (!env_1.env.LINKEDIN_CLIENT_ID || !env_1.env.LINKEDIN_CLIENT_SECRET || !env_1.env.LINKEDIN_REDIRECT_URI) {
            throw new errors_1.AppError('LinkedIn OAuth is not configured', 501);
        }
        // Exchange authorization code for access token
        const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: env_1.env.LINKEDIN_REDIRECT_URI,
                client_id: env_1.env.LINKEDIN_CLIENT_ID,
                client_secret: env_1.env.LINKEDIN_CLIENT_SECRET,
            }),
        });
        if (!tokenRes.ok) {
            const errorData = await tokenRes.text();
            console.error('LinkedIn token exchange error:', errorData);
            throw new errors_1.AuthError(`Failed to exchange LinkedIn code: ${errorData}`, 401);
        }
        const tokenData = (await tokenRes.json());
        if (!tokenData.access_token) {
            throw new errors_1.AuthError('No access token received from LinkedIn', 401);
        }
        // Get user profile using the access token (OpenID Connect endpoint)
        const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!profileRes.ok) {
            const errorData = await profileRes.text();
            console.error('LinkedIn profile fetch error:', errorData);
            throw new errors_1.AuthError(`Failed to fetch LinkedIn profile: ${errorData}`, 401);
        }
        const profile = (await profileRes.json());
        if (!profile.sub || !profile.email) {
            throw new errors_1.AuthError('LinkedIn profile missing required fields', 401);
        }
        // Check if user already exists
        let user = await userRepository_1.userRepository.findByLinkedinId(profile.sub);
        if (!user) {
            user = await userRepository_1.userRepository.findByEmail(profile.email);
            if (user) {
                const updateData = {
                    linkedinId: profile.sub,
                    isEmailVerified: true,
                };
                const avatarUrl = user.avatarUrl ?? profile.picture;
                if (avatarUrl) {
                    updateData.avatarUrl = avatarUrl;
                }
                user = await userRepository_1.userRepository.updateUser(user.id, updateData);
            }
            else {
                const createData = {
                    email: profile.email,
                    firstName: profile.given_name ?? '',
                    lastName: profile.family_name ?? '',
                    role: 'SEEKER',
                    linkedinId: profile.sub,
                    authProvider: 'LINKEDIN',
                    isEmailVerified: true,
                };
                if (profile.picture) {
                    createData.avatarUrl = profile.picture;
                }
                user = await userRepository_1.userRepository.createUser(createData);
            }
        }
        const accessToken = signAccessToken({ sub: user.id, role: user.role });
        const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
        setRefreshCookie(res, refreshToken);
        return {
            user: sanitizeUser(user),
            accessToken,
        };
    },
    // ── Get current user from token ──────────────────────────
    async me(userId) {
        const user = await userRepository_1.userRepository.findById(userId);
        if (!user) {
            throw new errors_1.AuthError('User not found', 404);
        }
        return { user: sanitizeUser(user) };
    },
    // ── Refresh access token ─────────────────────────────────
    async refresh(refreshTokenValue, res) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshTokenValue, env_1.env.JWT_REFRESH_SECRET);
            const user = await userRepository_1.userRepository.findById(decoded.sub);
            if (!user) {
                throw new errors_1.AuthError('User not found', 401);
            }
            const accessToken = signAccessToken({ sub: user.id, role: user.role });
            const newRefreshToken = signRefreshToken({ sub: user.id, role: user.role });
            setRefreshCookie(res, newRefreshToken);
            return {
                user: sanitizeUser(user),
                accessToken,
            };
        }
        catch {
            throw new errors_1.AuthError('Invalid or expired refresh token', 401);
        }
    },
    // ── Logout ───────────────────────────────────────────────
    logout(res) {
        const isProd = env_1.env.NODE_ENV === 'production';
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
        });
        return { message: 'Logged out' };
    },
};
//# sourceMappingURL=authService.js.map