import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '../../components/atoms/Button'
import { apiClient } from '../../services/apiClient'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiClient.post('/auth/forgot-password', { email })
    } catch {
      // Intentionally ignore — we always show the same confirmation to avoid
      // revealing whether an account exists.
    } finally {
      setLoading(false)
      setSent(true)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8 rounded-2xl border border-border bg-surface p-8 shadow-sm md:p-10">
        {sent ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Check your email</h1>
            <p className="text-sm text-text-muted">
              If an account exists for <span className="font-medium text-text-primary">{email}</span>,
              we've sent a link to reset your password. It expires in 30 minutes.
            </p>
            <Link to="/auth/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-text-primary">Forgot your password?</h1>
                <p className="text-sm text-text-muted">Enter your email and we'll send you a reset link.</p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-text-primary">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-border bg-background pl-11 pr-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <Button type="submit" fullWidth disabled={loading || !email} className="py-3 text-base disabled:opacity-60">
                {loading ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>

            <p className="text-center text-sm text-text-muted">
              <Link to="/auth/login" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}