# Video Calls — Phase A: Connect Mentor & Seeker (Design)

**Date:** 2026-06-15
**Status:** Approved (scope), pending spec review
**Scope:** A working 1:1 Daily.co video call between a mentor and a seeker for a CONFIRMED session. Nothing more.

## Goal

When a session is CONFIRMED, both the mentor and the seeker can click **Join** during a time window around the scheduled start and land in the same 1:1 Daily Prebuilt video room. That's the whole deliverable.

## Explicitly out of scope (future phases, separate specs)

- Cloud recording → S3 (Phase B)
- Post-call webhooks, attendance tracking, auto-transition to COMPLETED/NO_SHOW (Phase B)
- Transcription + Claude role-tailored AI summaries + delivery (Phase C)
- Monitoring: per-session call record, admin dashboard, budget meter, `User.isAdmin` (Phase D)

Because recording/webhooks are deferred, Phase A does **not** change how a session becomes COMPLETED. Sessions remain CONFIRMED after the call (existing behavior). That is acceptable for this phase.

## Architectural decisions (locked)

- **Provider:** Daily.co, **Daily Prebuilt** embed (no custom call UI).
- **Call structure:** strict 1:1 — `max_participants: 2`.
- **Room lifecycle:** **lazy** — the room is created the first time either participant clicks Join, inside the join window. No link is emailed ahead of time.
- **Platform:** web, desktop/laptop browsers.

## Data model (Prisma)

New model `SessionCall`, 1:1 with `Session`. Kept minimal now; later phases extend it.

```prisma
model SessionCall {
  id             String   @id @default(uuid())
  sessionId      String   @unique
  dailyRoomName  String                // Daily room name (used for token + delete)
  dailyRoomUrl   String                // full https://<domain>.daily.co/<name>
  expiresAt      DateTime              // room exp = window close; informs the UI
  createdAt      DateTime @default(now())

  session        Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}
```

- Add the inverse relation `call SessionCall?` to `Session`.
- Migration: `add_session_call`.
- No enum changes in Phase A.

## Environment / config

Add to `apps/api/src/config/env.ts`:

- `DAILY_API_KEY: z.string()` — required.
- `DAILY_API_URL: z.string().url().default('https://api.daily.co/v1')`.
- `DAILY_DOMAIN: z.string()` — the team's `*.daily.co` subdomain, used to build room URLs.

Frontend (`apps/web/.env`): no new vars needed — the room URL + token come from the API at join time.

## Backend

### `dailyService.ts` (new)

Thin wrapper over the Daily REST API (using `fetch`; no SDK needed server-side).

- `createRoom({ name, expiresAt }): Promise<{ name, url }>`
  - `POST {DAILY_API_URL}/rooms` with `Authorization: Bearer DAILY_API_KEY`.
  - Properties: `privacy: 'private'`, `max_participants: 2`, `exp: <unix seconds of expiresAt>`, `eject_at_room_exp: true`, `enable_prejoin_ui: true`.
  - Room `name` is deterministic from the session id (e.g. `session-<sessionId>`), so a second join finds/creates idempotently. If the room already exists (409), treat as success and fetch it.
- `createMeetingToken({ roomName, userId, userName, isOwner, expiresAt }): Promise<string>`
  - `POST {DAILY_API_URL}/meeting-tokens` with `properties: { room_name, user_id, user_name, is_owner, exp, eject_at_token_exp: true }`.
  - Mentor → `is_owner: true`; seeker → `false` (no behavioral difference in Phase A, set for forward-compat).
- `deleteRoom(name)` — not called in Phase A (rooms self-expire via `exp`), but implemented for completeness/cleanup.

All Daily failures throw `AppError` with a 502 and a logged cause.

### Join window logic (pure, unit-tested)

A small pure helper `getJoinWindow(scheduledAt, durationMinutes)`:
- `opensAt = scheduledAt - 10 min`
- `closesAt = scheduledAt + durationMinutes + 15 min` (grace)
- `evaluate(now)` → `'too_early' | 'open' | 'expired'`

