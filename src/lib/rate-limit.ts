/**
 * تحديد معدّل الطلبات (SPEC §7.5).
 *
 * التنفيذ الحالي داخل الذاكرة: يحمي نسخة واحدة من الخادم فقط، وهو كافٍ
 * لموقع بحجم هذا المشروع. عند توقع حمل أعلى أو عدة نسخ على Vercel،
 * يُستبدل `hit` بتنفيذ Upstash Redis دون تغيير المستدعي.
 */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export const RATE_LIMIT_MAX = 5
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000

/**
 * الحدّ الافتراضي يحمي الإنتاج. يُرفع في بيئة الاختبار فقط لأن كل
 * الاختبارات تأتي من عنوان واحد فتصطدم ببعضها لا بالحماية.
 */
function configuredMax(): number {
  const raw = Number.parseInt(process.env.RATE_LIMIT_MAX ?? '', 10)
  return Number.isFinite(raw) && raw > 0 ? raw : RATE_LIMIT_MAX
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

export function hit(
  key: string,
  { max = configuredMax(), windowMs = RATE_LIMIT_WINDOW_MS }: { max?: number; windowMs?: number } = {},
  now: number = Date.now(),
): RateLimitResult {
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1, retryAfterSeconds: 0 }
  }

  bucket.count += 1

  if (bucket.count > max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    }
  }

  return { allowed: true, remaining: max - bucket.count, retryAfterSeconds: 0 }
}

/** للاختبارات — لا يُستدعى في الإنتاج. */
export function resetRateLimits(): void {
  buckets.clear()
}

export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
  return `${scope}:${ip}`
}

/**
 * حقل الشرك إشارة قاطعة: لا متصفح بشري يملؤه، فرفض الطلب آمن.
 */
export function isHoneypotTripped(honeypot: string | undefined): boolean {
  return typeof honeypot === 'string' && honeypot.length > 0
}

/** الزمن الذي يُعدّ ما دونه إرسالاً سريعاً غير معتاد. */
export const MIN_FORM_FILL_MS = 3000

/**
 * السرعة إشارة ظنّية لا قاطعة: مستخدم يستعمل التعبئة التلقائية أو مدير
 * كلمات مرور قد يرسل النموذج في ثانيتين. لذلك لا تُرفض الطلبات السريعة —
 * تُعلَّم فقط ليراها المدرّب. فقدان تسجيل حقيقي أسوأ من مرور رسالة سبام.
 */
export function isSuspiciouslyFast(
  loadedAt: number | undefined,
  now: number = Date.now(),
): boolean {
  return typeof loadedAt === 'number' && now - loadedAt < MIN_FORM_FILL_MS
}
