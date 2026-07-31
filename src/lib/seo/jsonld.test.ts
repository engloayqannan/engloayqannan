import { describe, expect, it } from 'vitest'

import { placeholderCourses, placeholderSiteSettings } from '@/lib/content/placeholder'
import type { Testimonial } from '@/lib/content/types'

import { courseSchema, reviewSchemas } from './jsonld'

const settings = placeholderSiteSettings('ar')

function testimonial(overrides: Partial<Testimonial> = {}): Testimonial {
  return {
    id: 't1',
    screenshot: { url: '/x.svg', alt: 'وصف اللقطة' },
    transcript: 'دورة ممتازة غيّرت طريقة عملي.',
    traineeName: 'سارة',
    traineeTitle: null,
    courseSlug: 'react-professional',
    courseTitle: 'React',
    cohortLabel: null,
    date: '2025-05-01',
    featured: false,
    ...overrides,
  }
}

describe('مراجعات Schema.org', () => {
  it('يصدّر مراجعة للرأي الذي له نص مفرّغ', () => {
    expect(reviewSchemas([testimonial()], settings)).toHaveLength(1)
  })

  it('لا يصدّر مراجعة من نص بديل وحده', () => {
    expect(reviewSchemas([testimonial({ transcript: null })], settings)).toHaveLength(0)
    expect(reviewSchemas([testimonial({ transcript: '   ' })], settings)).toHaveLength(0)
  })
})

describe('مخطط الدورة', () => {
  const course = placeholderCourses('ar')[0]!

  it('يبني نسخة دورة لكل دفعة لها تاريخ بدء', () => {
    const schema = courseSchema(course, settings, 'ar') as Record<string, unknown>
    const instances = schema.hasCourseInstance as unknown[]

    expect(Array.isArray(instances)).toBe(true)
    expect(instances.length).toBe(course.cohorts.filter((c) => c.startDate).length)
  })

  it('لا يعرض سعراً لدفعة لا يمكن التسجيل فيها', () => {
    const closed = {
      ...course,
      cohorts: course.cohorts.map((cohort) => ({ ...cohort, seatsRemaining: 0 })),
    }

    const schema = courseSchema(closed, settings, 'ar') as Record<string, unknown>
    const instances = (schema.hasCourseInstance ?? []) as Record<string, unknown>[]

    expect(instances.every((instance) => instance.offers === undefined)).toBe(true)
  })
})
