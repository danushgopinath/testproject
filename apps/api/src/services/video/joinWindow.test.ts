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