import type { Locale } from '@/lib/i18n/config'
import {
  certificatesQuery,
  courseBySlugQuery,
  courseSlugsQuery,
  coursesQuery,
  postBySlugQuery,
  postSlugsQuery,
  postsQuery,
  siteSettingsQuery,
  teachingQuery,
  testimonialsQuery,
} from '@/lib/sanity/queries'
import { isSanityConfigured, sanityFetch, urlForImage } from '@/lib/sanity/client'

import {
  placeholderCertificates,
  placeholderCourses,
  placeholderPosts,
  placeholderSiteSettings,
  placeholderTeaching,
  placeholderTestimonials,
} from './placeholder'
import type {
  Certificate,
  CourseWithCohorts,
  ImageRef,
  Post,
  SiteSettings,
  TeachingEngagement,
  Testimonial,
} from './types'

/**
 * الواجهة الوحيدة التي تقرأ منها الصفحات. المصدر (Sanity أو المحتوى
 * التجريبي) تفصيل داخلي هنا — لا مكوّن يعرف من أين جاءت البيانات
 * (SPEC §3.2، §12).
 */

interface RawImage {
  asset?: unknown
  alt?: string | null
}

function normaliseImage(raw: RawImage | null | undefined): ImageRef | null {
  if (!raw?.asset) return null

  const url = urlForImage(raw.asset)
  if (!url) return null

  return { url, alt: raw.alt ?? '' }
}

/** صورة إلزامية بنص بديل — تُسقَط الوثيقة إن نقص أحدهما (SPEC §5.7). */
function normaliseRequiredImage(raw: RawImage | null | undefined): ImageRef | null {
  const image = normaliseImage(raw)
  if (!image || image.alt.trim().length === 0) return null
  return image
}

function withLocale(locale: Locale) {
  return { locale }
}

export async function getSiteSettings(locale: Locale): Promise<SiteSettings> {
  if (!isSanityConfigured) return placeholderSiteSettings(locale)

  const raw = await sanityFetch<
    (Omit<SiteSettings, 'avatar'> & { avatar?: RawImage }) | null
  >(siteSettingsQuery, withLocale(locale), ['siteSettings'])

  if (!raw) return placeholderSiteSettings(locale)

  return {
    ...raw,
    avatar: normaliseImage(raw.avatar),
    socials: raw.socials ?? [],
    stats: raw.stats ?? [],
    approach: raw.approach ?? [],
    timeline: raw.timeline ?? [],
  }
}

export async function getCourses(locale: Locale): Promise<CourseWithCohorts[]> {
  if (!isSanityConfigured) return placeholderCourses(locale)

  const raw = await sanityFetch<
    (Omit<CourseWithCohorts, 'coverImage'> & { coverImage?: RawImage })[] | null
  >(coursesQuery, withLocale(locale), ['course', 'cohort'])

  if (!raw || raw.length === 0) return placeholderCourses(locale)

  return raw.map((course) => ({
    ...course,
    coverImage: normaliseImage(course.coverImage),
    cohorts: course.cohorts ?? [],
    prerequisites: course.prerequisites ?? [],
    outcomes: course.outcomes ?? [],
    syllabus: course.syllabus ?? [],
    modes: course.modes ?? [],
    locations: course.locations ?? [],
    technologies: course.technologies ?? [],
    faqs: course.faqs ?? [],
  }))
}

export async function getCourse(
  slug: string,
  locale: Locale,
): Promise<CourseWithCohorts | null> {
  if (isSanityConfigured) {
    const raw = await sanityFetch<
      (Omit<CourseWithCohorts, 'coverImage'> & { coverImage?: RawImage }) | null
    >(courseBySlugQuery, { slug, ...withLocale(locale) }, ['course', 'cohort'])

    if (raw) {
      return {
        ...raw,
        coverImage: normaliseImage(raw.coverImage),
        cohorts: raw.cohorts ?? [],
        prerequisites: raw.prerequisites ?? [],
        outcomes: raw.outcomes ?? [],
        syllabus: raw.syllabus ?? [],
        modes: raw.modes ?? [],
        locations: raw.locations ?? [],
        technologies: raw.technologies ?? [],
        faqs: raw.faqs ?? [],
      }
    }
  }

  return placeholderCourses(locale).find((course) => course.slug === slug) ?? null
}

