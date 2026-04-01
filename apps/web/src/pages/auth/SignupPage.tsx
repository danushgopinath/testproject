import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Button } from '../../components/atoms/Button'
import { registerSchema, type RegisterFormInput, type RegisterInput } from '@expertify/shared'
import { useAuthStore } from '../../stores/authStore'
import { AxiosError } from 'axios'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID as string | undefined
const LINKEDIN_REDIRECT_URI = import.meta.env.VITE_LINKEDIN_REDIRECT_URI as string | undefined

export function SignupPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const { register: registerUser, googleLogin, isLoading } = useAuthStore()
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    trigger,
  } = useForm<RegisterFormInput>({
    // Use synchronous Zod resolver so validation errors are handled by RHF
    // instead of showing as uncaught promise rejections in the console.
    resolver: zodResolver(registerSchema, undefined, { mode: 'sync' }),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      role: 'SEEKER',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const password = watch('password')
  const confirmPassword = watch('confirmPassword')

  // Re-validate confirmPassword when password or confirmPassword changes (only if both have values)
  useEffect(() => {
    if (confirmPassword && password && confirmPassword.length > 0 && password.length > 0) {
      // Use setTimeout to avoid validation during typing
      const timeoutId = setTimeout(() => {
        trigger('confirmPassword').catch(() => {
          // Silently handle validation errors - they're already shown in the UI
        })
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [password, confirmPassword, trigger])

  const onSubmit = async (values: RegisterFormInput) => {
    // Double-check passwords match before submission
    if (values.password !== values.confirmPassword) {
      setApiError("Passwords don't match")
      return
    }

    setApiError(null)
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = values
      await registerUser(registerData as RegisterInput)
      navigate('/dashboard')
    } catch (err) {
      // Handle network errors (no response)
      if (err instanceof AxiosError) {
        if (!err.response) {
          // Network error or timeout
          const errorMessage = err.code === 'ECONNABORTED' 
            ? 'Request timed out. Please check your connection and try again.'
            : err.message?.includes('Network Error')
            ? 'Network error. Please check if the API server is running and accessible.'
            : `Connection error: ${err.message || 'Unable to reach the server'}`
          setApiError(errorMessage)
        } else {
          // API returned an error response
          const errorMessage = err.response?.data?.message ?? err.message ?? 'Registration failed. Please try again.'
          setApiError(errorMessage)
        }
      } else if (err instanceof Error) {
        setApiError(err.message || 'Something went wrong. Please try again.')
      } else {
        setApiError('Something went wrong. Please try again.')
      }
    }
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) return

    const initializeGoogle = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: { credential: string }) => {
            setApiError(null)
            try {
              await googleLogin(response.credential)
              navigate('/dashboard')
            } catch (err) {
              if (err instanceof AxiosError) {
                setApiError(err.response?.data?.message ?? 'Google sign-up failed.')
              } else {
                setApiError('Google sign-up failed. Please try again.')
              }
            }
          },
        })
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signup_with',
          width: '220',
        })
      }
    }

    if (window.google) {
      initializeGoogle()
    } else {
      // Wait for Google SDK to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle)
          initializeGoogle()
        }
      }, 100)
      return () => clearInterval(checkGoogle)
    }
  }, [GOOGLE_CLIENT_ID, googleLogin, navigate])

  const handleLinkedInSignup = () => {
    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_REDIRECT_URI) {
      setApiError('LinkedIn Sign-In is not configured yet.')
      return
    }
    const scope = 'openid profile email'
    const state = crypto.randomUUID()
    sessionStorage.setItem('linkedin_state', state)
    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&scope=${encodeURIComponent(scope)}&state=${state}`
    window.location.href = url
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8 rounded-2xl border border-border bg-surface p-8 shadow-sm md:p-10">
        {/* Header */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-text-primary">Create Your Account</h1>
            <p className="text-sm text-text-muted">
              Join Expertify to connect with mentors or share your journey
            </p>
          </div>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="flex items-center gap-2 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {apiError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="block text-sm font-medium text-text-primary">
                First name
              </label>
              <input
                id="firstName"
                placeholder="John"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-xs text-error">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="lastName" className="block text-sm font-medium text-text-primary">
                Last name
              </label>
              <input
                id="lastName"
                placeholder="Doe"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-xs text-error">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-text-primary">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                className="w-full rounded-lg border border-border bg-background pl-11 pr-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-error">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-text-primary">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Enter your password"
                className="w-full rounded-lg border border-border bg-background pl-11 pr-11 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-error">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Confirm your password"
                className="w-full rounded-lg border border-border bg-background pl-11 pr-11 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-error">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Show validation errors summary if any */}
          {(errors.firstName || errors.lastName || errors.email || errors.password || errors.confirmPassword) && (
            <div className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
              <p className="font-medium">Please fix the following errors:</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                {errors.firstName && <li>{errors.firstName.message}</li>}
                {errors.lastName && <li>{errors.lastName.message}</li>}
                {errors.email && <li>{errors.email.message}</li>}
                {errors.password && <li>{errors.password.message}</li>}
                {errors.confirmPassword && <li>{errors.confirmPassword.message}</li>}
              </ul>
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={isSubmitting || isLoading}
            className="py-3 text-base"
          >
            {isLoading || isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface px-3 text-text-muted tracking-wide">Or continue with</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center justify-center">
            <div ref={googleButtonRef} className="w-full max-w-[220px]"></div>
          </div>
          <button
            type="button"
            onClick={handleLinkedInSignup}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2.5 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-background disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#0077B5">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.065 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </button>
        </div>

        {/* Sign in link */}
        <p className="text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

