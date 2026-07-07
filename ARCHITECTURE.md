# Expertify — Architecture & File Guide

A **Turborepo monorepo** with three workspaces:

- `apps/api` — Express + Prisma + Postgres backend (deployed on Railway)
- `apps/web` — React + Vite + TanStack Query frontend (deployed on Vercel)
- `packages/shared` — code shared between api & web

---

## Monorepo root

- **package.json** — Turbo scripts: `dev` (runs api + web together), `build`, `build:api`, `test`, `lint`.
- **packages/shared/**
  - **src/schemas/authSchemas.ts** — Zod schemas for auth payloads (login/register), shared front ↔ back.
  - **src/index.ts** — package barrel export.

---

## `apps/api` — backend

### Bootstrap & config

| File | Responsibility |
|---|---|
| `src/server.ts` | Express app entry. CORS, `express.json`, cookie-parser, morgan; mounts all route groups under `/api/v1/*` (`auth, guides, dashboard, onboarding, sessions, messages, users, notifications, reviews`); `errorHandler` last; listens on `PORT`. |
| `src/config/env.ts` | Loads `.env`, validates all env vars with Zod (DB, JWT secrets, SMTP, AWS/S3, Google/LinkedIn, `DAILY_*`). Throws if invalid. |
| `src/config/prisma.ts` | Instantiates the Prisma client with the `@prisma/adapter-pg` Postgres pool. Single shared `prisma` export. |
| `src/config/logger.ts` | Logger instance. |

### Middleware & utils

| File | Responsibility |
|---|---|
| `src/middleware/requireAuth.ts` | Verifies the `Bearer` JWT access token, attaches `req.auth = { userId, role }`; 401 "Missing token" if absent. |
| `src/middleware/errorHandler.ts` | Central error handler; turns `AppError` into `{status,message}` with the right HTTP code. |
| `src/utils/errors.ts` | `AppError`, `AuthError`, `ValidationError` classes (message + statusCode). |
| `src/utils/catchAsync.ts` | Wraps async controllers so thrown errors reach `errorHandler`. |
| `src/utils/email.ts` | Nodemailer transporter (no-op if SMTP unset) + the 4 session emails (booking placed, new request, declined, confirmed). Table-based HTML via shared `layout()`, `detailsCard()`, `note()` helpers. |
| `src/utils/s3.ts` | AWS S3 helpers: signed URLs, `deletePrefix()` for account-deletion cleanup. |

### Data model

| File | Responsibility |
|---|---|
| `prisma/schema.prisma` | Models: `User`, `SeekerProfile`, `GuideProfile` (+ `availability`, `timezone`), `Education`, `Experience`, `Session`, `SessionCall` (Daily room), `Review`, `Message`, `Notification`, `Journey`; enums `SessionStatus`, `NotificationType`, roles. |

### Request pipeline (Routes → Controllers → Services)

Routes are thin (`route → requireAuth → controller`); controllers parse the request and authorize; services hold business logic + Prisma access.

**Auth**
- `routes/authRoutes.ts` · `controllers/authController.ts` · `services/authService.ts` — register/login/Google/LinkedIn/refresh/logout/me. Sets the httpOnly refresh cookie **and** returns the refresh token in the body (cross-domain fallback for third-party-cookie blockers). `sanitizeUser` resolves avatar URLs.

**Guides (public browse)**
- `guideRoutes` · `guideController` · `services/guideService.ts` — public guide list & detail. Derives `university`, `currentCompany`, `degrees[]` from education/experience; resolves avatars; returns `availability` + `timezone`.
- `repositories/guideRepository.ts` — Prisma queries for guide list/detail (includes user, education, experience, reviews, journeys).

**Onboarding (become/edit mentor)**
- `onboardingRoutes` · `onboardingController` · `services/onboardingService.ts` — upserts `GuideProfile` (bio, rate, specializations, availability, **timezone**, education, experience, resume → S3); `PATCH /availability` (with timezone); `getMyProfile`, `getOnboardingStatus`.

**Dashboard**
- `dashboardRoutes` · `dashboardController` · `services/dashboardService.ts` — `getMyProfile`, `getNotifications` (badge counts), `getSeekerDashboard`/`getGuideDashboard` (stats + upcoming + past + last-message-per-conversation), `getSeekerSessions`/`getGuideSessions`, seeker/guide analytics. Contains the **global `autoUpdateSessions()`** sweep (CONFIRMED→COMPLETED / PENDING→CANCELLED by elapsed time).

**Sessions**
- `sessionRoutes` · `sessionController` · `services/sessionService.ts` — create (12h lead time, self-book/duplicate guards, notifies + emails), accept, decline, **cancel** (tiered refund), **join** (video).
  - `services/session/cancellation.ts` (+ `.test.ts`) — pure `calculateRefund` policy (PENDING free; >24h full; 12–24h 50%; 3–12h 25%; <3h none).
  - `services/video/joinWindow.ts` (+ `.test.ts`) — pure join-window calc (opens before start, grace after end). **Note: currently a 2-day test window; revert `OPEN_LEAD_MS` to 10 min before production.**
  - `services/video/joinEligibility.ts` (+ `.test.ts`) — pure decision: participant? confirmed? in window? → role / reason.
  - `services/dailyService.ts` — Daily.co REST wrapper: create private 2-person room (idempotent — reuses an existing room), mint per-user meeting token; normalizes `DAILY_DOMAIN`.

**Messaging**
- `messageRoutes` · `messageController` · `services/messageService.ts` — role-scoped conversations (seeker↔guides / guide↔seekers), thread, send (requires a session relationship; emits a notification), **delete message** (sender-only), **delete conversation**.

**Notifications**
- `notificationRoutes` · `notificationController` · `services/notificationService.ts` — list, unread count, mark read / mark all read; `create()` used across services.

**Reviews**
- `reviewRoutes` · `reviewController` · `services/reviewService.ts` — `GET /reviews/mine` (seeker's completed sessions + existing review), `POST /reviews` (validates completed/owner/one-per-session, recomputes guide `averageRating`).

**Users**
- `userRoutes` · `userController` · `services/userService.ts` — `POST /me/avatar` (S3 upload), `deleteAccount` (wipes S3 then Postgres).
- `repositories/userRepository.ts` — user Prisma queries.

---

## `apps/web` — frontend

### Entry & shell

| File | Responsibility |
|---|---|
| `src/main.tsx` | React root, QueryClient provider, router. |
| `src/App.tsx` | All routes; `ProtectedRoute` wrapper; runs `initialize()` on load. *(Team route currently commented out.)* |
| `src/components/templates/Layout.tsx` | Global nav (dark landing vs light dashboard), user menu, notifications bell, Seeker/Guide `RoleSwitcher`, footer. Role switch navigates to `/dashboard`. |
| `src/index.css`, `src/App.css` | Tailwind + globals. |

### State / services / hooks

| File | Responsibility |
|---|---|
| `src/stores/authStore.ts` | Zustand auth store **persisted to localStorage** (user, accessToken, refreshToken, dashboardRole); `login/register/google/linkedin/refresh/logout/initialize`; sets the axios auth header on rehydrate. |
| `src/services/apiClient.ts` | Axios instance; 401 interceptor auto-refreshes (sends refresh token in body) and retries. |
| `src/services/onboardingService.ts` | Onboarding API calls incl. `updateAvailability(availability, timezone)`. |
| `src/hooks/useDashboard.ts` | `useMyProfile`, `useNotifications` (both **auth-gated**), seeker/guide dashboards, `useSeekerSessions`/`useGuideSessions`, analytics. |
| `src/hooks/useSessions.ts` | `useAccept/DeclineSession`, `useJoinSession`, `useOpenSessionCall` (opens Daily room in a new tab), `useCancelSession` + `RefundInfo`. |
| `src/hooks/useMessages.ts` | `useConversations(role)`, `useThread`, `useSendMessage`, `useDeleteMessage`, `useDeleteConversation`. |
| `src/hooks/useGuides.ts` | `useGuides` (list + client-side facet filtering) and `useGuide` (detail); types include `timezone`. |
| `src/hooks/useReviews.ts` | `useMyReviewables`, `useCreateReview`. |
| `src/hooks/useNotificationsList.ts` | Bell dropdown list + mark-read mutations. |
| `src/hooks/useSettings.ts` | Settings-page data/mutations. |
| `src/lib/timezones.ts` | IANA tz list, `browserTimeZone`, `zonedWallClockToUtc`, `formatTimeInTz`, `tzShortLabel`. |
| `src/lib/refund.ts` | Client mirror of the refund policy (for the cancel modal preview). |
| `src/lib/calendar.ts` | `googleCalendarUrl()` for "Add to calendar". |
| `src/utils/cn.ts` | Tailwind class-merge helper. |
| `src/types/google-one-tap.d.ts` | Google Identity Services typings. |

### Components

| File | Responsibility |
|---|---|
| `components/organisms/MentorOnboardingForm.tsx` | 5-step become/edit-mentor wizard (about, bio/resume, education, experience, expertise + **timezone** + availability). |
| `components/organisms/DashboardSidebar.tsx` | Role-aware left nav (Sessions/Requests/Messages/**Reviews**/analytics). |
| `components/organisms/CancelSessionModal.tsx` | Cancellation confirmation with policy + computed refund/charge. |
| `components/molecules/RoleSwitcher.tsx` | Seeker/Guide pill toggle (equal-width). |
| `components/atoms/Button.tsx` | Base button. |
| `components/ui/beams-background.tsx`, `testimonials-columns.tsx` | Landing visual/marketing components. |

