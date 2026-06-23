# Expertify — Handoff

## Goal of the in-flight work
Harden the booking workflow end-to-end and replace remaining placeholder/mock UI with real data: bookings now require 12h lead time, are notification-driven and email-driven, and use a proper `Notification` model; mentor avatars/availability persist and propagate everywhere; account deletion fully cleans S3 + Postgres; the mentor edit flow and guide analytics are live.

The repository is `github.com/danushgopinath/testproject`, branch `main`. As of this handoff **the working tree is clean and `origin/main` is up to date** — last commit `7bc3a8f`. Nothing is in flight on disk.

---

## What's been done (by area, file, what changed)

### Notification system (new)
- `apps/api/prisma/schema.prisma` — new `Notification` model (`id, userId, type, title, body, link, sessionId, isRead, createdAt`) with indexes on `(userId, createdAt)` and `(userId, isRead)`. New `NotificationType` enum (`SESSION_REQUEST`, `SESSION_ACCEPTED`, `SESSION_DECLINED`, `SESSION_REMINDER`, `SESSION_CANCELLED`, `NEW_MESSAGE`, `BOOKING_PLACED`). `User` got `notifications Notification[]` relation.
- `apps/api/prisma/migrations/20260610000000_add_notifications/migration.sql` — migration applied to dev DB.
- `apps/api/src/services/notificationService.ts` — new: `create`, `list`, `unreadCount`, `markRead`, `markAllRead`.
- `apps/api/src/controllers/notificationController.ts` — new: list / mark-read / mark-all-read.
- `apps/api/src/routes/notificationRoutes.ts` — `GET /`, `PATCH /:id/read`, `PATCH /read-all`. Registered in `apps/api/src/server.ts` under `/api/v1/notifications`.
- `apps/web/src/hooks/useNotificationsList.ts` — new: `useNotificationsList`, `useMarkAllNotificationsRead`, `useMarkNotificationRead`.
- `apps/web/src/components/templates/Layout.tsx` — bell dropdown is now a real notifications list (icon per type, unread dot, relative time, "Mark all read"). Used in both dark (landing) and light (dashboard) navbars via a `NotificationsPanel` component defined at top of the file.

### Booking workflow
- `apps/api/src/services/sessionService.ts`
  - Rejects bookings less than **12 hours** in the future (`minLeadMs = 12*60*60*1000`).
  - Rejects duplicate-slot bookings with the same mentor.
  - Blocks self-booking when `guide.userId === userId`.
  - On create: notifies guide (`SESSION_REQUEST`) and seeker (`BOOKING_PLACED`), emails both (request to guide, "booking placed" to seeker).
  - On accept/decline: notifies both parties + sends emails.
- `apps/api/src/utils/email.ts` — new `sendBookingPlacedEmail`.
- `apps/web/src/pages/BookSessionPage.tsx`
  - Calendar disables any day whose 23:59 is still inside the 12h lead window.
  - Time slots filter to ≥12h from now.
  - Step-4 confirmation banner is amber/Clock-icon with **"Booking Request Sent!"** copy (was green "Confirmed").
  - Detects `user.id === guide.userId` early and renders an amber lock card with **Find Mentors** / **Edit My Profile** buttons instead of the booking flow.
  - Sidebar mentor avatar renders `guide.avatarUrl` when present.

### Session requests pages (real data)
- `apps/web/src/pages/RequestsPage.tsx` — replaced mock data with `useGuidePendingRequests` + live accept/decline.
- `apps/web/src/pages/SeekerRequestsPage.tsx` — new page at `/dashboard/seeker-requests` showing seeker's own pending requests.
- `apps/web/src/components/organisms/DashboardSidebar.tsx` — both roles now show **Sessions → Requests → Messages** in that order under "Manage". Analytics still differs per role.

### Availability persistence
- `apps/api/src/services/onboardingService.ts` — new `updateAvailability(userId, availability)`.
- `apps/api/src/controllers/onboardingController.ts` — new `updateAvailability` handler.
- `apps/api/src/routes/onboardingRoutes.ts` — `PATCH /availability`.
- `apps/api/src/services/dashboardService.ts` — `getMyProfile` now returns `guide.availability`.
- `apps/web/src/services/onboardingService.ts` — `updateAvailability` client method.
- `apps/web/src/pages/DashboardPage.tsx` — "Manage Availability" modal pre-populates from saved state, actually saves (was `console.log`), invalidates `['me','profile']` and `['guides']` query caches.

