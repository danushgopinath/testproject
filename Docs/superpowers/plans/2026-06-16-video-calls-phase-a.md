# Video Calls — Phase A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a mentor and a seeker join the same 1:1 Daily.co Prebuilt video room for a CONFIRMED session, during a time window around the scheduled start.

**Architecture:** A new `POST /sessions/:id/join` endpoint authorizes the caller, checks the join window, lazily creates a private 2-person Daily room (idempotent by session id), mints a per-user meeting token, and returns `{ roomUrl, token }`. A new web page embeds Daily Prebuilt with those values. Timing outcomes (`too_early`/`expired`) come back as normal 200 responses; only hard failures throw.

**Tech Stack:** Express 5 + Prisma 7 (api), React 19 + react-router 7 + TanStack Query (web), Daily REST API + `@daily-co/daily-js`, vitest for unit tests.

**Spec:** `docs/superpowers/specs/2026-06-15-video-calls-phase-a-design.md`

**Out of scope (later phases):** recording, webhooks, attendance/auto-COMPLETED, transcription, AI summaries, admin dashboard, `User.isAdmin`.

---

## File structure

**Create (api):**
- `apps/api/src/services/video/joinWindow.ts` — pure: compute/evaluate the join window.
- `apps/api/src/services/video/joinWindow.test.ts` — unit tests.
- `apps/api/src/services/video/joinEligibility.ts` — pure: decide join eligibility (auth/status/window) → result.
- `apps/api/src/services/video/joinEligibility.test.ts` — unit tests.
- `apps/api/src/services/dailyService.ts` — Daily REST wrapper (rooms + meeting tokens).
- `apps/api/vitest.config.ts` — vitest config.

**Modify (api):**
- `apps/api/src/config/env.ts` — add optional `DAILY_*` vars.
- `apps/api/prisma/schema.prisma` — add `SessionCall` model + `Session.call` relation.
- `apps/api/src/services/sessionService.ts` — add `joinSession`.
- `apps/api/src/controllers/sessionController.ts` — add `join`.
- `apps/api/src/routes/sessionRoutes.ts` — add the route.
- `apps/api/package.json` — vitest devDep + test scripts.

**Create (web):**
- `apps/web/src/pages/SessionCallPage.tsx` — Daily Prebuilt embed + pre-join states.

**Modify (web):**
- `apps/web/src/hooks/useSessions.ts` — add `useJoinSession`.
- `apps/web/src/App.tsx` — add `/sessions/:id/call` route.
- `apps/web/src/pages/SessionsPage.tsx` — wire "Join Session" button.
- `apps/web/src/pages/DashboardPage.tsx` — wire the two "Join" buttons.
- `apps/web/package.json` — add `@daily-co/daily-js`.

---

## Task 1: Add Daily.co environment variables

**Files:**
- Modify: `apps/api/src/config/env.ts`

- [ ] **Step 1: Add the Daily vars to the zod schema**

In `apps/api/src/config/env.ts`, inside `envSchema`, add after the `AWS_S3_BUCKET` line:

```typescript
  // Daily.co video — optional so the app boots without them; dailyService
  // throws a clear error at call time if they're missing.
  DAILY_API_KEY: z.string().optional(),
  DAILY_API_URL: z.string().url().default('https://api.daily.co/v1'),
  DAILY_DOMAIN: z.string().optional(),
```

- [ ] **Step 2: Verify it still compiles**

Run: `cd apps/api && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Document the new vars**

If `apps/api/.env.example` exists, append:

```
# Daily.co video (Phase A)
DAILY_API_KEY=
DAILY_DOMAIN=
# DAILY_API_URL defaults to https://api.daily.co/v1
```

(If the file does not exist, skip this step.)

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/config/env.ts apps/api/.env.example
git commit -m "feat(api): add optional Daily.co env vars"
```

---

## Task 2: Add the SessionCall Prisma model

**Files:**
- Modify: `apps/api/prisma/schema.prisma`

- [ ] **Step 1: Add the model and relation**

In `apps/api/prisma/schema.prisma`, add the inverse relation field to the `Session` model (alongside `review Review?`):

```prisma
  call            SessionCall?
```

Then add this new model near the other session-related models:

