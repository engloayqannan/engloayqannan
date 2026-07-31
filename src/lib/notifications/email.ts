import { Resend } from 'resend'

import { maskEmail, type ChannelResult, type ContactPayload, type RegistrationPayload } from './types'

const FROM_FALLBACK = 'onboarding@resend.dev'

function readConfig() {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.NOTIFICATION_EMAIL_TO

  if (!apiKey || !to) return null

  return { apiKey, to, from: process.env.NOTIFICATION_EMAIL_FROM ?? FROM_FALLBACK }
}

export function isEmailEnabled(): boolean {
  return readConfig() !== null
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function registrationHtml(payload: RegistrationPayload): string {
  const rows: [string, string][] = [
    ['Name', payload.fullName],
    ['Email', payload.email],
    ['Phone', payload.phone],
    ['Course', payload.courseTitle],
    ['Cohort', payload.cohortLabel],
    ['Start', payload.cohortStartDate ?? '—'],
    ['Mode', payload.preferredMode],
    ['City', payload.city ?? '—'],
    ['Level', payload.experienceLevel],
    ['Type', payload.registrationType],
    ['Company', payload.companyName ?? '—'],
    ['Locale', payload.locale],
    ['Notes', payload.notes ?? '—'],
  ]

  return `<table style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px">
${rows
  .map(
    ([label, value]) =>
      `<tr><td style="padding:6px 12px;color:#55606e">${label}</td><td style="padding:6px 12px;font-weight:600">${escapeHtml(value)}</td></tr>`,
  )
  .join('\n')}
</table>`
}

/** تأكيد للمتدرّب باتجاه صحيح حسب لغته. */
function traineeConfirmationHtml(payload: RegistrationPayload): string {
  const isArabic = payload.locale === 'ar'
  const dir = isArabic ? 'rtl' : 'ltr'

  const body = isArabic
    ? `<p>مرحباً ${escapeHtml(payload.fullName)},</p>
       <p>استلمنا طلب تسجيلك في دورة <strong>${escapeHtml(payload.courseTitle)}</strong>.</p>
       <p>سنتواصل معك خلال ٢٤ ساعة لتأكيد المقعد وتفاصيل الدفع.</p>`
    : `<p>Hi ${escapeHtml(payload.fullName)},</p>
       <p>We received your registration for <strong>${escapeHtml(payload.courseTitle)}</strong>.</p>
       <p>You will hear from us within 24 hours to confirm your seat and payment details.</p>`

  return `<div dir="${dir}" style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.7">${body}</div>`
}

export async function sendRegistrationEmails(
  payload: RegistrationPayload,
): Promise<ChannelResult> {
  const config = readConfig()

  if (!config) {
    console.warn('[email] not configured — skipping registration emails')
    return { channel: 'email', ok: false, skipped: true }
  }

  try {
    const resend = new Resend(config.apiKey)

    // تنبيه المدرّب أولاً: هو الإشعار الذي لا يجوز فقدانه
    const trainerResult = await resend.emails.send({
      from: config.from,
      to: config.to,
      replyTo: payload.email,
      subject: `New registration — ${payload.courseTitle} (${payload.fullName})`,
      html: registrationHtml(payload),
    })

    if (trainerResult.error) throw new Error(trainerResult.error.message)

    await resend.emails.send({
      from: config.from,
      to: payload.email,
      subject:
        payload.locale === 'ar'
          ? `تأكيد استلام التسجيل — ${payload.courseTitle}`
          : `Registration received — ${payload.courseTitle}`,
      html: traineeConfirmationHtml(payload),
    })

    return { channel: 'email', ok: true, skipped: false }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    console.error('[email] registration send failed', { to: maskEmail(payload.email), message })
    return { channel: 'email', ok: false, skipped: false, error: message }
  }
}

export async function sendContactEmail(payload: ContactPayload): Promise<ChannelResult> {
  const config = readConfig()

  if (!config) {
    console.warn('[email] not configured — skipping contact email')
    return { channel: 'email', ok: false, skipped: true }
  }

  try {
    const resend = new Resend(config.apiKey)

    const result = await resend.emails.send({
      from: config.from,
      to: config.to,
      replyTo: payload.email,
      subject: `Contact form — ${payload.inquiryType} (${payload.fullName})`,
      html: `<div style="font-family:system-ui,sans-serif;font-size:14px">
        <p><strong>From:</strong> ${escapeHtml(payload.fullName)} &lt;${escapeHtml(payload.email)}&gt;</p>
        <p><strong>Type:</strong> ${escapeHtml(payload.inquiryType)}</p>
        <p><strong>Locale:</strong> ${payload.locale}</p>
        <hr />
        <p style="white-space:pre-wrap">${escapeHtml(payload.message)}</p>
      </div>`,
    })

    if (result.error) throw new Error(result.error.message)

    return { channel: 'email', ok: true, skipped: false }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    console.error('[email] contact send failed', { from: maskEmail(payload.email), message })
    return { channel: 'email', ok: false, skipped: false, error: message }
  }
}
