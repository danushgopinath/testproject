import type { NextFunction, Request, Response } from 'express';
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;
export declare const catchAsync: (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => Promise<unknown>;
export {};
//# sourceMappingURL=catchAsync.d.ts.map