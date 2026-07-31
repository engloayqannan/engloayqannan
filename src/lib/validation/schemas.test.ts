import { describe, expect, it } from 'vitest'

import ar from '../../../messages/ar.json'

import { createContactSchema, createRegistrationSchema } from './schemas'

const messages = ar.validation
const schema = createRegistrationSchema(messages)

const valid = {
  fullName: 'سارة محمد',
  email: 'Sara@Example.com',
  phone: '+962791234567',
  courseSlug: 'react-professional',
  cohortId: 'cohort-1',
  preferredMode: 'online' as const,
  experienceLevel: 'intermediate' as const,
  registrationType: 'individual' as const,
  consent: true as const,
  locale: 'ar' as const,
}

describe('مخطط التسجيل', () => {
  it('يقبل طلباً صحيحاً ويحوّل البريد لحروف صغيرة', () => {
    const result = schema.safeParse(valid)

    expect(result.success).toBe(true)
    if (result.success) expect(result.data.email).toBe('sara@example.com')
  })

  it('يرفض رقماً بصيغة غير دولية', () => {
    const result = schema.safeParse({ ...valid, phone: '0791234567' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'phone')).toBe(true)
    }
  })

  it('يرفض التسجيل بلا موافقة صريحة', () => {
    const result = schema.safeParse({ ...valid, consent: false })
    expect(result.success).toBe(false)
  })

  it('يشترط المدينة للتدريب الوجاهي', () => {
    const result = schema.safeParse({ ...valid, preferredMode: 'onsite' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'city')).toBe(true)
    }
  })

  it('يقبل التدريب الوجاهي حين تُذكر المدينة', () => {
    expect(schema.safeParse({ ...valid, preferredMode: 'onsite', city: 'عمّان' }).success).toBe(
      true,
    )
  })

  it('يشترط اسم الجهة عند التسجيل نيابة عن شركة', () => {
    const result = schema.safeParse({ ...valid, registrationType: 'company' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'companyName')).toBe(true)
    }
  })

  it('يرفض حقل الشرك المملوء', () => {
    expect(schema.safeParse({ ...valid, website: 'http://spam.example' }).success).toBe(false)
  })

  it('يرفض بريداً غير صالح', () => {
    expect(schema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false)
  })

  it('يرفض ملاحظات تتجاوز الحد', () => {
    expect(schema.safeParse({ ...valid, notes: 'x'.repeat(1001) }).success).toBe(false)
  })
})

describe('مخطط التواصل', () => {
  const contactSchema = createContactSchema(messages)

  it('يقبل رسالة صحيحة', () => {
    const result = contactSchema.safeParse({
      fullName: 'Omar K',
      email: 'omar@example.com',
      inquiryType: 'corporate',
      message: 'نرغب ببرنامج تدريبي لفريقنا الهندسي.',
      locale: 'ar',
    })

    expect(result.success).toBe(true)
  })

  it('يرفض رسالة قصيرة جداً', () => {
    const result = contactSchema.safeParse({
      fullName: 'Omar K',
      email: 'omar@example.com',
      inquiryType: 'other',
      message: 'مرحبا',
      locale: 'ar',
    })

    expect(result.success).toBe(false)
  })
})