### Messaging
- `apps/api/src/services/messageService.ts`
  - `getConversations` is now a union: users with whom you've exchanged messages **plus** users with whom you have a PENDING/CONFIRMED/COMPLETED session. Session-only entries show empty `lastMessage` so the UI can render a "Start a conversation" empty state.
  - `sendMessage` now sets `sessionId` on the row and emits a `NEW_MESSAGE` notification to the recipient.
- `apps/web/src/pages/MessagesPage.tsx` — supports `?with=<userId>` deep links.
- `apps/web/src/pages/DashboardPage.tsx` — added a **Message** button next to **Join / View Details** on both seeker and guide upcoming session cards (deep-links to `/messages?with=<userId>`).
- Backend dashboard `upcomingSessions` now include `otherUserId` so the Message links work.

### Avatar (S3) — upload + propagation
- `apps/api/src/services/userService.ts` — new `uploadAvatar(userId, dataUrl)`: validates MIME (jpeg/png/webp/gif) and size (≤5MB), uploads to S3 under `avatars/{userId}/{ts}.{ext}`, saves the **S3 key** (not URL) to `User.avatarUrl`, returns a 24h presigned URL.
- `apps/api/src/controllers/userController.ts` — new `uploadAvatar` handler.
- `apps/api/src/routes/userRoutes.ts` — `POST /me/avatar`.
- `apps/api/src/services/authService.ts` — `sanitizeUser` is now **async** and uses `resolveAvatarUrl`: external URLs (Google/LinkedIn) pass through; everything else is treated as an S3 key and signed for 24h. All 7 call sites (`register`, `login`, `googleAuth` × 1, `linkedinAuth` × 1, `me`, `refresh`, others) `await` it.
- `apps/api/src/services/guideService.ts` — both `listPublicGuides` and `getPublicGuide` resolve `user.avatarUrl` to a signed URL (or pass-through if external) and include `userId`. `getPublicGuide` also returns `availability` (used by BookSessionPage).
- `apps/web/src/stores/authStore.ts` — new `setAvatarUrl` action.
- `apps/web/src/pages/ProfilePage.tsx` — file input validates client-side, posts as DataURL, shows spinner overlay, updates the store on success.
- `apps/web/src/components/templates/Layout.tsx` — navbar user button renders the image when `user.avatarUrl` is set; falls back to initials.
- `apps/web/src/pages/GuidesPage.tsx`, `GuideProfilePage.tsx`, `BookSessionPage.tsx` — render `guide.avatarUrl` when present.
- `apps/web/src/hooks/useGuides.ts` — `GuideListItem` and `GuideProfile` types gained `avatarUrl` and `userId`.

### S3 cleanup on account deletion
- `apps/api/src/utils/s3.ts` — new `deletePrefix(prefix)` that paginates `ListObjectsV2` and batches `DeleteObjects` (1000 keys/call).
- `apps/api/src/services/userService.ts` — `deleteAccount` now wipes `resumes/{userId}/` and `avatars/{userId}/` **before** the Postgres transaction. If S3 fails, the whole deletion aborts (so the user can retry rather than leak files).

### Mentor edit flow
- `apps/web/src/components/organisms/MentorOnboardingForm.tsx` — new `mode: 'create' | 'edit'`, `initial: MentorFormInitialValues`, and `submitLabel` props. All fields pre-populate from `initial`. In edit mode the header reads "Edit Mentor Profile", submit reads "Save Changes", and the resume slot shows the existing filename with a **Replace resume** affordance. Exports `MentorFormInitialValues`.
- `apps/web/src/pages/settings/EditMentorProfilePage.tsx` — new page that fetches `onboardingApi.getMyProfile()`, maps to `MentorFormInitialValues`, and renders the form in edit mode.
- `apps/web/src/App.tsx` — route `/settings/mentor` → `EditMentorProfilePage`.
- `apps/web/src/pages/ProfilePage.tsx` — added an "Edit Mentor Profile" pill (only for guides) in the actions row.
- The existing `POST /onboarding` endpoint is an upsert so saves "just work".

