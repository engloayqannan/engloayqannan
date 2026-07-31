import type { RegistrationPayload } from '@/lib/notifications/types'

/**
 * مصرف احتياطي في الذاكرة للتطوير والاختبار فقط.
 *
 * في الإنتاج يجب أن يصل كل طلب تسجيل إلى مخزن دائم (Sanity) أو إلى بريد
 * المدرّب على الأقل؛ وإذا لم يتحقق أيٌّ منهما يفشل الطلب بصوت عالٍ بدل
 * أن يختفي بصمت. لكن هذا يجعل تشغيل التدفق محلياً أو في CI مستحيلاً بلا
 * أسرار، لذلك يُفعَّل هذا المصرف صراحةً بمتغيّر بيئة واحد.
 *
 * الذاكرة تُفقد عند إعادة تشغيل العملية — وهذا مقصود: المصرف أداة اختبار
 * لا بديل عن مخزن، ولا يجوز تفعيله في الإنتاج أبداً.
 */

const store: RegistrationPayload[] = []

export function isFallbackSinkEnabled(): boolean {
  return process.env.REGISTRATION_FALLBACK_SINK === '1'
}

export function storeInFallbackSink(payload: RegistrationPayload): boolean {
  if (!isFallbackSinkEnabled()) return false

  store.push(payload)
  console.warn(
    '[register] stored in the in-memory fallback sink — not a durable store',
    { registrationId: payload.registrationId, total: store.length },
  )

  return true
}

/** للاختبارات فقط. */
export function readFallbackSink(): readonly RegistrationPayload[] {
  return store
}
