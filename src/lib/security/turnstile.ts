const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Cloudflare Turnstile خلف علم بيئة (SPEC §7.5).
 *
 * معطّل افتراضياً عن قصد: إثقال النموذج بتحدٍّ قبل ظهور سبام فعلي يخفض
 * معدل إتمام التسجيل مقابل مشكلة غير موجودة. حين تظهر الحاجة تُضبط
 * المفاتيح فيُفعَّل الفحص على الخادم والودجت على العميل معاً.
 */
export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY)
}

export interface TurnstileResult {
  ok: boolean
  skipped: boolean
  error?: string
}

export async function verifyTurnstile(
  token: string | undefined,
  remoteIp?: string | null,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return { ok: true, skipped: true }

  if (!token) return { ok: false, skipped: false, error: 'missing_token' }

  try {
    const body = new URLSearchParams({ secret, response: token })
    if (remoteIp) body.set('remoteip', remoteIp)

    const response = await fetch(VERIFY_URL, { method: 'POST', body })

    if (!response.ok) {
      // تعذّر الوصول للخدمة ليس ذنب المستخدم: نمرّر الطلب ونسجّل التحذير
      // بدل رفض تسجيل حقيقي بسبب عطل خارجي
      console.warn('[turnstile] verification unreachable', response.status)
      return { ok: true, skipped: true, error: `http_${response.status}` }
    }

    const result = (await response.json()) as { success?: boolean; 'error-codes'?: string[] }

    return {
      ok: result.success === true,
      skipped: false,
      error: result.success ? undefined : (result['error-codes']?.join(',') ?? 'failed'),
    }
  } catch (error) {
    console.warn('[turnstile] verification failed', error instanceof Error ? error.message : error)
    return { ok: true, skipped: true, error: 'unreachable' }
  }
}
