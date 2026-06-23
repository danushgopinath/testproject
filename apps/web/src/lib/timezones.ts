// IANA timezone helpers used by the availability + booking flows.

// Full IANA list when the browser supports it; otherwise a sensible fallback.
export const ALL_TIMEZONES: string[] = (() => {
  try {
    const supported = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf
    if (supported) return supported('timeZone')
  } catch {
    /* fall through */
  }
  return [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Sao_Paulo',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Kolkata',
    'Asia/Dubai',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney',
  ]
})()

export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

// Offset (timeZone − UTC) in ms for the given instant.
function tzOffsetMs(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const parts = dtf.formatToParts(date)
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  // 'hour' can come back as 24 at midnight in some engines.
  const hour = get('hour') % 24
  const asUTC = Date.UTC(get('year'), get('month') - 1, get('day'), hour, get('minute'), get('second'))
  return asUTC - date.getTime()
}

// Interpret a wall-clock time (y, monthIndex, day, hour, minute) as being in
// `timeZone` and return the corresponding absolute UTC instant.
export function zonedWallClockToUtc(
  year: number,
  monthIndex: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const guessUtc = Date.UTC(year, monthIndex, day, hour, minute)
  const offset = tzOffsetMs(new Date(guessUtc), timeZone)
  return new Date(guessUtc - offset)
}

// Format an instant's time (and optionally date) in a given timezone.
export function formatTimeInTz(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatDateTimeInTz(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

// Short label like "GMT+5:30" for a timezone at the current instant.
export function tzShortLabel(timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' }).formatToParts(new Date())
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? timeZone
  } catch {
    return timeZone
  }
}