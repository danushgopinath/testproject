import type { Request, Response } from 'express';
export declare function register(req: Request, res: Response): Promise<void>;
export declare function login(req: Request, res: Response): Promise<void>;
export declare function googleAuth(req: Request, res: Response): Promise<void>;
export declare function linkedinAuth(req: Request, res: Response): Promise<void>;
export declare function me(req: Request, res: Response): Promise<void>;
export declare function refresh(req: Request, res: Response): Promise<void>;
export declare function logout(_req: Request, res: Response): Promise<void>;
//# sourceMappingURL=authController.d.ts.map