### My Profile in Find Mentors
- `apps/web/src/pages/GuidesPage.tsx`
  - Calls `useMyProfile` to detect if user is onboarded as mentor.
  - Sort dropdown gains **"My Profile"** option (only for onboarded mentors); selecting it filters the grid to the user's own card.
  - `GuideCard` got `isOwn` + `onEdit` props; a small pencil button (top-right) navigates to `/settings/mentor`.

### Mentor analytics (real data — replaced mock)
- `apps/api/src/services/dashboardService.ts` — new `getGuideAnalytics(userId)` returns `{ earnings, students, performance }`. See "Decisions & gotchas" for the formula details.
- `apps/api/src/controllers/dashboardController.ts` + `routes/dashboardRoutes.ts` — `GET /api/v1/dashboard/guide/analytics`.
- `apps/web/src/hooks/useDashboard.ts` — new `useGuideAnalytics` hook + `GuideAnalyticsResponse` interface.
- `apps/web/src/pages/analytics/EarningsAnalyticsPage.tsx`, `StudentsAnalyticsPage.tsx`, `PerformanceAnalyticsPage.tsx` — all rewritten to use `useGuideAnalytics`; loading dashes, empty states, "Coming Soon" blocks removed.

### Sidebar / role toggle consistency
- `apps/web/src/components/templates/Layout.tsx` — `isDashboard` now matches `/dashboard*`, `/sessions`, `/messages`, so the **Seeker/Guide** pill stays visible across every dashboard-context page.

### Small UI polish (earlier in the session)
- `apps/web/src/components/molecules/RoleSwitcher.tsx` — redesigned: rounded-full pill toggle, `text-[13px] px-3 py-1`, no icons, no separate mobile select.
- `apps/web/src/components/organisms/MentorOnboardingForm.tsx` — container widened to `max-w-4xl`, responsibilities textarea grew from 2 rows to 5.
- `apps/web/src/pages/SeekerRequestsPage.tsx` — "Browse Mentors" button forces `style={{ color: 'white' }}` to defeat Tailwind class overrides.

---

## Todo list — current status

All in-flight tasks are **done** and pushed. Nothing is in progress on disk.

| # | Task | Status |
|---|------|--------|
| 1 | Prisma `Notification` model + migration | ✅ done |
| 2 | `notificationService` + email templates | ✅ done |
| 3 | `sessionService` rewrite (lead time, notifications, emails) | ✅ done |
| 4 | Notification controller + routes | ✅ done |
| 5 | Update `messageService` to include session-only conversations | ✅ done |
| 6 | BookSessionPage 12h lead time + confirmation copy | ✅ done |
| 7 | Bell-icon dropdown → real notifications list | ✅ done |
| 8 | Session Requests in seeker sidebar | ✅ done |
| 9 | RequestsPage real data + SeekerRequestsPage | ✅ done |
| 10 | Message button next to Join in upcoming sessions | ✅ done |
| 11 | Availability persistence + modal wiring | ✅ done |
| 12 | Role toggle visible on all dashboard sub-pages | ✅ done |
| 13 | Sidebar consistent (Sessions / Requests / Messages) | ✅ done |
| 14 | Browse Mentors button text color | ✅ done |
| 15 | Avatar upload to S3 + sanitizeUser resolution | ✅ done |
| 16 | Account deletion wipes S3 | ✅ done |
| 17 | Avatar propagates to mentor cards / pages | ✅ done |
| 18 | Block self-booking + UI message | ✅ done |
| 19 | "My Profile" sort + pencil edit button | ✅ done |
| 20 | Edit Mentor Profile reusing onboarding form | ✅ done |
| 21 | Replace mentor analytics mock data with real | ✅ done |

---

## What's left to do (next session)

There is **no outstanding task from this session** — everything was committed and pushed under commit `7bc3a8f`.