export async function getCourseSlugs(): Promise<string[]> {
  if (isSanityConfigured) {
    const slugs = await sanityFetch<string[]>(courseSlugsQuery, {}, ['course'])
    if (slugs && slugs.length > 0) return slugs
  }

  return placeholderCourses('ar').map((course) => course.slug)
}

export async function getCertificates(locale: Locale): Promise<Certificate[]> {
  if (!isSanityConfigured) return placeholderCertificates(locale)

  const raw = await sanityFetch<
    (Omit<Certificate, 'image'> & { image?: RawImage })[] | null
  >(certificatesQuery, withLocale(locale), ['certificate'])

  if (!raw) return placeholderCertificates(locale)

  return raw.flatMap((certificate) => {
    const image = normaliseRequiredImage(certificate.image)
    return image ? [{ ...certificate, image }] : []
  })
}

export async function getTestimonials(locale: Locale): Promise<Testimonial[]> {
  if (!isSanityConfigured) return placeholderTestimonials(locale)

  const raw = await sanityFetch<
    (Omit<Testimonial, 'screenshot'> & { screenshot?: RawImage })[] | null
  >(testimonialsQuery, withLocale(locale), ['testimonial'])

  if (!raw) return placeholderTestimonials(locale)

  // رأي بلا نص بديل لا يُعرض — الصورة وحدها غير مقروءة (SPEC §5.7)
  return raw.flatMap((testimonial) => {
    const screenshot = normaliseRequiredImage(testimonial.screenshot)
    return screenshot ? [{ ...testimonial, screenshot }] : []
  })
}

export async function getTeachingEngagements(
  locale: Locale,
): Promise<TeachingEngagement[]> {
  if (!isSanityConfigured) return placeholderTeaching(locale)

  const raw = await sanityFetch<
    (Omit<TeachingEngagement, 'logo'> & { logo?: RawImage })[] | null
  >(teachingQuery, withLocale(locale), ['teachingEngagement'])

  if (!raw) return placeholderTeaching(locale)

  return raw.map((engagement) => ({
    ...engagement,
    logo: normaliseImage(engagement.logo),
    coursesTaught: engagement.coursesTaught ?? [],
  }))
}

export async function getPosts(locale: Locale): Promise<Post[]> {
  if (!isSanityConfigured) return placeholderPosts(locale)

  const raw = await sanityFetch<(Omit<Post, 'coverImage'> & { coverImage?: RawImage })[] | null>(
    postsQuery,
    withLocale(locale),
    ['post'],
  )

  if (!raw) return placeholderPosts(locale)

  return raw.map((post) => ({
    ...post,
    coverImage: normaliseImage(post.coverImage),
    tags: post.tags ?? [],
  }))
}

export async function getPost(slug: string, locale: Locale): Promise<Post | null> {
  if (isSanityConfigured) {
    const raw = await sanityFetch<
      (Omit<Post, 'coverImage'> & { coverImage?: RawImage }) | null
    >(postBySlugQuery, { slug, ...withLocale(locale) }, ['post'])

    if (raw) {
      return { ...raw, coverImage: normaliseImage(raw.coverImage), tags: raw.tags ?? [] }
    }
  }

  return placeholderPosts(locale).find((post) => post.slug === slug) ?? null
}

export async function getPostSlugs(): Promise<string[]> {
  if (isSanityConfigured) {
    const slugs = await sanityFetch<string[]>(postSlugsQuery, {}, ['post'])
    if (slugs && slugs.length > 0) return slugs
  }

  return placeholderPosts('ar').map((post) => post.slug)
}