```prisma
model SessionCall {
  id            String   @id @default(uuid())
  sessionId     String   @unique
  dailyRoomName String
  dailyRoomUrl  String
  expiresAt     DateTime
  createdAt     DateTime @default(now())

  session       Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 2: Create and apply the migration**

Run: `cd apps/api && npx prisma migrate dev --name add_session_call`
Expected: migration `add_session_call` created and applied; Prisma Client regenerated. The model `prisma.sessionCall` is now available.

- [ ] **Step 3: Verify it compiles**

Run: `cd apps/api && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/api/prisma/schema.prisma apps/api/prisma/migrations
git commit -m "feat(api): add SessionCall model + migration"
```

---

## Task 3: Set up vitest

**Files:**
- Modify: `apps/api/package.json`
- Create: `apps/api/vitest.config.ts`

- [ ] **Step 1: Install vitest**

Run: `cd apps/api && npm install -D vitest`
Expected: `vitest` added to devDependencies.

- [ ] **Step 2: Add test scripts**

In `apps/api/package.json`, replace the existing `"test"` script line with:

```json
    "test": "vitest run",
    "test:watch": "vitest",
```

- [ ] **Step 3: Create the vitest config**

Create `apps/api/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```

- [ ] **Step 4: Verify the runner works (no tests yet)**

Run: `cd apps/api && npm test`
Expected: vitest runs and reports "No test files found" (exit 0 or a benign no-files message). This confirms the runner is wired.

- [ ] **Step 5: Commit**

```bash
git add apps/api/package.json apps/api/vitest.config.ts apps/api/package-lock.json
git commit -m "chore(api): add vitest test runner"
```

---

## Task 4: Join-window logic (TDD)

**Files:**
- Create: `apps/api/src/services/video/joinWindow.ts`
- Test: `apps/api/src/services/video/joinWindow.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/api/src/services/video/joinWindow.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { getJoinWindow, evaluateWindow } from './joinWindow'

const scheduled = new Date('2026-07-01T15:00:00.000Z')

describe('getJoinWindow', () => {
  it('opens 10 minutes before the scheduled start', () => {
    const { opensAt } = getJoinWindow(scheduled, 60)
    expect(opensAt.toISOString()).toBe('2026-07-01T14:50:00.000Z')
  })

  it('closes duration + 15 minutes grace after the start', () => {
    const { closesAt } = getJoinWindow(scheduled, 60)
    expect(closesAt.toISOString()).toBe('2026-07-01T16:15:00.000Z')
  })
})

