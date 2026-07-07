import nodemailer from 'nodemailer'
import { env } from '../config/env'

function createTransporter() {
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT ?? 587),
      secure: Number(env.SMTP_PORT ?? 587) === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  }
  // SMTP not configured — skip sending silently (dev)
  return null
}

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"

function fmtDate(d: Date): string {
  return d.toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  })
}

// A key/value detail card. Uses a table (email-safe) — NOT flexbox, which Gmail
// and Outlook strip, causing labels and values to collapse together.
function detailsCard(rows: { label: string; value: string }[]): string {
  const cells = rows
    .map((r, i) => {
      const border = i < rows.length - 1 ? 'border-bottom:1px solid rgba(7,7,56,.07);' : ''
      return `<tr>
        <td align="left" style="padding:11px 0;${border}color:rgba(7,7,56,.55);font-size:14px;padding-right:16px;vertical-align:top;">${r.label}</td>
        <td align="right" style="padding:11px 0;${border}color:#070738;font-size:14px;font-weight:600;text-align:right;vertical-align:top;">${r.value}</td>
      </tr>`
    })
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fc;border-radius:12px;margin:0 0 20px;">
    <tr><td style="padding:6px 20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${cells}</table>
    </td></tr>
  </table>`
}

function note(text: string): string {
  return `<p style="font-size:13px;color:rgba(7,7,56,.6);text-align:center;line-height:1.55;margin:0;">${text}</p>`
}

// Full responsive, table-based email shell.
function layout(opts: {
  preheader: string
  icon: string
  iconBg: string
  heading: string
  sub: string
  content: string
}): string {
  const year = new Date().getFullYear()
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f7fc;font-family:${FONT};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fc;padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(7,7,56,.08);">
      <tr><td style="background:#070738;padding:28px 32px;text-align:center;">
        <div style="color:#F5B400;font-size:22px;font-weight:700;letter-spacing:.3px;">Expertify</div>
        <div style="color:rgba(255,255,255,.7);font-size:13px;margin-top:6px;">Peer Mentorship Platform</div>
      </td></tr>
      <tr><td style="padding:30px 32px 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
          <div style="width:56px;height:56px;line-height:56px;background:${opts.iconBg};border-radius:50%;font-size:26px;text-align:center;">${opts.icon}</div>
        </td></tr></table>
        <h2 style="text-align:center;color:#070738;font-size:20px;font-weight:700;margin:18px 0 8px;">${opts.heading}</h2>
        <p style="text-align:center;color:rgba(7,7,56,.55);font-size:14px;line-height:1.55;margin:0 0 24px;">${opts.sub}</p>
        ${opts.content}
      </td></tr>
      <tr><td style="text-align:center;padding:18px 32px;color:rgba(7,7,56,.4);font-size:12px;border-top:1px solid rgba(7,7,56,.06);">© ${year} Expertify · All rights reserved</td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
}

function fromAddress(): string {
  return env.SMTP_USER ?? env.SMTP_FROM_EMAIL ?? 'noreply@expertify.io'
}

export async function sendPasswordResetEmail(opts: {
  to: string
  name: string
  resetUrl: string
}) {
  const transporter = createTransporter()
  if (!transporter) return

  const button = `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;"><tr><td style="border-radius:10px;background:#070738;">
    <a href="${opts.resetUrl}" style="display:inline-block;padding:12px 26px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">Reset password</a>
  </td></tr></table>`

  await transporter.sendMail({
    from: `"Expertify" <${fromAddress()}>`,
    to: opts.to,
    subject: 'Reset your Expertify password',
    html: layout({
      preheader: 'Reset your password — this link expires in 30 minutes.',
      icon: '🔒',
      iconBg: '#e0e7ff',
      heading: 'Reset your password',
      sub: `Hi ${opts.name}, we received a request to reset your password. This link expires in 30 minutes.`,
      content:
        button +
        note(`If you didn't request this, you can safely ignore this email — your password won't change.<br/><br/>Button not working? Paste this link into your browser:<br/><span style="word-break:break-all;color:#070738;">${opts.resetUrl}</span>`),
    }),
  })
}

export async function sendBookingPlacedEmail(opts: {
  to: string
  seekerName: string
  guideName: string
  scheduledAt: Date
  durationMinutes: number
  sessionType: string
  totalCost: number
}) {
  const transporter = createTransporter()
  if (!transporter) return

  await transporter.sendMail({
    from: `"Expertify" <${fromAddress()}>`,
    to: opts.to,
    subject: `Booking request sent to ${opts.guideName}`,
    html: layout({
      preheader: `Your request to ${opts.guideName} is pending approval.`,
      icon: '⏳',
      iconBg: '#fef3c7',
      heading: 'Booking Request Sent',
      sub: `Hi ${opts.seekerName}, we've sent your session request to ${opts.guideName}. They'll respond shortly.`,
      content:
        detailsCard([
          { label: 'Mentor', value: opts.guideName },
          { label: 'Date & Time', value: fmtDate(opts.scheduledAt) },
          { label: 'Duration', value: `${opts.durationMinutes} minutes` },
          { label: 'Session Type', value: opts.sessionType },
          { label: 'Total', value: `$${opts.totalCost.toFixed(2)}` },
        ]) +
        note(`Your booking is <strong>pending mentor approval</strong>. You'll receive an email and notification once they accept or decline.`),
    }),
  })
}