Open threads / things the user has mentioned but hasn't asked for yet:
1. **Landing page background design** — the user has `Design Comps./LandingPageBackground.txt` open in the IDE (267 lines). Other design notes in that folder: `LandingPageIdeas.txt`, `SearchBox.txt`, `Testimonials.txt`. These are likely the next design-driven asks. **Do not assume** — wait for the user to direct you.
2. **Email deliverability** — `apps/api/src/utils/email.ts` falls back to a no-op when SMTP env vars aren't set (`createTransporter()` returns `null`). In dev this means notifications still emit but emails silently don't send. If the user reports "I didn't get an email", check `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` / `SMTP_PORT` in the API's env.
3. **Mentor onboarding `isApproved`** — new mentors are `isApproved: true` immediately (`onboardingService.submitOnboarding` line 71). There is no admin approval flow; the field exists but is never gated. If the product needs real approval, that's a future feature.
4. **`getSignedUrl` resume expiry** — resumes still use the default 15-minute presign (`getSignedUrl(key)` with no second arg). Avatars use 24h. If users complain about resume links expiring on long-lived pages, increase the expiry.

---

## Decisions, assumptions, and gotchas

### Avatars
- `User.avatarUrl` is a **mixed-format string**: it's either a full URL (Google/LinkedIn OAuth profile pictures stored at signup time) **or** an S3 object key like `avatars/{userId}/{ts}.{ext}`. Resolution is done in `sanitizeUser` (auth flows) and `resolveAvatar` (guide service) by checking `startsWith('http://')` / `https://`. Anything that's not a URL is treated as an S3 key.
- Avatar S3 keys are signed for **24 hours**. Resume keys still use the default 15 minutes (in `onboardingService.getMyProfile`).
- Avatar uploads go to a **single bucket** (whatever the existing resume setup uses) under top-level prefixes `avatars/` and `resumes/`. The user previously asked whether to use one prefix per user vs resource-first; we kept the existing resource-first layout (`avatars/{userId}/...`, `resumes/{userId}/...`).
- `sanitizeUser` in `authService.ts` is **async**. All 7 call sites await it. If you add a new call site, don't forget `await`.

### Booking
- 12-hour lead time is enforced in three places: backend `sessionService.createSession`, frontend `displaySlots` filter, and `isPast()` in the calendar (a day is "past" if its 23:59 is still inside the 12h window). All three must stay consistent.
- Self-booking is blocked **server-side** (`sessionService` throws) and **client-side** (BookSessionPage renders an amber lock card). The client still routes the user to `/guides/{id}/book` from their own card — the block happens after `useGuide` resolves.
- Booking confirmation copy is intentionally **"Booking Request Sent"** (amber/Clock), not "Confirmed" (green/Check). The session is `PENDING` until the mentor accepts.
- Duplicate-slot protection exists: same seeker + same guide + same `scheduledAt` with a PENDING/CONFIRMED row triggers a 400.

### Account deletion order
- `userService.deleteAccount` deletes **S3 first**, **Postgres second**. Rationale: orphaned S3 files are recoverable via lifecycle rules; orphaned DB rows pointing to deleted S3 keys would just show broken images. If S3 fails, the whole operation aborts so the user can retry.

### Notifications
- Notification rows have `onDelete: Cascade` on the User FK, so account deletion handles them automatically.
- The bell's badge count is the sum of `unreadMessages` + `unreadNotificationCount` (from `/dashboard/notifications`). The list itself comes from a separate `/notifications` endpoint and refetches every 5s.
- `pendingSessionRequests` and `pendingAwaitingConfirmation` counters in `/dashboard/notifications` still exist (used by sidebar badges), but the bell dropdown no longer hand-rolls these into items — they're emitted as real `Notification` rows by `sessionService` instead.

### Messaging
- `messageService.sendMessage` still requires a session relationship to exist (PENDING/CONFIRMED/COMPLETED) between sender and receiver before allowing a message. This is intentional — Expertify isn't open chat.
- `getConversations` returns **session-only** pairs (empty `lastMessage`) for users with a session but no exchanged messages, so they show up in the Messages page immediately after booking.