describe('evaluateWindow', () => {
  const window = getJoinWindow(scheduled, 60)

  it('returns too_early before the window opens', () => {
    expect(evaluateWindow(window, new Date('2026-07-01T14:49:59.000Z'))).toBe('too_early')
  })

  it('returns open inside the window', () => {
    expect(evaluateWindow(window, new Date('2026-07-01T15:00:00.000Z'))).toBe('open')
  })

  it('returns open exactly at opensAt', () => {
    expect(evaluateWindow(window, window.opensAt)).toBe('open')
  })

  it('returns expired after the window closes', () => {
    expect(evaluateWindow(window, new Date('2026-07-01T16:15:01.000Z'))).toBe('expired')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd apps/api && npx vitest run src/services/video/joinWindow.test.ts`
Expected: FAIL — cannot resolve `./joinWindow`.

- [ ] **Step 3: Write the implementation**

Create `apps/api/src/services/video/joinWindow.ts`:

```typescript
const OPEN_LEAD_MS = 10 * 60 * 1000 // join opens 10 min before start
const GRACE_MS = 15 * 60 * 1000 // window stays open 15 min past the end

export interface JoinWindow {
  opensAt: Date
  closesAt: Date
}

export function getJoinWindow(scheduledAt: Date, durationMinutes: number): JoinWindow {
  const start = scheduledAt.getTime()
  return {
    opensAt: new Date(start - OPEN_LEAD_MS),
    closesAt: new Date(start + durationMinutes * 60 * 1000 + GRACE_MS),
  }
}

export type WindowState = 'too_early' | 'open' | 'expired'

export function evaluateWindow(window: JoinWindow, now: Date): WindowState {
  if (now.getTime() < window.opensAt.getTime()) return 'too_early'
  if (now.getTime() > window.closesAt.getTime()) return 'expired'
  return 'open'
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd apps/api && npx vitest run src/services/video/joinWindow.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/services/video/joinWindow.ts apps/api/src/services/video/joinWindow.test.ts
git commit -m "feat(api): join-window calculation"
```

---

## Task 5: Join-eligibility logic (TDD)

**Files:**
- Create: `apps/api/src/services/video/joinEligibility.ts`
- Test: `apps/api/src/services/video/joinEligibility.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/api/src/services/video/joinEligibility.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { evaluateJoinEligibility } from './joinEligibility'

const base = {
  status: 'CONFIRMED',
  scheduledAt: new Date('2026-07-01T15:00:00.000Z'),
  durationMinutes: 60,
  seekerUserId: 'seeker-1',
  guideUserId: 'guide-1',
}
const duringCall = new Date('2026-07-01T15:05:00.000Z')

describe('evaluateJoinEligibility', () => {
  it('rejects a non-participant', () => {
    const r = evaluateJoinEligibility({ session: base, userId: 'stranger', now: duringCall })
    expect(r).toEqual({ ok: false, reason: 'not_participant' })
  })

  it('rejects a session that is not CONFIRMED', () => {
    const r = evaluateJoinEligibility({
      session: { ...base, status: 'PENDING' },
      userId: 'seeker-1',
      now: duringCall,
    })
    expect(r).toEqual({ ok: false, reason: 'not_confirmed' })
  })

  it('reports too_early with the opensAt time', () => {
    const r = evaluateJoinEligibility({
      session: base,
      userId: 'seeker-1',
      now: new Date('2026-07-01T14:00:00.000Z'),
    })
    expect(r).toEqual({ ok: false, reason: 'too_early', opensAt: new Date('2026-07-01T14:50:00.000Z') })
  })

  it('reports expired after the window', () => {
    const r = evaluateJoinEligibility({
      session: base,
      userId: 'guide-1',
      now: new Date('2026-07-01T17:00:00.000Z'),
    })
    expect(r).toEqual({ ok: false, reason: 'expired' })
  })

  it('allows the guide and tags the role', () => {
    const r = evaluateJoinEligibility({ session: base, userId: 'guide-1', now: duringCall })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.role).toBe('guide')
  })

  it('allows the seeker and tags the role', () => {
    const r = evaluateJoinEligibility({ session: base, userId: 'seeker-1', now: duringCall })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.role).toBe('seeker')
      expect(r.window.closesAt.toISOString()).toBe('2026-07-01T16:15:00.000Z')
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd apps/api && npx vitest run src/services/video/joinEligibility.test.ts`
Expected: FAIL — cannot resolve `./joinEligibility`.

- [ ] **Step 3: Write the implementation**

Create `apps/api/src/services/video/joinEligibility.ts`:

```typescript
import { getJoinWindow, evaluateWindow, type JoinWindow } from './joinWindow'

export interface EligibilitySession {
  status: string
  scheduledAt: Date
  durationMinutes: number
  seekerUserId: string
  guideUserId: string
}

export interface EligibilityInput {
  session: EligibilitySession
  userId: string
  now: Date
}

export type EligibilityResult =
  | { ok: true; role: 'guide' | 'seeker'; window: JoinWindow }
  | { ok: false; reason: 'not_participant' | 'not_confirmed' | 'too_early' | 'expired'; opensAt?: Date }

export function evaluateJoinEligibility({ session, userId, now }: EligibilityInput): EligibilityResult {
  const isGuide = userId === session.guideUserId
  const isSeeker = userId === session.seekerUserId
  if (!isGuide && !isSeeker) return { ok: false, reason: 'not_participant' }

  if (session.status !== 'CONFIRMED') return { ok: false, reason: 'not_confirmed' }

  const window = getJoinWindow(session.scheduledAt, session.durationMinutes)
  const state = evaluateWindow(window, now)
  if (state === 'too_early') return { ok: false, reason: 'too_early', opensAt: window.opensAt }
  if (state === 'expired') return { ok: false, reason: 'expired' }

  return { ok: true, role: isGuide ? 'guide' : 'seeker', window }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd apps/api && npx vitest run src/services/video/joinEligibility.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/services/video/joinEligibility.ts apps/api/src/services/video/joinEligibility.test.ts
git commit -m "feat(api): join-eligibility decision logic"
```

---

## Task 6: Daily REST wrapper

**Files:**
- Create: `apps/api/src/services/dailyService.ts`

- [ ] **Step 1: Write the implementation**

Create `apps/api/src/services/dailyService.ts`:

```typescript
import { env } from '../config/env'
import { AppError } from '../utils/errors'

function requireConfig(): { apiKey: string; apiUrl: string; domain: string } {
  if (!env.DAILY_API_KEY || !env.DAILY_DOMAIN) {
    throw new AppError('Video calling is not configured (missing DAILY_API_KEY/DAILY_DOMAIN)', 503)
  }
  return { apiKey: env.DAILY_API_KEY, apiUrl: env.DAILY_API_URL, domain: env.DAILY_DOMAIN }
}

function toUnixSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000)
}

export const dailyService = {
  /**
   * Create a private 1:1 room. Idempotent: if the room name already exists
   * (HTTP 409), the existing room is reused. The URL is built deterministically
   * from the domain + name, so no extra fetch is needed.
   */
  async createRoom({ name, expiresAt }: { name: string; expiresAt: Date }): Promise<{ name: string; url: string }> {
    const { apiKey, apiUrl, domain } = requireConfig()
    const url = `https://${domain}.daily.co/${name}`

    const res = await fetch(`${apiUrl}/rooms`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        privacy: 'private',
        properties: {
          max_participants: 2,
          exp: toUnixSeconds(expiresAt),
          eject_at_room_exp: true,
          enable_prejoin_ui: true,
        },
      }),
    })

    if (res.ok || res.status === 409) {
      return { name, url }
    }
    const detail = await res.text()
    throw new AppError(`Daily createRoom failed (${res.status}): ${detail}`, 502)
  },

  /** Mint a meeting token scoped to one room for one user. */
  async createMeetingToken({
    roomName,
    userId,
    userName,
    isOwner,
    expiresAt,
  }: {
    roomName: string
    userId: string
    userName: string
    isOwner: boolean
    expiresAt: Date
  }): Promise<string> {
    const { apiKey, apiUrl } = requireConfig()

    const res = await fetch(`${apiUrl}/meeting-tokens`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_id: userId,
          user_name: userName,
          is_owner: isOwner,
          exp: toUnixSeconds(expiresAt),
          eject_at_token_exp: true,
        },
      }),
    })

    if (!res.ok) {
      const detail = await res.text()
      throw new AppError(`Daily createMeetingToken failed (${res.status}): ${detail}`, 502)
    }
    const data = (await res.json()) as { token: string }
    return data.token
  },
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd apps/api && npx tsc --noEmit`
Expected: no errors. (Node 18+/Express 5 provides global `fetch`; `@types/node` is installed.)

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/services/dailyService.ts
git commit -m "feat(api): Daily REST wrapper (rooms + tokens)"
```

