export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Object.setPrototypeOf(this, new.target.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

export class AuthError extends AppError {
  constructor(message = 'Unauthorized', statusCode = 401) {
    super(message, statusCode)
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', statusCode = 400) {
    super(message, statusCode)
  }
}

