"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.AuthError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class AuthError extends AppError {
    constructor(message = 'Unauthorized', statusCode = 401) {
        super(message, statusCode);
    }
}
exports.AuthError = AuthError;
class ValidationError extends AppError {
    constructor(message = 'Validation failed', statusCode = 400) {
        super(message, statusCode);
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=errors.js.map