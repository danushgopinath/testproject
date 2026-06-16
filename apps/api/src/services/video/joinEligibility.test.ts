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