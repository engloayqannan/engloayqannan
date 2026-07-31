import { NextResponse } from 'next/server'

import { isLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { sendContactEmail } from '@/lib/notifications'
import { maskEmail } from '@/lib/notifications/types'
import { clientKey, hit, isHoneypotTripped, isSuspiciouslyFast } from '@/lib/rate-limit'
import { getSanityWriteClient } from '@/lib/sanity/client'
import { createContactSchema } from '@/lib/validation/schemas'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, code: 'invalid' }, { status: 400 })
  }

  const rawLocale = (body as { locale?: string } | null)?.locale
  const locale: Locale = isLocale(rawLocale) ? rawLocale : 'ar'
  const dictionary = getDictionary(locale)

  const rateLimit = hit(clientKey(request, 'contact'))
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, code: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } },
    )
  }

  const parsed = createContactSchema(dictionary.validation).safeParse(body)

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.')
      if (path && !fieldErrors[path]) fieldErrors[path] = issue.message
    }
    return NextResponse.json({ ok: false, code: 'invalid', fieldErrors }, { status: 400 })
  }

  const data = parsed.data

  if (isHoneypotTripped(data.website)) {
    console.warn('[contact] rejected honeypot submission')
    return NextResponse.json({ ok: true, spam: true })
  }

  const suspiciouslyFast = isSuspiciouslyFast(data.loadedAt)

  const writeClient = getSanityWriteClient()
  let persisted = false

  if (writeClient) {
    try {
      await writeClient.create({
        _type: 'contactMessage',
        fullName: data.fullName,
        email: data.email,
        inquiryType: data.inquiryType,
        message: data.message,
        locale,
        status: 'new',
        suspectedAutomation: suspiciouslyFast,
        submittedAt: new Date().toISOString(),
      })
      persisted = true
    } catch (error) {
      console.error('[contact] persistence failed', error instanceof Error ? error.message : error)
    }
  }

  const result = await sendContactEmail({
    fullName: data.fullName,
    email: data.email,
    inquiryType: data.inquiryType,
    message: data.message,
    locale,
  })

  console.info('[contact] processed', {
    from: maskEmail(data.email),
    type: data.inquiryType,
    persisted,
    emailSent: result.ok,
    suspiciouslyFast,
  })

  if (!persisted && !result.ok) {
    return NextResponse.json({ ok: false, code: 'server_error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
