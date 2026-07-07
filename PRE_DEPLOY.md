# Pre-Deployment Checklist — Status

Audited 2026-07-07. ✅ = implemented, 🟡 = partial/config-dependent, ➡️ = infra/ops (not code).

## 1. Data isolation (users locked to their UUIDs) — ✅
- Every protected route uses `requireAuth`, which sets `req.auth.userId` from the JWT.
- Services query strictly by the caller's profile derived from `userId`; ownership is re-checked on mutations (`cancelSession`, `joinSession`, `acceptSession`, `declineSession`, `createReview`, message delete = sender-only, avatar/account = self).
- Messaging is relationship-scoped (you only ever see threads you're part of).
- No endpoint returns another user's private data by id without an ownership check. Public guide endpoints are intentionally public (browse).

## 2. Password reset links expire — ✅ (new)
- `POST /auth/forgot-password` emails a reset link; `POST /auth/reset-password` sets the new password.
- Token is a signed JWT with **`expiresIn: '30m'`** and a `purpose: 'pw_reset'` claim; dead after 30 minutes.
- Anti-enumeration: forgot-password always returns the same response whether or not the email exists. OAuth-only accounts (no password) are skipped.
- Frontend: `/auth/forgot-password` and `/auth/reset-password` pages; "Forgot password?" link on login.
- Note: a valid token stays usable until it expires (stateless JWT); acceptable for a 30-min window. For single-use, add a `passwordChangedAt`/token-version check later.

## 3. Input sanitization / SQLi / XSS — ✅
- **SQL injection:** all DB access is via Prisma (parameterized queries). No raw SQL anywhere.
- **XSS:** React escapes by default; `grep` confirms **no `dangerouslySetInnerHTML`** in the web app.
- **Security headers:** `helmet()` now applied to the API.
- **Validation:** auth payloads use Zod; other endpoints validate required fields in controllers. (Future: extend Zod schemas to all write endpoints.)

## 4. CORS locked to own domain — ✅
- `cors({ origin: env.CORS_ORIGIN, credentials: true })` — only the configured web origin is served.
- **Action for prod:** set `CORS_ORIGIN` on Railway to the exact Vercel production URL (or custom domain). Preview deploys use different origins; add a custom domain if you need auth on previews.

## 5. Rate limiting — ✅
- Tight limiter on sensitive auth routes (`authLimiter`: 10 / 15 min; `refreshLimiter`: 60 / 15 min; now also forgot/reset password).
- **New:** global limiter on all `/api/*` (300 / 15 min per IP) as defense-in-depth.
- `app.set('trust proxy', 1)` so client IPs are correct behind Railway's proxy.

## 6. Error handling — ✅
- **Backend:** central `errorHandler` maps `AppError` → proper status; unexpected errors are logged (winston) and returned as a generic 500 (no stack leak).
- **Frontend:** `ErrorBoundary` wraps the app (friendly screen instead of white page); `404` catch-all route (`path="*"` → `NotFoundPage`).

## 7. Indexes on high-traffic queries — ✅
- Added: `Session (seekerId,status)`, `(guideId,status)`, `(status,scheduledAt)`; `Message (senderId)`, `(receiverId,isRead)`, `(sessionId)`.
- Pre-existing: `Notification (userId,createdAt)`, `(userId,isRead)`; unique on `User.email/googleId/linkedinId`, `Session/Review.sessionId`.
- Kept lean — only the columns the hot paths actually filter/sort on.

## 8. Logging & monitoring — 🟡
- **In place:** `morgan` HTTP logs, `winston` app logger, 5xx errors logged in `errorHandler`, failed reset emails logged.
- **Recommended before launch:** wire an error-alerting service (e.g. **Sentry**) on both API and web for critical-failure alerts. Add its DSN as an env var and initialize at startup. (Not added here — needs an account/DSN.)

## 9. Rollback / blue-green — ➡️ (infra)
- **Vercel (web):** deploys are immutable & atomic. Roll back instantly by promoting a previous deployment (Deployments → ⋯ → *Promote to Production*). Effectively blue-green.
- **Railway (API):** each deploy is versioned — use *Rollback* to the previous deployment. Run DB migrations backward-compatibly (add columns/indexes, avoid destructive changes in the same release) so a rollback stays safe.
- **DB:** migrations are additive here (new indexes, nullable columns) — safe to roll back the app without a DB rollback.

---

## Remaining follow-ups (tracked elsewhere)
- Revert the **2-day join window** (`apps/api/src/services/video/joinWindow.ts`) to 10 min before launch.
- Configure **SMTP** (`SMTP_*`) so reset + booking emails actually send.
- **Payments** are not wired (refunds are computed/displayed only).
- Add **Sentry** (item 8) and consider single-use reset tokens (item 2).