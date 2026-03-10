import { z } from 'zod';
export declare const userRoleSchema: z.ZodEnum<["SEEKER", "GUIDE", "ADMIN"]>;
export declare const registerSchema: z.ZodObject<{
    role: z.ZodEffects<z.ZodEnum<["SEEKER", "GUIDE", "ADMIN"]>, "SEEKER" | "GUIDE", "SEEKER" | "GUIDE" | "ADMIN">;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    role: "SEEKER" | "GUIDE";
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}, {
    role: "SEEKER" | "GUIDE" | "ADMIN";
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
