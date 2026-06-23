// Refund policy for a seeker cancelling a session.
//
//   PENDING (not yet accepted) → full refund, always free
//   CONFIRMED:
//     >= 24h before start → full refund (free)
//     12h–24h before      → 50% refund (50% charge)
//     3h–12h before       → 25% refund (75% charge)
//     < 3h before         → no refund

export type RefundTier = 'pending_free' | 'free' | 'partial_50' | 'partial_25' | 'none'

export interface RefundResult {
  tier: RefundTier
  refundCents: number
  chargeCents: number
  refundPct: number
  label: string
}

export function calculateRefund(params: {
  status: string
  scheduledAt: Date
  now: Date
  totalCost: number // cents
}): RefundResult {
  const { status, scheduledAt, now, totalCost } = params

  const build = (tier: RefundTier, refundPct: number, label: string): RefundResult => {
    const refundCents = Math.round((totalCost * refundPct) / 100)
    return { tier, refundPct, label, refundCents, chargeCents: totalCost - refundCents }
  }

  if (status === 'PENDING') {
    return build('pending_free', 100, 'Full refund — the mentor hasn’t accepted yet')
  }

  if (status !== 'CONFIRMED') {
    // COMPLETED / CANCELLED aren't cancellable; treated as no refund defensively.
    return build('none', 0, 'No refund')
  }

  const hoursUntil = (scheduledAt.getTime() - now.getTime()) / (60 * 60 * 1000)
  if (hoursUntil >= 24) return build('free', 100, 'Full refund — more than 24 hours notice')
  if (hoursUntil >= 12) return build('partial_50', 50, '50% refund — 12–24 hours notice')
  if (hoursUntil >= 3) return build('partial_25', 25, '25% refund — 3–12 hours notice')
  return build('none', 0, 'No refund — less than 3 hours notice')
}