// Builds a Google Calendar "add event" template URL (no OAuth needed — opens
// the prefilled event in the user's calendar).
export function googleCalendarUrl(opts: {
  title: string
  startISO: string
  durationMinutes: number
  details?: string
}): string {
  const start = new Date(opts.startISO)
  const end = new Date(start.getTime() + opts.durationMinutes * 60_000)
  // Google expects compact UTC: YYYYMMDDTHHMMSSZ
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: opts.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: opts.details ?? '',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}