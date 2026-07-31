import { describe, expect, it } from 'vitest'

import type { Cohort } from '@/lib/content/types'

import { courseStatus, nextCohort, registrableCohorts, resolveCohortAvailability } from './cohort-status'

const NOW = new Date('2026-06-01T12:00:00Z')

function cohort(overrides: Partial<Cohort> = {}): Cohort {
  return {
    id: 'cohort-1',
    courseSlug: 'course',
    startDate: '2026-07-01T16:00:00Z',
    endDate: '2026-08-01T16:00:00Z',
    timezone: 'Asia/Amman',
    schedule: 'Sun & Tue',
    mode: 'online',
    city: null,
    capacity: 20,
    seatsRemaining: 10,
    registrationDeadline: '2026-06-25T16:00:00Z',
    declaredStatus: null,
    price: null,
    ...overrides,
  }
}

describe('resolveCohortAvailability', () => {
  it('يفتح التسجيل حين تتوفر مقاعد والموعد النهائي لم يمرّ', () => {
    const result = resolveCohortAvailability(cohort(), NOW)

    expect(result.status).toBe('open')
    expect(result.canRegister).toBe(true)
  })

  it('يعرض «مقاعد محدودة» عند الوصول للعتبة دون منع التسجيل', () => {
    const result = resolveCohortAvailability(cohort({ seatsRemaining: 3 }), NOW)

    expect(result.status).toBe('few_left')
    expect(result.canRegister).toBe(true)
  })

  it('يمنع التسجيل حين تكون المقاعد صفراً حتى لو أعلن المحرر أنها مفتوحة', () => {
    const result = resolveCohortAvailability(
      cohort({ seatsRemaining: 0, declaredStatus: 'open' }),
      NOW,
    )

    expect(result.status).toBe('full')
    expect(result.canRegister).toBe(false)
  })

  it('يحترم إغلاق المحرر المبكر رغم توفر المقاعد', () => {
    const result = resolveCohortAvailability(
      cohort({ seatsRemaining: 15, declaredStatus: 'closed' }),
      NOW,
    )

    expect(result.status).toBe('closed')
    expect(result.canRegister).toBe(false)
  })

  it('يغلق التسجيل بعد مرور الموعد النهائي', () => {
    const result = resolveCohortAvailability(
      cohort({ registrationDeadline: '2026-05-01T16:00:00Z' }),
      NOW,
    )

    expect(result.status).toBe('closed')
    expect(result.canRegister).toBe(false)
  })

  it('يعتمد تاريخ البدء موعداً نهائياً حين لا يُحدَّد موعد صريح', () => {
    const result = resolveCohortAvailability(
      cohort({ registrationDeadline: null, startDate: '2026-05-20T16:00:00Z' }),
      NOW,
    )

    expect(result.status).toBe('closed')
  })

  it('يعتبر الدفعة بلا تاريخ بدء «قريباً» لا مفتوحة', () => {
    const result = resolveCohortAvailability(
      cohort({ startDate: null, registrationDeadline: null }),
      NOW,
    )

    expect(result.status).toBe('soon')
    expect(result.canRegister).toBe(false)
  })

  it('لا يعيد عدد مقاعد سالباً', () => {
    const result = resolveCohortAvailability(cohort({ seatsRemaining: -4 }), NOW)

    expect(result.seatsRemaining).toBe(0)
    expect(result.status).toBe('full')
  })
})

describe('registrableCohorts', () => {
  it('يستبعد الممتلئة والمغلقة ويبقي المتاحة فقط', () => {
    const cohorts = [
      cohort({ id: 'open' }),
      cohort({ id: 'full', seatsRemaining: 0 }),
      cohort({ id: 'closed', registrationDeadline: '2026-01-01T00:00:00Z' }),
      cohort({ id: 'few', seatsRemaining: 2 }),
    ]

    expect(registrableCohorts(cohorts, NOW).map((item) => item.id)).toEqual(['open', 'few'])
  })
})

describe('nextCohort', () => {
  it('يعيد أقرب دفعة قادمة ويتجاهل الماضية وبلا تاريخ', () => {
    const cohorts = [
      cohort({ id: 'later', startDate: '2026-09-01T16:00:00Z' }),
      cohort({ id: 'past', startDate: '2026-02-01T16:00:00Z' }),
      cohort({ id: 'undated', startDate: null }),
      cohort({ id: 'soonest', startDate: '2026-06-15T16:00:00Z' }),
    ]

    expect(nextCohort(cohorts, NOW)?.id).toBe('soonest')
  })

  it('يعيد null حين لا توجد دفعات قادمة', () => {
    expect(nextCohort([cohort({ startDate: '2020-01-01T00:00:00Z' })], NOW)).toBeNull()
  })
})

describe('courseStatus', () => {
  it('يعطي الأولوية لأفضل حالة متاحة بين الدفعات', () => {
    const cohorts = [cohort({ seatsRemaining: 0 }), cohort({ id: 'b', seatsRemaining: 12 })]

    expect(courseStatus(cohorts, NOW)).toBe('open')
  })

  it('يعتبر الدورة بلا دفعات «قريباً»', () => {
    expect(courseStatus([], NOW)).toBe('soon')
  })
})
