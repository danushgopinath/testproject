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
    // Accept either the bare subdomain ("acme") or the full host
    // ("acme.daily.co", with or without protocol) — normalize to the host.
    const host = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    const baseHost = host.endsWith('.daily.co') ? host : `${host}.daily.co`
    const url = `https://${baseHost}/${name}`

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