import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'

import { getCourse } from '@/lib/content'
import { resolveCohortAvailability } from '@/lib/courses/cohort-status'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { notifyRegistration } from '@/lib/notifications'
import { maskEmail, maskPhone } from '@/lib/notifications/types'
import { clientKey, hit, looksAutomated } from '@/lib/rate-limit'
import { getSanityWriteClient } from '@/lib/sanity/client'
import { createRegistrationSchema } from '@/lib/validation/schemas'

export const runtime = 'nodejs'

type ErrorCode =
  | 'invalid'
  | 'rate_limited'
  | 'cohort_unavailable'
  | 'course_not_found'
  | 'server_error'

function errorResponse(code: ErrorCode, status: number, fieldErrors?: Record<string, string>) {
  return NextResponse.json({ ok: false, code, fieldErrors }, { status })
}

/** مفتاح تكرار من البريد والدفعة — يمنع تسجيلين من نقرة مزدوجة (SPEC §7.3). */
function idempotencyKey(email: string, cohortId: string): string {
  return createHash('sha256').update(`${email}:${cohortId}`).digest('hex').slice(0, 32)
}

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return errorResponse('invalid', 400)
  }

  const rawLocale = (body as { locale?: string } | null)?.locale
  const locale: Locale = isLocale(rawLocale) ? rawLocale : 'ar'
  const dictionary = getDictionary(locale)

  const rateLimit = hit(clientKey(request, 'register'))
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, code: 'rate_limited' satisfies ErrorCode },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } },
    )
  }

  const parsed = createRegistrationSchema(dictionary.validation).safeParse(body)

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.')
      if (path && !fieldErrors[path]) fieldErrors[path] = issue.message
    }
    return errorResponse('invalid', 400, fieldErrors)
  }

  const data = parsed.data

  // فحوص السبام الصامتة: نعيد نجاحاً ظاهرياً حتى لا يتعلّم الآلي أي فحص أوقفه
  if (looksAutomated(data.loadedAt, data.website)) {
    console.warn('[register] rejected automated submission')
    return NextResponse.json({ ok: true, whatsappSent: false, spam: true })
  }

  const course = await getCourse(data.courseSlug, locale)
  if (!course) return errorResponse('course_not_found', 404)

  const cohort = course.cohorts.find((item) => item.id === data.cohortId)
  if (!cohort) return errorResponse('cohort_unavailable', 409)

  // التحقق من التوافر لحظة الإرسال لا لحظة عرض الصفحة — الدفعة قد تكون
  // امتلأت أثناء تعبئة النموذج (SPEC §7.1)
  const availability = resolveCohortAvailability(cohort)
  if (!availability.canRegister) {
    return errorResponse('cohort_unavailable', 409)
  }

  const payload = {
    registrationId: idempotencyKey(data.email, data.cohortId),
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    courseTitle: course.title,
    courseSlug: course.slug,
    cohortLabel: cohort.schedule,
    cohortStartDate: cohort.startDate,
    preferredMode: data.preferredMode,
    city: data.city?.trim() || null,
    experienceLevel: data.experienceLevel,
    registrationType: data.registrationType,
    companyName: data.companyName?.trim() || null,
    notes: data.notes?.trim() || null,
    locale,
  }

  // ١) حفظ الطلب أولاً — هو المخرج الوحيد الذي لا يجوز فقدانه
  const writeClient = getSanityWriteClient()
  let persisted = false

  if (writeClient) {
    try {
      await writeClient.createIfNotExists({
        _id: `registration.${payload.registrationId}`,
        _type: 'registration',
        course: { _type: 'reference', _ref: course.id },
        cohort: { _type: 'reference', _ref: cohort.id },
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        preferredMode: payload.preferredMode,
        city: payload.city,
        experienceLevel: payload.experienceLevel,
        registrationType: payload.registrationType,
        companyName: payload.companyName,
        notes: payload.notes,
        locale,
        status: 'new',
        source: 'website',
        submittedAt: new Date().toISOString(),
      })
      persisted = true
    } catch (error) {
      console.error(
        '[register] persistence failed',
        error instanceof Error ? error.message : error,
      )
    }
  }

  // ٢) الإشعارات بعدها — فشلها لا يُفشل التسجيل (SPEC §7.3 قاعدة ١)
  const { results } = await notifyRegistration(payload)
  const whatsapp = results.find((result) => result.channel === 'whatsapp')
  const email = results.find((result) => result.channel === 'email')

  console.info('[register] processed', {
    registrationId: payload.registrationId,
    course: course.slug,
    persisted,
    email: maskEmail(payload.email),
    phone: maskPhone(payload.phone),
    emailSent: email?.ok ?? false,
    whatsappSent: whatsapp?.ok ?? false,
  })

  if (!persisted && !email?.ok) {
    // لم يصل الطلب لأي مكان — هنا فقط يُعتبر التسجيل فاشلاً
    return errorResponse('server_error', 500)
  }

  return NextResponse.json({
    ok: true,
    registrationId: payload.registrationId,
    whatsappSent: whatsapp?.ok ?? false,
  })
}
