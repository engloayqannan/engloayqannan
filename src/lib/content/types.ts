export type Level = 'beginner' | 'intermediate' | 'advanced'
export type DeliveryMode = 'online' | 'onsite' | 'hybrid'
export type CohortStatus = 'open' | 'few_left' | 'full' | 'soon' | 'closed'
export type CertificateCategory = 'technical' | 'training' | 'academic'
export type InquiryType = 'individual' | 'corporate' | 'academic' | 'other'
export type TeachingLanguage = 'ar' | 'en' | 'both'

export interface RichTextSpan {
  _type: 'span'
  _key: string
  text: string
  marks?: string[]
}

export interface RichTextBlock {
  _type: 'block'
  _key: string
  style?: 'normal' | 'h2' | 'h3' | 'blockquote'
  children: RichTextSpan[]
  markDefs?: unknown[]
}

export type RichText = RichTextBlock[]

export interface ImageRef {
  url: string
  /** إلزامي — لا صورة ذات معنى بلا نص بديل (SPEC §10.2) */
  alt: string
  width?: number
  height?: number
}

export interface Money {
  amount: number
  currency: string
}

export interface SyllabusModule {
  title: string
  topics: string[]
  hours: number
}

export interface CourseFaq {
  question: string
  answer: string
}

export interface Cohort {
  id: string
  courseSlug: string
  /** ISO 8601، أو null للدفعات المعلنة بلا تاريخ بعد */
  startDate: string | null
  endDate: string | null
  /** منطقة زمنية IANA، مثل Asia/Amman */
  timezone: string
  schedule: string
  mode: DeliveryMode
  city: string | null
  capacity: number
  seatsRemaining: number
  registrationDeadline: string | null
  /** الحالة المعلنة في لوحة التحرير — تُدمج مع الحساب الآلي */
  declaredStatus: CohortStatus | null
  price: Money | null
}

export interface CourseLocation {
  city: string
  country: string
}

export interface Course {
  id: string
  slug: string
  title: string
  summary: string
  description: RichText
  level: Level
  durationHours: number
  sessionsCount: number
  language: TeachingLanguage
  prerequisites: string[]
  outcomes: string[]
  syllabus: SyllabusModule[]
  modes: DeliveryMode[]
  locations: CourseLocation[]
  coverImage: ImageRef | null
  technologies: string[]
  priceIndividual: Money | null
  corporate: {
    available: boolean
    showPrice: boolean
    price: Money | null
  }
  faqs: CourseFaq[]
  featured: boolean
  order: number
  seo: SeoFields | null
}

export interface CourseWithCohorts extends Course {
  cohorts: Cohort[]
}

export interface Certificate {
  id: string
  title: string
  issuer: string
  issueDate: string
  expiryDate: string | null
  credentialId: string | null
  verificationUrl: string | null
  image: ImageRef
  category: CertificateCategory
  order: number
}

export interface Testimonial {
  id: string
  /** لقطة من كلام المتدرّب — نصها البديل إلزامي (SPEC §5.7) */
  screenshot: ImageRef
  /** نص مفرّغ — بدونه لا تُصدَّر بيانات Review المنظمة */
  transcript: string | null
  traineeName: string
  traineeTitle: string | null
  courseSlug: string | null
  courseTitle: string | null
  cohortLabel: string | null
  date: string | null
  featured: boolean
}

export interface TeachingEngagement {
  id: string
  institution: string
  logo: ImageRef | null
  role: string
  coursesTaught: string[]
  startDate: string
  endDate: string | null
  city: string
  country: string
  description: string
  order: number
}

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  body: RichText
  coverImage: ImageRef | null
  tags: string[]
  publishedAt: string
  readingTime: number
}

export interface SocialLink {
  platform: 'linkedin' | 'github' | 'youtube' | 'x' | 'website'
  url: string
}

export interface Stat {
  label: string
  value: number
  suffix: string | null
}

export interface SeoFields {
  title: string | null
  description: string | null
  ogImage: ImageRef | null
}

export interface SiteSettings {
  fullName: string
  headline: string
  shortBio: string
  longBio: RichText
  avatar: ImageRef | null
  cvUrl: string | null
  email: string
  whatsappNumber: string
  socials: SocialLink[]
  stats: Stat[]
  approach: { title: string; body: string }[]
  timeline: { period: string; title: string; organisation: string; body: string }[]
  seo: SeoFields | null
}
