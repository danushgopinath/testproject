import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Compass className="h-8 w-8 text-primary" />
      </div>
      <p className="text-5xl font-bold text-text-primary">404</p>
      <h1 className="mt-2 text-lg font-semibold text-text-primary">Page not found</h1>
      <p className="mt-1 max-w-sm text-sm text-text-muted">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-background transition-colors">
          Go home
        </Link>
        <Link to="/guides" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors" style={{ color: 'white' }}>
          Find Mentors
        </Link>
      </div>
    </div>
  )
}