---

## Task 7: joinSession service + controller + route

**Files:**
- Modify: `apps/api/src/services/sessionService.ts`
- Modify: `apps/api/src/controllers/sessionController.ts`
- Modify: `apps/api/src/routes/sessionRoutes.ts`

- [ ] **Step 1: Add imports to sessionService.ts**

At the top of `apps/api/src/services/sessionService.ts`, add after the existing imports:

```typescript
import { dailyService } from './dailyService'
import { evaluateJoinEligibility } from './video/joinEligibility'
```

- [ ] **Step 2: Add the `joinSession` method**

Inside the `sessionService` object in `apps/api/src/services/sessionService.ts`, add this method (e.g. after `declineSession`):

```typescript
  /**
   * Authorize + window-check a join, lazily create the Daily room, and mint a
   * per-user meeting token. Timing outcomes are returned in-band (200); only
   * hard authorization/status failures throw.
   */
  async joinSession(userId: string, sessionId: string): Promise<
    | { status: 'ok'; roomUrl: string; token: string; expiresAt: string; role: 'guide' | 'seeker' }
    | { status: 'too_early'; opensAt: string }
    | { status: 'expired' }
  > {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        seeker: { include: { user: true } },
        guide: { include: { user: true } },
        call: true,
      },
    })
    if (!session) throw new AppError('Session not found', 404)

    const seekerUserId = session.seeker.user.id
    const guideUserId = session.guide.user.id

    const result = evaluateJoinEligibility({
      session: {
        status: session.status,
        scheduledAt: session.scheduledAt,
        durationMinutes: session.durationMinutes,
        seekerUserId,
        guideUserId,
      },
      userId,
      now: new Date(),
    })

    if (!result.ok) {
      if (result.reason === 'not_participant') throw new AppError('You are not a participant in this session', 403)
      if (result.reason === 'not_confirmed') throw new AppError('This session is not confirmed', 409)
      if (result.reason === 'too_early') return { status: 'too_early', opensAt: result.opensAt!.toISOString() }
      return { status: 'expired' }
    }

    // Lazily create (or reuse) the room.
    const roomName = `session-${session.id}`
    let roomUrl = session.call?.dailyRoomUrl
    if (!session.call) {
      const room = await dailyService.createRoom({ name: roomName, expiresAt: result.window.closesAt })
      roomUrl = room.url
      await prisma.sessionCall.create({
        data: {
          sessionId: session.id,
          dailyRoomName: room.name,
          dailyRoomUrl: room.url,
          expiresAt: result.window.closesAt,
        },
      })
    }

    const isOwner = result.role === 'guide'
    const u = isOwner ? session.guide.user : session.seeker.user
    const userName = `${u.firstName} ${u.lastName}`.trim() || 'Participant'

    const token = await dailyService.createMeetingToken({
      roomName,
      userId,
      userName,
      isOwner,
      expiresAt: result.window.closesAt,
    })

    return {
      status: 'ok',
      roomUrl: roomUrl as string,
      token,
      expiresAt: result.window.closesAt.toISOString(),
      role: result.role,
    }
  },
```