### Mentor edit
- Saving the edit form calls the same `POST /onboarding` endpoint as initial onboarding (it's an upsert). The backend `submitOnboarding` only sets `resumeUrl` on the update path if a new file was uploaded — existing resumes are preserved.
- `MentorOnboardingForm` step-2 validation requires bio ≥10 chars and a `linkedin.com` URL. In edit mode the bio is pre-populated from `user.bio`, not from a separate `guideProfile.bio` field.

### Guide analytics formulas
Computed by `dashboardService.getGuideAnalytics` from **a single `prisma.session.findMany`** then derived in memory:
- **Total earnings / This month / Avg per session**: sum of `totalCost` (cents) for sessions in status `CONFIRMED` or `COMPLETED`. "This month" filters by `scheduledAt` between start-of-month and start-of-next-month.
- **Sessions this month**: count of confirmed/completed sessions with `scheduledAt` in the current month.
- **Total students**: distinct `seekerId` across all sessions ever.
- **Active students**: distinct `seekerId` with at least one session in the last 30 days (by `scheduledAt`).
- **Completed sessions**: count where `status === 'COMPLETED'`.
- **Response rate**: `(non-PENDING / total) * 100`, rounded.
- **Average response time (hours)**: average of `updatedAt - createdAt` only for sessions where `updatedAt < scheduledAt`. This filter is critical — it excludes (a) auto-cancellations triggered by `autoUpdateSessions` after `scheduledAt` and (b) `CONFIRMED → COMPLETED` transitions that bump `updatedAt` past the actual response moment. Returns `null` if no qualifying rows.
- **Repeat clients %**: distinct seekers with >1 session / total distinct seekers, rounded.

### Onboarding `isApproved`
- `submitOnboarding` sets `isApproved: true` on create. No admin gate. If you need to gate guide visibility, you'd flip this and add a review queue.

### Tailwind class overrides
- A few buttons have `style={{ color: 'white' }}` inline (Browse Mentors, Save availability, Find Mentors lock-card button) because some parent CSS or specificity issue can defeat `text-white`. If you add a primary button on a dark background and the text looks dark, copy that pattern.

### Files that exist but aren't currently referenced
- `apps/web/src/data/mentors.ts` — static seed data (with letters like `'SC'` as `avatar`). The app uses the real API now; this file is leftover from earlier scaffolding. Leave it alone unless explicitly asked to clean up.

---

## Current git state

```
$ git status
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean

$ git diff --stat
(empty — no unstaged changes)

$ git log --oneline -5
7bc3a8f feat: mentor edit flow, self-booking block, real guide analytics
2ea561c feat: S3-backed avatar upload + full S3 cleanup on account delete
181a3b6 feat: booking workflow, notifications, messaging, availability persistence
e14448f fix: remove duplicate Book a Session button from sidebar
69c9759 fix: remove redundant Session Info section from mentor profile sidebar

branch: main
upstream: origin/main
```

Working tree is clean. The next session should not need to commit anything from prior work — just pick up whatever the user asks next.

---

## Quick reference — paths the next session will likely touch

- Backend services: `apps/api/src/services/{sessionService,messageService,userService,dashboardService,notificationService,onboardingService,guideService,authService}.ts`
- Backend routes/controllers: `apps/api/src/routes/*` and `apps/api/src/controllers/*`
- Prisma: `apps/api/prisma/schema.prisma` + `apps/api/prisma/migrations/`
- Frontend pages: `apps/web/src/pages/`
- Frontend hooks: `apps/web/src/hooks/{useDashboard,useGuides,useMessages,useSessions,useNotificationsList}.ts`
- Auth store: `apps/web/src/stores/authStore.ts`
- Layout / sidebar: `apps/web/src/components/templates/Layout.tsx`, `apps/web/src/components/organisms/DashboardSidebar.tsx`
- Mentor form: `apps/web/src/components/organisms/MentorOnboardingForm.tsx`
- Design comp source files (open in IDE): `Design Comps./{LandingPageBackground,LandingPageIdeas,SearchBox,Testimonials}.txt`
- S3 helpers: `apps/api/src/utils/s3.ts`
- Email helpers: `apps/api/src/utils/email.ts`

To verify nothing is broken: `cd apps/web && npx tsc --noEmit` and `cd apps/api && npx tsc --noEmit` — both should return cleanly on the current commit.