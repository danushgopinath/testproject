import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { authService } from '../services/authService'
import { AuthError } from '../utils/errors'
import { env } from '../config/env'

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body, res)
  res.status(201).json(result)
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body, res)
  res.status(200).json(result)
}

export async function googleAuth(req: Request, res: Response) {
  const { idToken } = req.body as { idToken?: string }
  if (!idToken) {
    throw new AuthError('Missing idToken', 400)
  }
  const result = await authService.googleAuth(idToken, res)
  res.status(200).json(result)
}

export async function linkedinAuth(req: Request, res: Response) {
  const { code } = req.body as { code?: string }
  if (!code) {
    throw new AuthError('Missing authorization code', 400)
  }
  const result = await authService.linkedinAuth(code, res)
  res.status(200).json(result)
}

export async function me(req: Request, res: Response) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Missing token', 401)
  }
  const token = authHeader.split(' ')[1]
  if (!token) {
    throw new AuthError('Missing token', 401)
  }
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string }
    const result = await authService.me(decoded.sub)
    res.status(200).json(result)
  } catch {
    throw new AuthError('Invalid or expired token', 401)
  }
}

export async function refresh(req: Request, res: Response) {
  // Prefer the httpOnly cookie; fall back to a token in the body for clients
  // whose browser drops the third-party cookie (cross-domain Vercel/Railway).
  const refreshToken =
    (req.cookies?.refreshToken as string | undefined) ||
    (req.body?.refreshToken as string | undefined)
  if (!refreshToken) {
    throw new AuthError('No refresh token', 401)
  }
  const result = await authService.refresh(refreshToken, res)
  res.status(200).json(result)
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body
  if (!email || typeof email !== 'string') throw new AuthError('Email is required', 400)
  const result = await authService.requestPasswordReset(email)
  res.status(200).json(result)
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body
  if (!token || typeof token !== 'string') throw new AuthError('Reset token is required', 400)
  if (!password || typeof password !== 'string') throw new AuthError('Password is required', 400)
  const result = await authService.resetPassword(token, password)
  res.status(200).json(result)
}

export async function logout(_req: Request, res: Response) {
  const result = authService.logout(res)
  res.status(200).json(result)
}