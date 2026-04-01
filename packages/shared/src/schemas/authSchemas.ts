import { z } from 'zod'

export const userRoleSchema = z.enum(['SEEKER', 'GUIDE', 'ADMIN'])

const registerSchemaBase = z.object({
  role: userRoleSchema.refine((r) => r === 'SEEKER' || r === 'GUIDE', {
    message: 'Role must be SEEKER or GUIDE',
  }),
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required'),
  email: z
    .string()
    .trim()
    .min(5, 'Email must be at least 5 characters')
    .max(254, 'Email must be at most 254 characters')
    .email('Enter a valid email')
    .refine((value) => !/\s/.test(value), {
      message: 'Email cannot contain spaces',
    })
    // Guard against obvious typos like "gmail.comasdf"
    .refine(
      (value) => !/\.(com|net|org|edu|io|co)[a-zA-Z]/i.test(value),
      {
        message: 'Enter a valid email address',
      }
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
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

