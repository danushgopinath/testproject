import { z } from 'zod'

export const userRoleSchema = z.enum(['SEEKER', 'GUIDE', 'ADMIN'])

const registerSchemaBase = z.object({
  role: userRoleSchema.refine((r) => r === 'SEEKER' || r === 'GUIDE', {
    message: 'Role must be SEEKER or GUIDE',
  }),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
})

export const registerSchema = registerSchemaBase.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }
)

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// Type for API (without confirmPassword)
export type RegisterInput = Omit<z.infer<typeof registerSchemaBase>, 'confirmPassword'> & {
  password: string
}

// Type for form (with confirmPassword)
export type RegisterFormInput = z.infer<typeof registerSchema>

export type LoginInput = z.infer<typeof loginSchema>

