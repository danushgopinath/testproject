import { describe, it, expect } from 'vitest'
import { calculateRefund } from './cancellation'

const scheduled = new Date('2026-07-01T15:00:00.000Z')
const cost = 10000 // $100.00 in cents

const at = (hoursBefore: number) => new Date(scheduled.getTime() - hoursBefore * 60 * 60 * 1000)

describe('calculateRefund', () => {
  it('PENDING is always a full free refund regardless of time', () => {
    const r = calculateRefund({ status: 'PENDING', scheduledAt: scheduled, now: at(1), totalCost: cost })
    expect(r.tier).toBe('pending_free')
    expect(r.refundCents).toBe(10000)
    expect(r.chargeCents).toBe(0)
  })

  it('CONFIRMED >24h → full refund', () => {
    const r = calculateRefund({ status: 'CONFIRMED', scheduledAt: scheduled, now: at(25), totalCost: cost })
    expect(r.tier).toBe('free')
    expect(r.refundCents).toBe(10000)
  })

  it('CONFIRMED exactly 24h → full refund', () => {
    const r = calculateRefund({ status: 'CONFIRMED', scheduledAt: scheduled, now: at(24), totalCost: cost })
    expect(r.tier).toBe('free')
  })

  it('CONFIRMED 12–24h → 50% refund', () => {
    const r = calculateRefund({ status: 'CONFIRMED', scheduledAt: scheduled, now: at(20), totalCost: cost })
    expect(r.tier).toBe('partial_50')
    expect(r.refundCents).toBe(5000)
    expect(r.chargeCents).toBe(5000)
  })

  it('CONFIRMED 3–12h → 25% refund', () => {
    const r = calculateRefund({ status: 'CONFIRMED', scheduledAt: scheduled, now: at(5), totalCost: cost })
    expect(r.tier).toBe('partial_25')
    expect(r.refundCents).toBe(2500)
    expect(r.chargeCents).toBe(7500)
  })

  it('CONFIRMED <3h → no refund', () => {
    const r = calculateRefund({ status: 'CONFIRMED', scheduledAt: scheduled, now: at(1), totalCost: cost })
    expect(r.tier).toBe('none')
    expect(r.refundCents).toBe(0)
    expect(r.chargeCents).toBe(10000)
  })
})