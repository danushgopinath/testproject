import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/errors'
import { logger } from '../config/logger'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  let error = err

  if (!(err instanceof AppError)) {
    logger.error('Unexpected error', { err })
    error = new AppError('Something went wrong', 500, false)
  }

  const appError = error as AppError

  res.status(appError.statusCode).json({
    status: 'error',
    message: appError.message,
  })
}

