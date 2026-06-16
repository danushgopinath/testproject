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