- [ ] **Step 3: Add the controller**

In `apps/api/src/controllers/sessionController.ts`, add this method to the `sessionController` object (after `decline`):

```typescript
  join: catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.auth?.userId) throw new AppError('Unauthenticated', 401)
    const sessionId = req.params['id'] as string
    if (!sessionId) throw new AppError('Missing session id', 400)
    const result = await sessionService.joinSession(req.auth.userId, sessionId)
    res.json(result)
  }),
```

- [ ] **Step 4: Register the route**

In `apps/api/src/routes/sessionRoutes.ts`, add after the decline line:

```typescript
sessionRoutes.post('/:id/join', requireAuth, sessionController.join)
```

- [ ] **Step 5: Verify it compiles**

Run: `cd apps/api && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Run the full api test suite**

Run: `cd apps/api && npm test`
Expected: PASS (12 tests from Tasks 4–5).

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/services/sessionService.ts apps/api/src/controllers/sessionController.ts apps/api/src/routes/sessionRoutes.ts
git commit -m "feat(api): POST /sessions/:id/join endpoint"
```

---

## Task 8: Frontend join hook

**Files:**
- Modify: `apps/web/src/hooks/useSessions.ts`

- [ ] **Step 1: Add the hook and response type**

At the top of `apps/web/src/hooks/useSessions.ts`, ensure `useMutation` is imported (it already is). Add at the end of the file:

```typescript
export type JoinSessionResponse =
  | { status: 'ok'; roomUrl: string; token: string; expiresAt: string; role: 'guide' | 'seeker' }
  | { status: 'too_early'; opensAt: string }
  | { status: 'expired' }

export function useJoinSession() {
  return useMutation({
    mutationFn: async (sessionId: string): Promise<JoinSessionResponse> => {
      const res = await apiClient.post<JoinSessionResponse>(`/sessions/${sessionId}/join`)
      return res.data
    },
  })
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd apps/web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/hooks/useSessions.ts
git commit -m "feat(web): useJoinSession hook"
```

---

## Task 9: Daily Prebuilt call page

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/src/pages/SessionCallPage.tsx`
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Install the Daily SDK**

Run: `cd apps/web && npm install @daily-co/daily-js`
Expected: `@daily-co/daily-js` added to dependencies.

- [ ] **Step 2: Create the call page**

Create `apps/web/src/pages/SessionCallPage.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DailyIframe, { type DailyCall } from '@daily-co/daily-js'
import { useJoinSession, type JoinSessionResponse } from '../hooks/useSessions'

