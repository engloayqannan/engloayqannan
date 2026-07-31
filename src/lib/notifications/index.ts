import { sendRegistrationEmails } from './email'
import type { NotifyResult, RegistrationPayload } from './types'
import { sendWhatsAppConfirmation } from './whatsapp'

/**
 * القناتان تعملان بالتوازي ولا تُفشل إحداهما الأخرى — ولا تُفشل أيٌّ منهما
 * التسجيل نفسه. المتدرّب سجّل فعلاً، وإظهار خطأ له خطأ منتَج (SPEC §7.3).
 */
export async function notifyRegistration(
  payload: RegistrationPayload,
): Promise<NotifyResult> {
  const results = await Promise.all([
    sendRegistrationEmails(payload),
    sendWhatsAppConfirmation(payload),
  ])

  return { results }
}

export * from './types'
export { buildWhatsAppLink, isWhatsAppEnabled } from './whatsapp'
export { isEmailEnabled, sendContactEmail } from './email'
