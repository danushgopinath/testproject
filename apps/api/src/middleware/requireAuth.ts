import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { AuthError } from '../utils/errors'

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string
    role?: string
  }
}

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AuthError('Missing token', 401))
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return next(new AuthError('Missing token', 401))
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      sub?: string
      role?: string
    }
    if (!decoded.sub) {
      return next(new AuthError('Invalid token', 401))
    }
    req.auth = { userId: decoded.sub, ...(decoded.role !== undefined && { role: decoded.role }) }
    return next()
  } catch {
    return next(new AuthError('Invalid or expired token', 401))
  }
}