type Phase =
  | { kind: 'loading' }
  | { kind: 'too_early'; opensAt: string }
  | { kind: 'expired' }
  | { kind: 'error'; message: string }
  | { kind: 'in_call' }

export function SessionCallPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const join = useJoinSession()
  const containerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<DailyCall | null>(null)
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' })

  useEffect(() => {
    let cancelled = false
    if (!id) return

    join.mutate(id, {
      onSuccess: (data: JoinSessionResponse) => {
        if (cancelled) return
        if (data.status === 'too_early') return setPhase({ kind: 'too_early', opensAt: data.opensAt })
        if (data.status === 'expired') return setPhase({ kind: 'expired' })
        if (!containerRef.current) return
        const frame = DailyIframe.createFrame(containerRef.current, {
          showLeaveButton: true,
          iframeStyle: { position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', border: '0' },
        })
        frameRef.current = frame
        frame.on('left-meeting', () => {
          frame.destroy()
          frameRef.current = null
          navigate('/sessions')
        })
        frame.join({ url: data.roomUrl, token: data.token })
        setPhase({ kind: 'in_call' })
      },
      onError: (err: unknown) => {
        if (cancelled) return
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Unable to join this session.'
        setPhase({ kind: 'error', message })
      },
    })

    return () => {
      cancelled = true
      frameRef.current?.destroy()
      frameRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // The Daily iframe container must exist in the DOM before createFrame runs
  // (in onSuccess), so it is always rendered; status UI overlays it until the
  // call is live, then the overlay is removed to reveal the embed.
  return (
    <div className="fixed inset-0 bg-black">
      <div ref={containerRef} className="absolute inset-0" />
      {phase.kind !== 'in_call' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          {phase.kind === 'loading' && (
            <>
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-text-muted">Connecting you to the session…</p>
            </>
          )}
          {phase.kind === 'too_early' && (
            <>
              <h1 className="text-lg font-semibold text-text-primary">This session isn’t open yet</h1>
              <p className="text-sm text-text-muted">
                You can join from {new Date(phase.opensAt).toLocaleString()} (10 minutes before the start).
              </p>
              <button onClick={() => navigate('/sessions')} className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/90">
                Back to sessions
              </button>
            </>
          )}
          {phase.kind === 'expired' && (
            <>
              <h1 className="text-lg font-semibold text-text-primary">This session’s join window has closed</h1>
              <button onClick={() => navigate('/sessions')} className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/90">
                Back to sessions
              </button>
            </>
          )}
          {phase.kind === 'error' && (
            <>
              <h1 className="text-lg font-semibold text-text-primary">Can’t join this session</h1>
              <p className="text-sm text-text-muted">{phase.message}</p>
              <button onClick={() => navigate('/sessions')} className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/90">
                Back to sessions
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Register the route**

In `apps/web/src/App.tsx`, add the import after the other page imports (e.g. after the `SessionsPage` import on line 12):

```typescript
import { SessionCallPage } from './pages/SessionCallPage'
```

Then add this route alongside the other protected routes (e.g. right after the `/sessions` route on line 127):

```tsx
        <Route path="/sessions/:id/call" element={<ProtectedRoute><SessionCallPage /></ProtectedRoute>} />
```

- [ ] **Step 4: Verify it compiles**

Run: `cd apps/web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/package.json apps/web/package-lock.json apps/web/src/pages/SessionCallPage.tsx apps/web/src/App.tsx
git commit -m "feat(web): Daily Prebuilt call page + route"
```

---

## Task 10: Wire the Join buttons

**Files:**
- Modify: `apps/web/src/pages/SessionsPage.tsx`
- Modify: `apps/web/src/pages/DashboardPage.tsx`

- [ ] **Step 1: Add navigation to SessionsPage**

In `apps/web/src/pages/SessionsPage.tsx`, ensure `useNavigate` is imported from `react-router-dom` (add it to the existing react-router-dom import). Inside the `SessionsPage` component, near the top, add:

```typescript
  const navigate = useNavigate()
```

Then replace the "Join Session" button (currently around line 137-139):

```tsx
                          <button className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary/90">
                            Join Session
                          </button>
```

with:

```tsx
                          <button
                            onClick={() => navigate(`/sessions/${session.id}/call`)}
                            disabled={session.status !== 'CONFIRMED'}
                            className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Join Session
                          </button>
```

- [ ] **Step 2: Verify SessionsPage compiles**

Run: `cd apps/web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Add navigation to DashboardPage**

In `apps/web/src/pages/DashboardPage.tsx`, ensure `useNavigate` is imported from `react-router-dom`. Inside the `DashboardPage` component, near the top where other hooks are declared, add (only if not already present):

```typescript
  const navigate = useNavigate()
```

- [ ] **Step 4: Wire the seeker Join button**

In `apps/web/src/pages/DashboardPage.tsx`, replace the seeker upcoming button (currently around line 504-512):

```tsx
                        <button
                          className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                            session.action === 'Join'
                              ? 'bg-primary text-white hover:bg-primary/90'
                              : 'border border-border bg-surface text-text-primary hover:bg-background'
                          }`}
                        >
                          {session.action}
                        </button>
```

with:

```tsx
                        <button
                          onClick={() => { if (session.action === 'Join') navigate(`/sessions/${session.id}/call`) }}
                          className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                            session.action === 'Join'
                              ? 'bg-primary text-white hover:bg-primary/90'
                              : 'border border-border bg-surface text-text-primary hover:bg-background'
                          }`}
                        >
                          {session.action}
                        </button>
```

- [ ] **Step 5: Wire the guide Join button**

In `apps/web/src/pages/DashboardPage.tsx`, replace the guide upcoming button (currently around line 571-579):

```tsx
                          <button
                            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                              session.action === 'Join' || session.action === 'Accept'
                                ? 'bg-primary text-white hover:bg-primary/90'
                                : 'border border-border bg-surface text-text-primary hover:bg-background'
                            }`}
                          >
                            {session.action}
                          </button>
```

with:

```tsx
                          <button
                            onClick={() => { if (session.action === 'Join') navigate(`/sessions/${session.id}/call`) }}
                            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                              session.action === 'Join' || session.action === 'Accept'
                                ? 'bg-primary text-white hover:bg-primary/90'
                                : 'border border-border bg-surface text-text-primary hover:bg-background'
                            }`}
                          >
                            {session.action}
                          </button>
```

(The guide `Accept` action keeps its current no-op behavior — accept is handled on the Requests page; this task only adds Join navigation.)

- [ ] **Step 6: Verify it compiles**

Run: `cd apps/web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/pages/SessionsPage.tsx apps/web/src/pages/DashboardPage.tsx
git commit -m "feat(web): wire Join buttons to the call page"
```

---

## Task 11: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Type-check both apps**

Run: `cd apps/api && npx tsc --noEmit && cd ../web && npx tsc --noEmit`
Expected: both clean.

- [ ] **Step 2: Run the api test suite**

Run: `cd apps/api && npm test`
Expected: PASS (12 tests).

- [ ] **Step 3: Manual end-to-end (requires real Daily credentials)**

Pre-req: set `DAILY_API_KEY` and `DAILY_DOMAIN` in `apps/api/.env` (from a Daily.co account). Restart the api.

Checklist:
1. As a seeker, book a session; as the mentor, accept it so it is CONFIRMED, scheduled to start within ~5 minutes.
2. Before the window opens (>10 min before), click Join → expect the "isn't open yet" screen with the opensAt time.
3. Within the window, the seeker clicks Join → lands in the Daily Prebuilt prejoin/call UI.
4. In a second browser, the mentor clicks Join → both land in the **same** room; a third join attempt is refused (2-participant cap).
5. Click Leave → returns to `/sessions`.

- [ ] **Step 4: Confirm no stray changes**

Run: `git status`
Expected: working tree clean (all changes committed across Tasks 1–10).

---

## Notes for the implementer

- **Daily credentials** are required only for Step 3 of Task 11 (manual test). All code and unit tests are independent of them.
- **Timing states are not errors:** `too_early`/`expired` return HTTP 200 with a `status` discriminator; the call page branches on it. Only `not_participant` (403) and `not_confirmed` (409) throw and surface via the `error` phase.
- **Idempotent rooms:** the room name is `session-<sessionId>`. If `SessionCall` already exists we reuse its URL and skip room creation; on the Daily side a duplicate create returns 409 which `createRoom` treats as success.
- **No session-status changes** happen here — that's Phase B (webhooks).