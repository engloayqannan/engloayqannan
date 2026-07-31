import { classifyHttpStatus, withRetry } from './retry'
import { maskPhone, type ChannelResult, type RegistrationPayload } from './types'

const GRAPH_VERSION = 'v21.0'

interface WhatsAppConfig {
  phoneNumberId: string
  accessToken: string
  templateAr: string
  templateEn: string
}

export function readWhatsAppConfig(): WhatsAppConfig | null {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const templateAr = process.env.WHATSAPP_TEMPLATE_AR
  const templateEn = process.env.WHATSAPP_TEMPLATE_EN

  if (!phoneNumberId || !accessToken || !templateAr || !templateEn) return null

  return { phoneNumberId, accessToken, templateAr, templateEn }
}

export function isWhatsAppEnabled(): boolean {
  return readWhatsAppConfig() !== null
}

/**
 * خارج نافذة الـ ٢٤ ساعة لا تسمح Meta إلا بقوالب معتمدة، لذلك رسالة
 * التأكيد قالب بمتغيرات لا نص حر (SPEC §7.4).
 */
function buildTemplateBody(payload: RegistrationPayload, config: WhatsAppConfig) {
  const templateName = payload.locale === 'en' ? config.templateEn : config.templateAr
  const languageCode = payload.locale === 'en' ? 'en' : 'ar'

  const parameters = [
    payload.fullName,
    payload.courseTitle,
    payload.cohortStartDate ?? payload.cohortLabel,
    payload.preferredMode,
  ].map((value) => ({ type: 'text', text: value }))

  return {
    messaging_product: 'whatsapp',
    to: payload.phone.replace(/^\+/, ''),
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components: [{ type: 'body', parameters }],
    },
  }
}

export async function sendWhatsAppConfirmation(
  payload: RegistrationPayload,
): Promise<ChannelResult> {
  const config = readWhatsAppConfig()

  // تدهور لطيف: بلا إعدادات Meta يعمل الموقع بمسار wa.me البديل (SPEC §7.4)
  if (!config) {
    console.warn('[whatsapp] not configured — falling back to wa.me link')
    return { channel: 'whatsapp', ok: false, skipped: true }
  }

  try {
    await withRetry(async () => {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_VERSION}/${config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buildTemplateBody(payload, config)),
        },
      )

      if (!response.ok) {
        throw classifyHttpStatus(response.status, await response.text())
      }

      return response
    })

    return { channel: 'whatsapp', ok: true, skipped: false }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    console.error('[whatsapp] send failed', { to: maskPhone(payload.phone), message })
    return { channel: 'whatsapp', ok: false, skipped: false, error: message }
  }
}

/** رابط wa.me برسالة معبّأة — المسار البديل الذي يراه المتدرّب. */
export function buildWhatsAppLink(
  whatsappNumber: string,
  message: string,
): string | null {
  const digits = whatsappNumber.replace(/[^\d]/g, '')
  if (digits.length < 8) return null

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
