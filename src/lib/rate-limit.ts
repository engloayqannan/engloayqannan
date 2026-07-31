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

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

export function hit(
  key: string,
  { max = RATE_LIMIT_MAX, windowMs = RATE_LIMIT_WINDOW_MS } = {},
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

/** الحد الأدنى لزمن تعبئة النموذج — الأسرع منه إرسال آلي. */
export const MIN_FORM_FILL_MS = 3000

export function looksAutomated(
  loadedAt: number | undefined,
  honeypot: string | undefined,
  now: number = Date.now(),
): boolean {
  if (honeypot && honeypot.length > 0) return true
  if (typeof loadedAt === 'number' && now - loadedAt < MIN_FORM_FILL_MS) return true
  return false
}
