import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Loader2 } from 'lucide-react'

export function LinkedInCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { linkedinLogin } = useAuthStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')
    const state = searchParams.get('state')
    const savedState = sessionStorage.getItem('linkedin_state')

    if (errorParam) {
      setError(`LinkedIn authorization failed: ${errorParam}`)
      return
    }

    if (!code) {
      setError('No authorization code received from LinkedIn.')
      return
    }

    if (state && savedState && state !== savedState) {
      setError('Invalid state parameter. Please try again.')
      return
    }

    sessionStorage.removeItem('linkedin_state')

    linkedinLogin(code)
      .then(() => {
        const becomeMentor = sessionStorage.getItem('becomeMentor') === 'true'
        navigate(becomeMentor ? '/dashboard?becomeMentor=true' : '/dashboard', { replace: true })
      })
      .catch((err) => {
        console.error('LinkedIn login error:', err)
        if (err instanceof Error) {
          setError(`LinkedIn sign-in failed: ${err.message}`)
        } else {
          setError('LinkedIn sign-in failed. Please try again.')
        }
      })
  }, [searchParams, linkedinLogin, navigate])

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium text-error">{error}</p>
          <button
            onClick={() => navigate('/auth/login')}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="text-center space-y-4">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-text-muted">Signing in with LinkedIn...</p>
      </div>
    </div>
  )
}
