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
  // Ethereal test account fallback — only in dev
  return null
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

  const dateStr = opts.scheduledAt.toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  })
  const from = env.SMTP_USER ?? 'noreply@expertify.io'

  await transporter.sendMail({
    from: `"Expertify" <${from}>`,
    to: opts.to,
    subject: `Booking request sent to ${opts.guideName}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f7fc;margin:0;padding:0;}
.wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(7,7,56,.08);}
.header{background:#070738;padding:32px 32px 24px;text-align:center;}
.header h1{color:#F5B400;margin:0;font-size:22px;}
.header p{color:rgba(255,255,255,.7);margin:6px 0 0;font-size:14px;}
.body{padding:28px 32px;}
.icon{width:52px;height:52px;background:#fef3c7;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px;}
h2{text-align:center;color:#070738;font-size:20px;margin:0 0 6px;}
.sub{text-align:center;color:rgba(7,7,56,.55);font-size:14px;margin:0 0 24px;}
.details{background:#f5f7fc;border-radius:12px;padding:18px 20px;margin-bottom:20px;}
.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(7,7,56,.06);font-size:14px;}
.row:last-child{border-bottom:none;}
.label{color:rgba(7,7,56,.55);}
.value{font-weight:600;color:#070738;}
.footer{text-align:center;padding:20px 32px;color:rgba(7,7,56,.4);font-size:12px;border-top:1px solid rgba(7,7,56,.06);}
</style></head><body>
<div class="wrap">
  <div class="header"><h1>Expertify</h1><p>Peer Mentorship Platform</p></div>
  <div class="body">
    <div class="icon">⏳</div>
    <h2>Booking Request Sent</h2>
    <p class="sub">Hi ${opts.seekerName}, we've sent your session request to ${opts.guideName}. They'll respond shortly.</p>
    <div class="details">
      <div class="row"><span class="label">Mentor</span><span class="value">${opts.guideName}</span></div>
      <div class="row"><span class="label">Date &amp; Time</span><span class="value">${dateStr}</span></div>
      <div class="row"><span class="label">Duration</span><span class="value">${opts.durationMinutes} minutes</span></div>
      <div class="row"><span class="label">Session Type</span><span class="value">${opts.sessionType}</span></div>
      <div class="row"><span class="label">Total</span><span class="value">$${opts.totalCost.toFixed(2)}</span></div>
    </div>
    <p style="font-size:13px;color:rgba(7,7,56,.6);text-align:center;">
      Your booking is <strong>pending mentor approval</strong>. You'll receive an email and notification once they accept or decline.
    </p>
  </div>
  <div class="footer">© ${new Date().getFullYear()} Expertify · All rights reserved</div>
</div>
</body></html>`,
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

  const dateStr = opts.scheduledAt.toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  })
  const from = env.SMTP_USER ?? 'noreply@expertify.io'

  await transporter.sendMail({
    from: `"Expertify" <${from}>`,
    to: opts.to,
    subject: `New session request from ${opts.seekerName}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f7fc;margin:0;padding:0;}
.wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(7,7,56,.08);}
.header{background:#070738;padding:32px 32px 24px;text-align:center;}
.header h1{color:#F5B400;margin:0;font-size:22px;}
.header p{color:rgba(255,255,255,.7);margin:6px 0 0;font-size:14px;}
.body{padding:28px 32px;}
.icon{width:52px;height:52px;background:#fef9ec;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px;}
h2{text-align:center;color:#070738;font-size:20px;margin:0 0 6px;}
.sub{text-align:center;color:rgba(7,7,56,.55);font-size:14px;margin:0 0 24px;}
.details{background:#f5f7fc;border-radius:12px;padding:18px 20px;margin-bottom:20px;}
.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(7,7,56,.06);font-size:14px;}
.row:last-child{border-bottom:none;}
.label{color:rgba(7,7,56,.55);}
.value{font-weight:600;color:#070738;}
.footer{text-align:center;padding:20px 32px;color:rgba(7,7,56,.4);font-size:12px;border-top:1px solid rgba(7,7,56,.06);}
</style></head><body>
<div class="wrap">
  <div class="header"><h1>Expertify</h1><p>Peer Mentorship Platform</p></div>
  <div class="body">
    <div class="icon">📅</div>
    <h2>New Session Request</h2>
    <p class="sub">Hi ${opts.guideName}, you have a new session request from ${opts.seekerName}.</p>
    <div class="details">
      <div class="row"><span class="label">From</span><span class="value">${opts.seekerName}</span></div>
      <div class="row"><span class="label">Date &amp; Time</span><span class="value">${dateStr}</span></div>
      <div class="row"><span class="label">Duration</span><span class="value">${opts.durationMinutes} minutes</span></div>
      <div class="row"><span class="label">Session Type</span><span class="value">${opts.sessionType}</span></div>
      <div class="row"><span class="label">Total</span><span class="value">$${opts.totalCost.toFixed(2)}</span></div>
    </div>
    <p style="font-size:13px;color:rgba(7,7,56,.6);text-align:center;">
      Log in to your Expertify dashboard to accept or decline this request.
    </p>
  </div>
  <div class="footer">© ${new Date().getFullYear()} Expertify · All rights reserved</div>
</div>
</body></html>`,
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

  const dateStr = opts.scheduledAt.toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  })
  const from = env.SMTP_USER ?? 'noreply@expertify.io'

  await transporter.sendMail({
    from: `"Expertify" <${from}>`,
    to: opts.to,
    subject: `Update on your session request with ${opts.guideName}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f7fc;margin:0;padding:0;}
.wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(7,7,56,.08);}
.header{background:#070738;padding:32px 32px 24px;text-align:center;}
.header h1{color:#F5B400;margin:0;font-size:22px;}
.header p{color:rgba(255,255,255,.7);margin:6px 0 0;font-size:14px;}
.body{padding:28px 32px;}
.icon{width:52px;height:52px;background:#fee2e2;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px;}
h2{text-align:center;color:#070738;font-size:20px;margin:0 0 6px;}
.sub{text-align:center;color:rgba(7,7,56,.55);font-size:14px;margin:0 0 24px;}
.footer{text-align:center;padding:20px 32px;color:rgba(7,7,56,.4);font-size:12px;border-top:1px solid rgba(7,7,56,.06);}
</style></head><body>
<div class="wrap">
  <div class="header"><h1>Expertify</h1><p>Peer Mentorship Platform</p></div>
  <div class="body">
    <div class="icon">✕</div>
    <h2>Session Not Available</h2>
    <p class="sub">Hi ${opts.seekerName}, unfortunately ${opts.guideName} is unable to take your session request for ${dateStr}.</p>
    <p style="font-size:13px;color:rgba(7,7,56,.6);text-align:center;">
      Don't worry — browse other mentors and find a great fit for your goals!
    </p>
  </div>
  <div class="footer">© ${new Date().getFullYear()} Expertify · All rights reserved</div>
</div>
</body></html>`,
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
  if (!transporter) return // SMTP not configured — skip silently

  const dateStr = opts.scheduledAt.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  // Gmail requires the from address to match the authenticated account
  const from = env.SMTP_USER ?? env.SMTP_FROM_EMAIL ?? 'noreply@expertify.io'

  await transporter.sendMail({
    from: `"Expertify" <${from}>`,
    to: opts.to,
    subject: `Your session with ${opts.guideName} is confirmed!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f7fc; margin: 0; padding: 0; }
    .wrap { max-width: 560px; margin: 32px auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid rgba(7,7,56,.08); }
    .header { background: #070738; padding: 32px 32px 24px; text-align: center; }
    .header h1 { color: #F5B400; margin: 0; font-size: 22px; letter-spacing: .5px; }
    .header p { color: rgba(255,255,255,.7); margin: 6px 0 0; font-size: 14px; }
    .body { padding: 28px 32px; }
    .check { width: 52px; height: 52px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 24px; }
    h2 { text-align: center; color: #070738; font-size: 20px; margin: 0 0 6px; }
    .sub { text-align: center; color: rgba(7,7,56,.55); font-size: 14px; margin: 0 0 24px; }
    .details { background: #f5f7fc; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(7,7,56,.06); font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .label { color: rgba(7,7,56,.55); }
    .value { font-weight: 600; color: #070738; }
    .footer { text-align: center; padding: 20px 32px; color: rgba(7,7,56,.4); font-size: 12px; border-top: 1px solid rgba(7,7,56,.06); }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>Expertify</h1>
      <p>Peer Mentorship Platform</p>
    </div>
    <div class="body">
      <div class="check">✓</div>
      <h2>Booking Confirmed!</h2>
      <p class="sub">Hi ${opts.seekerName}, your session has been successfully booked.</p>
      <div class="details">
        <div class="row"><span class="label">Mentor</span><span class="value">${opts.guideName}</span></div>
        <div class="row"><span class="label">Date &amp; Time</span><span class="value">${dateStr}</span></div>
        <div class="row"><span class="label">Duration</span><span class="value">${opts.durationMinutes} minutes</span></div>
        <div class="row"><span class="label">Session Type</span><span class="value">${opts.sessionType}</span></div>
        <div class="row"><span class="label">Total Paid</span><span class="value">$${opts.totalCost.toFixed(2)}</span></div>
      </div>
      <p style="font-size:13px;color:rgba(7,7,56,.6);text-align:center;">
        You will receive a video call link 30 minutes before your session starts.<br/>
        Free cancellation up to 24 hours before the session.
      </p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} Expertify · All rights reserved</div>
  </div>
</body>
</html>
    `,
  })
}