import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Layout } from './components/templates/Layout'
import { LandingPage } from './pages/LandingPage'
import { GuidesPage } from './pages/GuidesPage'
import { GuideProfilePage } from './pages/GuideProfilePage'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { LinkedInCallbackPage } from './pages/auth/LinkedInCallbackPage'
import { DashboardPage } from './pages/DashboardPage'
import { MessagesPage } from './pages/MessagesPage'
import { SessionsPage } from './pages/SessionsPage'
import { ReviewsPage } from './pages/ReviewsPage'
import { ProfileSettingsPage } from './pages/settings/ProfileSettingsPage'
import { PasswordSettingsPage } from './pages/settings/PasswordSettingsPage'
import { NotificationsSettingsPage } from './pages/settings/NotificationsSettingsPage'
import { PrivacySettingsPage } from './pages/settings/PrivacySettingsPage'
import { BillingSettingsPage } from './pages/settings/BillingSettingsPage'
import { LanguageSettingsPage } from './pages/settings/LanguageSettingsPage'
import { SettingsPage } from './pages/settings/SettingsPage'
import { EditMentorProfilePage } from './pages/settings/EditMentorProfilePage'
import { HowItWorksPage } from './pages/HowItWorksPage'
import { PrivacyPolicyPage } from './pages/legal/PrivacyPolicyPage'
import { TermsOfServicePage } from './pages/legal/TermsOfServicePage'
import { CookiePolicyPage } from './pages/legal/CookiePolicyPage'
import { ProfilePage } from './pages/ProfilePage'
import { BookSessionPage } from './pages/BookSessionPage'
import { AboutPage } from './pages/AboutPage'
// import { TeamPage } from './pages/TeamPage' // Hidden — ships in a future build
import { ContactPage } from './pages/ContactPage'
import { RequestsPage } from './pages/RequestsPage'
import { SeekerRequestsPage } from './pages/SeekerRequestsPage'
import { SpendingAnalyticsPage } from './pages/analytics/SpendingAnalyticsPage'
import { MentorsAnalyticsPage } from './pages/analytics/MentorsAnalyticsPage'
import { SessionHistoryPage } from './pages/analytics/SessionHistoryPage'
import { EarningsAnalyticsPage } from './pages/analytics/EarningsAnalyticsPage'
import { StudentsAnalyticsPage } from './pages/analytics/StudentsAnalyticsPage'
import { PerformanceAnalyticsPage } from './pages/analytics/PerformanceAnalyticsPage'
import { useAuthStore } from './stores/authStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuthStore()

  if (!isInitialized) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuthStore()

  if (!isInitialized) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export function App() {
  const { initialize } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    initialize()
  }, [initialize])

  // Always scroll to top when the route (pathname) changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/guides" element={<GuidesPage />} />
        <Route path="/guides/:id" element={<GuideProfilePage />} />
        <Route
          path="/guides/:id/book"
          element={
            <ProtectedRoute>
              <BookSessionPage />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/team" element={<TeamPage />} /> */} {/* Hidden — ships in a future build */}
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/cookie-policy" element={<CookiePolicyPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Auth routes — redirect to dashboard if already logged in */}
        <Route path="/auth/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/auth/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
        <Route path="/auth/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/linkedin/callback" element={<LinkedInCallbackPage />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
        <Route path="/dashboard/seeker-requests" element={<ProtectedRoute><SeekerRequestsPage /></ProtectedRoute>} />
        <Route path="/dashboard/reviews" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
        <Route path="/dashboard/analytics/spending" element={<ProtectedRoute><SpendingAnalyticsPage /></ProtectedRoute>} />
        <Route path="/dashboard/analytics/mentors" element={<ProtectedRoute><MentorsAnalyticsPage /></ProtectedRoute>} />
        <Route path="/dashboard/analytics/sessions" element={<ProtectedRoute><SessionHistoryPage /></ProtectedRoute>} />
        <Route path="/dashboard/analytics/earnings" element={<ProtectedRoute><EarningsAnalyticsPage /></ProtectedRoute>} />
        <Route path="/dashboard/analytics/students" element={<ProtectedRoute><StudentsAnalyticsPage /></ProtectedRoute>} />
        <Route path="/dashboard/analytics/performance" element={<ProtectedRoute><PerformanceAnalyticsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/settings/profile" element={<ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>} />
        <Route path="/settings/password" element={<ProtectedRoute><PasswordSettingsPage /></ProtectedRoute>} />
        <Route path="/settings/notifications" element={<ProtectedRoute><NotificationsSettingsPage /></ProtectedRoute>} />
        <Route path="/settings/privacy" element={<ProtectedRoute><PrivacySettingsPage /></ProtectedRoute>} />
        <Route path="/settings/billing" element={<ProtectedRoute><BillingSettingsPage /></ProtectedRoute>} />
        <Route path="/settings/language" element={<ProtectedRoute><LanguageSettingsPage /></ProtectedRoute>} />
        <Route path="/settings/mentor" element={<ProtectedRoute><EditMentorProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}
