export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
export declare class AuthError extends AppError {
    constructor(message?: string, statusCode?: number);
}
export declare class ValidationError extends AppError {
    constructor(message?: string, statusCode?: number);
}
//# sourceMappingURL=errors.d.ts.map