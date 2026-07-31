import { afterEach, describe, expect, it, vi } from 'vitest'

import { isTurnstileEnabled, verifyTurnstile } from './turnstile'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('Turnstile', () => {
  it('يمرّ بلا أثر حين لا يُضبط السرّ', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')

    expect(isTurnstileEnabled()).toBe(false)
    await expect(verifyTurnstile(undefined)).resolves.toEqual({ ok: true, skipped: true })
  })

  it('يرفض الطلب بلا رمز حين يكون مفعّلاً', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret')

    const result = await verifyTurnstile(undefined)

    expect(result.ok).toBe(false)
    expect(result.error).toBe('missing_token')
  })

  it('يقبل الرمز الصالح', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) }),
    )

    await expect(verifyTurnstile('token')).resolves.toEqual({
      ok: true,
      skipped: false,
      error: undefined,
    })
  })

  it('يرفض الرمز غير الصالح ويحمل سبب الرفض', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] }),
      }),
    )

    const result = await verifyTurnstile('bad')

    expect(result.ok).toBe(false)
    expect(result.error).toBe('invalid-input-response')
  })

  it('لا يُسقط تسجيلاً حقيقياً حين تتعطّل خدمة التحقق', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret')
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    const result = await verifyTurnstile('token')

    expect(result.ok).toBe(true)
    expect(result.skipped).toBe(true)
  })
})
