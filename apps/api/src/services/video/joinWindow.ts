// TEMPORARY (testing): join opens 2 days before start so sessions are easy to
// join without waiting. REVERT to `10 * 60 * 1000` (10 min) before production.
const OPEN_LEAD_MS = 2 * 24 * 60 * 60 * 1000
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