The room's `exp` is set to `closesAt`.

### `sessionService.joinSession(userId, sessionId)` (new)

1. Load session with seeker + guide (and their userIds). 404 if missing.
2. **Authorization:** `userId` must be the session's seeker.userId or guide.userId → else `AppError(403, 'not_participant')`.
3. **Status:** must be `CONFIRMED` → else `AppError(409, 'not_confirmed')`.
4. **Window:** `getJoinWindow(...).evaluate(now)`:
   - `too_early` → `AppError(409, 'too_early')` (include `opensAt` in payload)
   - `expired` → `AppError(409, 'expired')`
   - `open` → continue
5. **Lazy room:** load `SessionCall` by sessionId; if absent, `createRoom` and persist `SessionCall`.
6. Determine `isOwner = (userId === guide.userId)` and a display name.
7. `createMeetingToken(...)`.
8. Return `{ roomUrl, token, expiresAt, role: 'guide' | 'seeker' }`.

### Route / controller

- `POST /api/v1/sessions/:id/join` → `requireAuth` → `sessionController.join` → `sessionService.joinSession`.
- Added to existing `sessionRoutes.ts` / `sessionController.ts`. No server.ts bootstrap changes (no webhooks in Phase A).

## Frontend

### API + hook

- `sessionsApi.join(sessionId)` → `POST /sessions/:id/join`, returns `{ roomUrl, token, expiresAt, role }`.
- `useJoinSession()` mutation (TanStack Query) wrapping it.

### Call page — `/sessions/:id/call`

- New protected route + page `SessionCallPage.tsx`.
- On mount: call `join`. Handle the three error reasons with clear UI:
  - `too_early` → "This session opens at {opensAt}. Come back then." + countdown.
  - `expired` → "This session's join window has closed."
  - `not_confirmed` / `not_participant` → appropriate message + back link.
- On success: create a Daily call frame with `@daily-co/daily-js`, `frame.join({ url: roomUrl, token })`, mounted full-page (Daily Prebuilt provides the entire in-call UI, device setup, prejoin).
- On `left-meeting` / leave button: destroy the frame, navigate back to the session/dashboard.
- Clean up the call frame on unmount.

### Wire the existing Join buttons

- [SessionsPage.tsx:138](apps/web/src/pages/SessionsPage.tsx#L138) and the two `DashboardPage` Join buttons currently no-op. Point them to `navigate('/sessions/' + id + '/call')`.
- Keep the "Join" affordance gated on `status === 'CONFIRMED'` as today. (Fine-grained too-early disabling is handled by the call page; we may also soft-disable client-side using the window, but the server is the source of truth.)

### Dependency

- Add `@daily-co/daily-js` to `apps/web`. (`daily-react` optional; for a single full-page Prebuilt embed, plain `daily-js` `createFrame` is sufficient and lighter.)

## Testing approach

- **Unit (api):** `getJoinWindow` evaluation (too_early/open/expired boundaries); `joinSession` authorization + status + window branches with `dailyService` mocked; idempotent room reuse (existing `SessionCall` → no second `createRoom`).
- **Manual:** two browsers (mentor + seeker accounts) on a CONFIRMED session join the same room within the window; verify 2-participant cap and prejoin UI.

## Risks / notes

- **Daily API key & domain** must be provisioned before this works end-to-end; until then unit tests (mocked) pass but manual verification is blocked.
- **No completion automation** this phase — sessions stay CONFIRMED post-call by design; revisited in Phase B.
- **Budget:** participant-minutes only in Phase A (no recording/transcription costs yet). A 1:1 call = 2× wall-clock minutes against the 10,000/mo free tier.
- **Private rooms + tokens** mean a leaked room URL alone can't grant access — a valid meeting token is required, and tokens are minted only for the two participants.