### Pages

- **Public:** `LandingPage`, `AboutPage`, `HowItWorksPage`, `ContactPage` (support@ only), `TeamPage` *(hidden — future build)*, `legal/{PrivacyPolicy, TermsOfService, CookiePolicy}`.
- **Auth:** `auth/{LoginPage, SignupPage, LinkedInCallbackPage}`.
- **Browse / Book:** `GuidesPage` (filters: University/Expertise/Company/Degree), `GuideProfilePage`, `BookSessionPage` (tz-aware slots, scroll-to-top per step, 30/60-min durations).
- **Dashboard:** `DashboardPage` (seeker & guide overview, upcoming/past, cancel buttons, Manage Availability modal), `SessionsPage` (role-aware, cancel + add-to-calendar), `MessagesPage` (role-scoped, delete), `ReviewsPage`, `RequestsPage` (guide), `SeekerRequestsPage`, `ProfilePage`.
- **Analytics:** `analytics/{Earnings, Students, Performance, Spending, Mentors, SessionHistory}`.
- **Settings:** `settings/{Settings, ProfileSettings, EditMentorProfile, Password, Notifications, Privacy, Language, Billing}`.

### Leftover

- `src/data/mentors.ts` — static seed data from early scaffolding; **unused** (the app uses the API). Safe to delete.

---

## Request flow (example: booking a session)

```
BookSessionPage → POST /api/v1/sessions
  → sessionRoutes → requireAuth → sessionController.create
  → sessionService.createSession (validates, writes Session, notifies + emails)
Guide clicks Join → useOpenSessionCall → POST /sessions/:id/join
  → sessionController.join → sessionService.joinSession
  → joinEligibility (pure) + dailyService.createRoom/createMeetingToken
  → returns { roomUrl, token } → opens Daily room in a new tab
```

## Auth flow

```
login/register → authService sets httpOnly refresh cookie + returns { user, accessToken, refreshToken }
authStore persists to localStorage → axios sends Bearer accessToken
on 401 → apiClient interceptor POST /auth/refresh (refresh token from cookie OR body) → retry
on reload → authStore.initialize() refreshes; keeps persisted session if refresh fails
```

## Known follow-ups

- **Join window** is temporarily 2 days (`services/video/joinWindow.ts`) — revert to 10 min before production.
- **Payments** are not wired — refunds are computed/displayed but no money moves.
- **Video Phase B–D** (recording, webhooks, AI summaries, admin monitoring) are future phases.
- `src/data/mentors.ts` is dead code.