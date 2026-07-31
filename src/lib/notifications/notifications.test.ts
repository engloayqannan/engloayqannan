import { afterEach, describe, expect, it, vi } from 'vitest'

import { RetryableError, classifyHttpStatus, withRetry } from './retry'
import { maskEmail, maskPhone } from './types'
import { buildWhatsAppLink } from './whatsapp'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('تقنيع البيانات الشخصية', () => {
  it('يقنّع رقم الهاتف ويبقي طرفيه للتعرّف', () => {
    expect(maskPhone('+962791234567')).toBe('+9627****4567')
  })

  it('يقنّع الأرقام القصيرة بالكامل', () => {
    expect(maskPhone('+96279')).toBe('******')
  })

  it('يقنّع البريد ويبقي النطاق', () => {
    expect(maskEmail('sara@example.com')).toBe('sa**@example.com')
  })
})

describe('إعادة المحاولة', () => {
  it('لا يعيد المحاولة على خطأ غير قابل لإعادة المحاولة', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('bad request'))

    await expect(withRetry(operation, { delays: [0, 0, 0] })).rejects.toThrow('bad request')
    expect(operation).toHaveBeenCalledTimes(1)
  })

  it('يعيد المحاولة على الأخطاء القابلة ثم ينجح', async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new RetryableError('503'))
      .mockResolvedValue('ok')

    await expect(withRetry(operation, { delays: [0, 0, 0] })).resolves.toBe('ok')
    expect(operation).toHaveBeenCalledTimes(2)
  })

  it('يتوقف بعد استنفاد المحاولات', async () => {
    const operation = vi.fn().mockRejectedValue(new RetryableError('503'))

    await expect(withRetry(operation, { attempts: 3, delays: [0, 0, 0] })).rejects.toThrow('503')
    expect(operation).toHaveBeenCalledTimes(3)
  })
})

describe('تصنيف رموز HTTP', () => {
  it('يعتبر 5xx و429 قابلة لإعادة المحاولة', () => {
    expect(classifyHttpStatus(500, '')).toBeInstanceOf(RetryableError)
    expect(classifyHttpStatus(429, '')).toBeInstanceOf(RetryableError)
  })

  it('لا يعيد محاولة أخطاء الطلب', () => {
    expect(classifyHttpStatus(400, '')).not.toBeInstanceOf(RetryableError)
    expect(classifyHttpStatus(401, '')).not.toBeInstanceOf(RetryableError)
  })
})

describe('رابط wa.me البديل', () => {
  it('يبني رابطاً برسالة مرمّزة', () => {
    const link = buildWhatsAppLink('+962 79 123 4567', 'مرحباً')

    expect(link).toContain('https://wa.me/962791234567')
    expect(link).toContain(encodeURIComponent('مرحباً'))
  })

  it('يعيد null لرقم غير صالح بدل رابط مكسور', () => {
    expect(buildWhatsAppLink('123', 'hi')).toBeNull()
  })
})

describe('إشعار الواتساب حين لا تُضبط إعدادات Meta', () => {
  it('يتخطى الإرسال بدل رمي خطأ يُسقط التسجيل', async () => {
    vi.stubEnv('WHATSAPP_PHONE_NUMBER_ID', '')
    vi.stubEnv('WHATSAPP_ACCESS_TOKEN', '')
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { sendWhatsAppConfirmation } = await import('./whatsapp')

    const result = await sendWhatsAppConfirmation({
      registrationId: 'abc',
      fullName: 'Sara',
      email: 'sara@example.com',
      phone: '+962791234567',
      courseTitle: 'React',
      courseSlug: 'react',
      cohortLabel: 'Cohort 1',
      cohortStartDate: null,
      preferredMode: 'online',
      city: null,
      experienceLevel: 'beginner',
      registrationType: 'individual',
      companyName: null,
      notes: null,
      locale: 'ar',
    })

    expect(result.skipped).toBe(true)
    expect(result.ok).toBe(false)

    vi.unstubAllEnvs()
  })
})
