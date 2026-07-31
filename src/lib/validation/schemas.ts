import { z } from 'zod'

import type { Dictionary } from '@/lib/i18n/dictionary'
import { locales } from '@/lib/i18n/config'

type ValidationMessages = Dictionary['validation']

/** E.164: علامة + ثم ٨ إلى ١٥ رقماً، بلا مسافات أو رموز. */
export const E164 = /^\+[1-9]\d{7,14}$/

export const deliveryModes = ['online', 'onsite', 'hybrid'] as const
export const experienceLevels = ['beginner', 'intermediate', 'advanced'] as const
export const registrationTypes = ['individual', 'company'] as const
export const inquiryTypes = ['individual', 'corporate', 'academic', 'other'] as const

/**
 * نفس المخطط يعمل على العميل والخادم — التحقق على العميل للتجربة،
 * وعلى الخادم للأمان (SPEC §7.1، §11).
 */
export function createRegistrationSchema(messages: ValidationMessages) {
  return z
    .object({
      fullName: z
        .string()
        .trim()
        .min(1, messages.nameRequired)
        .min(2, messages.nameTooShort)
        .max(80, messages.nameTooLong),
      email: z
        .string()
        .trim()
        .min(1, messages.emailRequired)
        .email(messages.emailInvalid)
        .toLowerCase(),
      phone: z
        .string()
        .trim()
        .min(1, messages.phoneRequired)
        .regex(E164, messages.phoneInvalid),
      courseSlug: z.string().trim().min(1),
      cohortId: z.string().trim().min(1, messages.cohortRequired),
      preferredMode: z.enum(deliveryModes, { message: messages.modeRequired }),
      city: z.string().trim().max(80).optional().or(z.literal('')),
      experienceLevel: z.enum(experienceLevels, { message: messages.levelRequired }),
      registrationType: z.enum(registrationTypes),
      companyName: z.string().trim().max(120).optional().or(z.literal('')),
      notes: z.string().trim().max(1000, messages.notesTooLong).optional().or(z.literal('')),
      consent: z.literal(true, { message: messages.consentRequired }),
      locale: z.enum(locales),
      /** حقل شرك للسبام — يجب أن يبقى فارغاً (SPEC §7.5) */
      website: z.string().max(0).optional().or(z.literal('')),
      /** طابع زمني لتحميل النموذج، يكشف الإرسال الآلي السريع */
      loadedAt: z.number().int().positive().optional(),
    })
    .superRefine((value, ctx) => {
      if (value.preferredMode !== 'online' && !value.city?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['city'],
          message: messages.cityRequired,
        })
      }

      if (value.registrationType === 'company' && !value.companyName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['companyName'],
          message: messages.companyRequired,
        })
      }
    })
}

export type RegistrationInput = z.infer<ReturnType<typeof createRegistrationSchema>>

export function createContactSchema(messages: ValidationMessages) {
  return z.object({
    fullName: z
      .string()
      .trim()
      .min(1, messages.nameRequired)
      .min(2, messages.nameTooShort)
      .max(80, messages.nameTooLong),
    email: z
      .string()
      .trim()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid)
      .toLowerCase(),
    inquiryType: z.enum(inquiryTypes, { message: messages.inquiryTypeRequired }),
    message: z
      .string()
      .trim()
      .min(1, messages.messageRequired)
      .min(10, messages.messageTooShort)
      .max(2000),
    locale: z.enum(locales),
    website: z.string().max(0).optional().or(z.literal('')),
    loadedAt: z.number().int().positive().optional(),
  })
}

export type ContactInput = z.infer<ReturnType<typeof createContactSchema>>
