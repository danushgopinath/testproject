import type { RefundInfo } from '../hooks/useSessions'

// Mirror of the backend refund policy (apps/api/src/services/session/cancellation.ts)
// used only to preview the refund in the cancel modal. The backend is authoritative.
export function estimateRefund(status: string, scheduledAtISO: string, totalCost: number): RefundInfo {
  const build = (tier: RefundInfo['tier'], refundPct: number, label: string): RefundInfo => {
    const refundCents = Math.round((totalCost * refundPct) / 100)
    return { tier, refundPct, label, refundCents, chargeCents: totalCost - refundCents }
  }

  if (status === 'PENDING') return build('pending_free', 100, 'Full refund — the mentor hasn’t accepted yet')
  if (status !== 'CONFIRMED') return build('none', 0, 'No refund')

  const hoursUntil = (new Date(scheduledAtISO).getTime() - Date.now()) / (60 * 60 * 1000)
  if (hoursUntil >= 24) return build('free', 100, 'Full refund — more than 24 hours notice')
  if (hoursUntil >= 12) return build('partial_50', 50, '50% refund — 12–24 hours notice')
  if (hoursUntil >= 3) return build('partial_25', 25, '25% refund — 3–12 hours notice')
  return build('none', 0, 'No refund — less than 3 hours notice')
}