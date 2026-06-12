import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { Response } from 'express'
import { z } from 'zod'
import { userRepository } from '../repositories/userRepository'
import { AppError, AuthError, ValidationError } from '../utils/errors'
import { env } from '../config/env'
import { logger } from '../config/logger'
import { getSignedUrl } from '../utils/s3'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['SEEKER', 'GUIDE']),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

function signAccessToken(payload: object): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions)
}

function signRefreshToken(payload: object): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions)
}

function setRefreshCookie(res: Response, refreshToken: string) {
  const isProd = env.NODE_ENV === 'production'
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    // Needed for cross-site cookies (Vercel frontend -> Railway API) in production.
    // Browsers require SameSite=None cookies to also be Secure.
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
}

async function sanitizeUser(user: { id: string; email: string; role: string; firstName: string; lastName: string; avatarUrl?: string | null }) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: await resolveAvatarUrl(user.avatarUrl ?? null),
  }
}

/**
 * `User.avatarUrl` stores either:
 *   - a full external URL (Google/LinkedIn profile pictures), or
 *   - an S3 object key like "avatars/{userId}/{ts}-{file}"
 * If it's an S3 key we resolve to a presigned download URL (24h).
 */
async function resolveAvatarUrl(value: string | null): Promise<string | null> {
  if (!value) return null
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  try {
    // 24h presigned URL — refreshed on every /auth/refresh or page reload
    return await getSignedUrl(value, 24 * 60 * 60)
  } catch {
    return null
  }
}

