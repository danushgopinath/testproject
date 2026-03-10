import { z } from 'zod';
export const userRoleSchema = z.enum(['SEEKER', 'GUIDE', 'ADMIN']);
export const registerSchema = z.object({
    role: userRoleSchema.refine((r) => r === 'SEEKER' || r === 'GUIDE', {
        message: 'Role must be SEEKER or GUIDE',
    }),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});
export const loginSchema = z.object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});
