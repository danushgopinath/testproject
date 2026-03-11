import { Navigate } from 'react-router-dom'

export function AboutPage() {
  // About page is now the home page, so redirect to home
  return <Navigate to="/" replace />
}