export const authService = {
  // ── Email/Password Registration ──────────────────────────
  async register(rawData: unknown, res: Response) {
    const parsed = registerSchema.safeParse(rawData)
    if (!parsed.success) {
      throw new ValidationError('Invalid registration data')
    }
    const { email, password, firstName, lastName, role } = parsed.data

    const existing = await userRepository.findByEmail(email)
    if (existing) {
      throw new AppError('Email already in use', 409)
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await userRepository.createUser({
      email,
      passwordHash,
      role,
      firstName,
      lastName,
      authProvider: 'EMAIL',
    })

    const accessToken = signAccessToken({ sub: user.id, role: user.role })
    const refreshToken = signRefreshToken({ sub: user.id, role: user.role })
    setRefreshCookie(res, refreshToken)

    return {
      user: await sanitizeUser(user),
      accessToken,
    }
  },

  // ── Email/Password Login ─────────────────────────────────
  async login(rawData: unknown, res: Response) {
    const parsed = loginSchema.safeParse(rawData)
    if (!parsed.success) {
      throw new ValidationError('Invalid login data')
    }
    const { email, password } = parsed.data
    const user = await userRepository.findByEmail(email)
    if (!user || !user.passwordHash) {
      throw new AuthError('Invalid credentials', 401)
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      throw new AuthError('Invalid credentials', 401)
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role })
    const refreshToken = signRefreshToken({ sub: user.id, role: user.role })
    setRefreshCookie(res, refreshToken)

    return {
      user: await sanitizeUser(user),
      accessToken,
    }
  },

  // ── Google OAuth ─────────────────────────────────────────
  async googleAuth(idToken: string, res: Response) {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new AppError('Google OAuth is not configured', 501)
    }

    // Verify Google ID token by calling Google's tokeninfo endpoint
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    )
    if (!googleRes.ok) {
      throw new AuthError('Invalid Google token', 401)
    }

    const payload = (await googleRes.json()) as {
      aud: string
      sub: string
      email: string
      given_name?: string
      family_name?: string
      picture?: string
      email_verified?: string
    }

    if (payload.aud !== env.GOOGLE_CLIENT_ID) {
      throw new AuthError('Google token audience mismatch', 401)
    }

    if (payload.email_verified !== 'true') {
      throw new AuthError('Google account email is not verified', 401)
    }

    if (payload.email === undefined) {
      throw new AuthError('Google token missing email', 401)
    }

    // Check if user already exists by Google ID or email
    let user = await userRepository.findByGoogleId(payload.sub)

    if (!user) {
      // Check if a user with this email exists (e.g. registered with password)
      user = await userRepository.findByEmail(payload.email)
      if (user) {
        // Link Google account to existing user
        const updateData: {
          googleId: string
          avatarUrl?: string
          isEmailVerified: boolean
        } = {
          googleId: payload.sub,
          isEmailVerified: true,
        }
        const avatarUrl = user.avatarUrl ?? payload.picture
        if (avatarUrl) {
          updateData.avatarUrl = avatarUrl
        }
        user = await userRepository.updateUser(user.id, updateData)
      } else {
        // Create new user
        const createData: {
          email: string
          firstName: string
          lastName: string
          role: 'SEEKER'
          googleId: string
          authProvider: 'GOOGLE'
          avatarUrl?: string
          isEmailVerified: boolean
        } = {
          email: payload.email,
          firstName: payload.given_name ?? '',
          lastName: payload.family_name ?? '',
          role: 'SEEKER',
          googleId: payload.sub,
          authProvider: 'GOOGLE',
          isEmailVerified: true,
        }
        if (payload.picture) {
          createData.avatarUrl = payload.picture
        }
        user = await userRepository.createUser(createData)
      }
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role })
    const refreshToken = signRefreshToken({ sub: user.id, role: user.role })
    setRefreshCookie(res, refreshToken)

    return {
      user: await sanitizeUser(user),
      accessToken,
    }
  },

  // ── LinkedIn OAuth (Authorization Code flow) ─────────────
  async linkedinAuth(code: string, res: Response) {
    if (!env.LINKEDIN_CLIENT_ID || !env.LINKEDIN_CLIENT_SECRET || !env.LINKEDIN_REDIRECT_URI) {
      throw new AppError('LinkedIn OAuth is not configured', 501)
    }

    // Exchange authorization code for access token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: env.LINKEDIN_REDIRECT_URI,
        client_id: env.LINKEDIN_CLIENT_ID,
        client_secret: env.LINKEDIN_CLIENT_SECRET,
      }),
    })

    if (!tokenRes.ok) {
      const errorData = await tokenRes.text()
      logger.error('LinkedIn token exchange error', { errorData })
      throw new AuthError(`Failed to exchange LinkedIn code: ${errorData}`, 401)
    }

    const tokenData = (await tokenRes.json()) as { access_token: string }
    if (!tokenData.access_token) {
      throw new AuthError('No access token received from LinkedIn', 401)
    }

    // Get user profile using the access token (OpenID Connect endpoint)
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!profileRes.ok) {
      const errorData = await profileRes.text()
      logger.error('LinkedIn profile fetch error', { errorData })
      throw new AuthError(`Failed to fetch LinkedIn profile: ${errorData}`, 401)
    }

    const profile = (await profileRes.json()) as {
      sub: string
      email: string
      given_name?: string
      family_name?: string
      picture?: string
    }

    if (!profile.sub || !profile.email) {
      throw new AuthError('LinkedIn profile missing required fields', 401)
    }

    // Check if user already exists
    let user = await userRepository.findByLinkedinId(profile.sub)

    if (!user) {
      user = await userRepository.findByEmail(profile.email)
      if (user) {
        const updateData: {
          linkedinId: string
          avatarUrl?: string
          isEmailVerified: boolean
        } = {
          linkedinId: profile.sub,
          isEmailVerified: true,
        }
        const avatarUrl = user.avatarUrl ?? profile.picture
        if (avatarUrl) {
          updateData.avatarUrl = avatarUrl
        }
        user = await userRepository.updateUser(user.id, updateData)
      } else {
        const createData: {
          email: string
          firstName: string
          lastName: string
          role: 'SEEKER'
          linkedinId: string
          authProvider: 'LINKEDIN'
          avatarUrl?: string
          isEmailVerified: boolean
        } = {
          email: profile.email,
          firstName: profile.given_name ?? '',
          lastName: profile.family_name ?? '',
          role: 'SEEKER',
          linkedinId: profile.sub,
          authProvider: 'LINKEDIN',
          isEmailVerified: true,
        }
        if (profile.picture) {
          createData.avatarUrl = profile.picture
        }
        user = await userRepository.createUser(createData)
      }
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role })
    const refreshToken = signRefreshToken({ sub: user.id, role: user.role })
    setRefreshCookie(res, refreshToken)

    return {
      user: await sanitizeUser(user),
      accessToken,
    }
  },

  // ── Get current user from token ──────────────────────────
  async me(userId: string) {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AuthError('User not found', 404)
    }
    return { user: await sanitizeUser(user) }
  },

  // ── Refresh access token ─────────────────────────────────
  async refresh(refreshTokenValue: string, res: Response) {
    try {
      const decoded = jwt.verify(refreshTokenValue, env.JWT_REFRESH_SECRET) as {
        sub: string
        role: string
      }
      const user = await userRepository.findById(decoded.sub)
      if (!user) {
        throw new AuthError('User not found', 401)
      }

      const accessToken = signAccessToken({ sub: user.id, role: user.role })
      const newRefreshToken = signRefreshToken({ sub: user.id, role: user.role })
      setRefreshCookie(res, newRefreshToken)

      return {
        user: await sanitizeUser(user),
        accessToken,
      }
    } catch {
      throw new AuthError('Invalid or expired refresh token', 401)
    }
  },

  // ── Logout ───────────────────────────────────────────────
  logout(res: Response) {
    const isProd = env.NODE_ENV === 'production'
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    })
    return { message: 'Logged out' }
  },
}
