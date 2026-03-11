import { z } from 'zod';
export declare const userRoleSchema: z.ZodEnum<{
    SEEKER: "SEEKER";
    GUIDE: "GUIDE";
    ADMIN: "ADMIN";
}>;
declare const registerSchemaBase: z.ZodObject<{
    role: z.ZodEnum<{
        SEEKER: "SEEKER";
        GUIDE: "GUIDE";
        ADMIN: "ADMIN";
    }> & z.ZodType<"SEEKER" | "GUIDE", "SEEKER" | "GUIDE" | "ADMIN", z.core.$ZodTypeInternals<"SEEKER" | "GUIDE", "SEEKER" | "GUIDE" | "ADMIN">>;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, z.core.$strip>;
export declare const registerSchema: z.ZodObject<{
    role: z.ZodEnum<{
        SEEKER: "SEEKER";
        GUIDE: "GUIDE";
        ADMIN: "ADMIN";
    }> & z.ZodType<"SEEKER" | "GUIDE", "SEEKER" | "GUIDE" | "ADMIN", z.core.$ZodTypeInternals<"SEEKER" | "GUIDE", "SEEKER" | "GUIDE" | "ADMIN">>;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type RegisterInput = Omit<z.infer<typeof registerSchemaBase>, 'confirmPassword'> & {
    password: string;
};
export type RegisterFormInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export {};
