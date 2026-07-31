import { beforeEach, describe, expect, it } from 'vitest'

import {
  MIN_FORM_FILL_MS,
  hit,
  isHoneypotTripped,
  isSuspiciouslyFast,
  resetRateLimits,
} from './rate-limit'

beforeEach(() => {
  resetRateLimits()
})

describe('تحديد معدّل الطلبات', () => {
  it('يسمح حتى الحد ثم يمنع', () => {
    const now = Date.now()

    for (let index = 0; index < 5; index += 1) {
      expect(hit('key', { max: 5, windowMs: 1000 }, now).allowed).toBe(true)
    }

    const blocked = hit('key', { max: 5, windowMs: 1000 }, now)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('يعيد الفتح بعد انتهاء النافذة', () => {
    const now = Date.now()

    hit('key', { max: 1, windowMs: 1000 }, now)
    expect(hit('key', { max: 1, windowMs: 1000 }, now).allowed).toBe(false)
    expect(hit('key', { max: 1, windowMs: 1000 }, now + 1001).allowed).toBe(true)
  })

  it('يعزل المفاتيح عن بعضها', () => {
    const now = Date.now()

    hit('a', { max: 1, windowMs: 1000 }, now)
    expect(hit('b', { max: 1, windowMs: 1000 }, now).allowed).toBe(true)
  })
})

describe('حقل الشرك', () => {
  it('يكشف الحقل المملوء', () => {
    expect(isHoneypotTripped('spam')).toBe(true)
  })

  it('يمرّر الحقل الفارغ أو الغائب', () => {
    expect(isHoneypotTripped('')).toBe(false)
    expect(isHoneypotTripped(undefined)).toBe(false)
  })
})

describe('إشارة الإرسال السريع', () => {
  const now = Date.now()

  it('يعلّم الإرسال الأسرع من الحد الأدنى', () => {
    expect(isSuspiciouslyFast(now - 500, now)).toBe(true)
  })

  it('لا يعلّم التعبئة البشرية الطبيعية', () => {
    expect(isSuspiciouslyFast(now - MIN_FORM_FILL_MS - 1000, now)).toBe(false)
  })

  it('لا يعلّم الطلب بلا طابع زمني', () => {
    expect(isSuspiciouslyFast(undefined, now)).toBe(false)
  })
})
