import type { Locale } from '@/lib/i18n/config'

export interface RegistrationPayload {
  registrationId: string
  fullName: string
  email: string
  phone: string
  courseTitle: string
  courseSlug: string
  cohortLabel: string
  cohortStartDate: string | null
  preferredMode: string
  city: string | null
  experienceLevel: string
  registrationType: string
  companyName: string | null
  notes: string | null
  locale: Locale
}

export interface ContactPayload {
  fullName: string
  email: string
  inquiryType: string
  message: string
  locale: Locale
}

export interface ChannelResult {
  channel: 'email' | 'whatsapp'
  ok: boolean
  skipped: boolean
  error?: string
}

export interface NotifyResult {
  results: ChannelResult[]
}

export interface Notifier {
  notifyRegistration(payload: RegistrationPayload): Promise<ChannelResult>
  notifyContact?(payload: ContactPayload): Promise<ChannelResult>
}

/** يقنّع البيانات الشخصية قبل التسجيل في اللوغات (SPEC §11). */
export function maskPhone(phone: string): string {
  if (phone.length <= 6) return '*'.repeat(phone.length)
  return `${phone.slice(0, 5)}****${phone.slice(-4)}`
}

export function maskEmail(email: string): string {
  const [user = '', domain = ''] = email.split('@')
  const visible = user.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(1, user.length - 2))}@${domain}`
}