export async function sendSessionRequestEmail(opts: {
  to: string
  guideName: string
  seekerName: string
  scheduledAt: Date
  durationMinutes: number
  sessionType: string
  totalCost: number
}) {
  const transporter = createTransporter()
  if (!transporter) return

  await transporter.sendMail({
    from: `"Expertify" <${fromAddress()}>`,
    to: opts.to,
    subject: `New session request from ${opts.seekerName}`,
    html: layout({
      preheader: `${opts.seekerName} requested a session with you.`,
      icon: '📅',
      iconBg: '#fef9ec',
      heading: 'New Session Request',
      sub: `Hi ${opts.guideName}, you have a new session request from ${opts.seekerName}.`,
      content:
        detailsCard([
          { label: 'From', value: opts.seekerName },
          { label: 'Date & Time', value: fmtDate(opts.scheduledAt) },
          { label: 'Duration', value: `${opts.durationMinutes} minutes` },
          { label: 'Session Type', value: opts.sessionType },
          { label: 'Total', value: `$${opts.totalCost.toFixed(2)}` },
        ]) +
        note(`Log in to your Expertify dashboard to accept or decline this request.`),
    }),
  })
}

export async function sendSessionDeclinedEmail(opts: {
  to: string
  seekerName: string
  guideName: string
  scheduledAt: Date
}) {
  const transporter = createTransporter()
  if (!transporter) return

  await transporter.sendMail({
    from: `"Expertify" <${fromAddress()}>`,
    to: opts.to,
    subject: `Update on your session request with ${opts.guideName}`,
    html: layout({
      preheader: `${opts.guideName} couldn't take your session request.`,
      icon: '✕',
      iconBg: '#fee2e2',
      heading: 'Session Not Available',
      sub: `Hi ${opts.seekerName}, unfortunately ${opts.guideName} is unable to take your session request for ${fmtDate(opts.scheduledAt)}.`,
      content: note(`Don't worry — browse other mentors and find a great fit for your goals!`),
    }),
  })
}

export async function sendSessionConfirmationEmail(opts: {
  to: string
  seekerName: string
  guideName: string
  scheduledAt: Date
  durationMinutes: number
  sessionType: string
  totalCost: number
}) {
  const transporter = createTransporter()
  if (!transporter) return

  await transporter.sendMail({
    from: `"Expertify" <${fromAddress()}>`,
    to: opts.to,
    subject: `Your session with ${opts.guideName} is confirmed!`,
    html: layout({
      preheader: `Your session with ${opts.guideName} is confirmed.`,
      icon: '✓',
      iconBg: '#dcfce7',
      heading: 'Booking Confirmed!',
      sub: `Hi ${opts.seekerName}, your session has been successfully booked.`,
      content:
        detailsCard([
          { label: 'Mentor', value: opts.guideName },
          { label: 'Date & Time', value: fmtDate(opts.scheduledAt) },
          { label: 'Duration', value: `${opts.durationMinutes} minutes` },
          { label: 'Session Type', value: opts.sessionType },
          { label: 'Total Paid', value: `$${opts.totalCost.toFixed(2)}` },
        ]) +
        note(`You'll receive a video call link before your session starts.<br/>Free cancellation up to 24 hours before the session.`),
    }),
  })
}