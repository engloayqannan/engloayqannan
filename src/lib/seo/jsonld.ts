import type {
  Certificate,
  CourseWithCohorts,
  Post,
  SiteSettings,
  Testimonial,
} from '@/lib/content/types'
import type { Locale } from '@/lib/i18n/config'
import { resolveCohortAvailability } from '@/lib/courses/cohort-status'

import { absoluteUrl, siteUrl } from './metadata'

type JsonLd = Record<string, unknown>

export function personSchema(settings: SiteSettings, locale: Locale): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: settings.fullName,
    jobTitle: settings.headline,
    description: settings.shortBio,
    email: settings.email ? `mailto:${settings.email}` : undefined,
    url: absoluteUrl(`/${locale}`),
    image: settings.avatar?.url ? absoluteUrl(settings.avatar.url) : undefined,
    knowsAbout: ['Front-End Development', 'React', 'TypeScript', 'Web Performance', 'Accessibility'],
    sameAs: settings.socials.map((social) => social.url),
  }
}

export function websiteSchema(settings: SiteSettings, locale: Locale, siteName: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: absoluteUrl(`/${locale}`),
    inLanguage: locale,
    author: { '@type': 'Person', name: settings.fullName },
  }
}

export function breadcrumbSchema(items: { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

const schemaCourseMode: Record<string, string> = {
  online: 'Online',
  onsite: 'Onsite',
  hybrid: 'Blended',
}

export function courseSchema(
  course: CourseWithCohorts,
  settings: SiteSettings,
  locale: Locale,
): JsonLd {
  const instances = course.cohorts
    .filter((cohort) => cohort.startDate !== null)
    .map((cohort) => {
      const availability = resolveCohortAvailability(cohort)

      return {
        '@type': 'CourseInstance',
        courseMode: schemaCourseMode[cohort.mode] ?? 'Online',
        startDate: cohort.startDate,
        endDate: cohort.endDate ?? undefined,
        courseWorkload: `PT${course.durationHours}H`,
        location: cohort.city
          ? { '@type': 'Place', name: cohort.city }
          : { '@type': 'VirtualLocation', url: absoluteUrl(`/${locale}/courses/${course.slug}`) },
        offers:
          course.priceIndividual && availability.canRegister
            ? {
                '@type': 'Offer',
                price: course.priceIndividual.amount,
                priceCurrency: course.priceIndividual.currency,
                availability: 'https://schema.org/InStock',
                url: absoluteUrl(`/${locale}/courses/${course.slug}/register`),
              }
            : undefined,
      }
    })

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.summary,
    inLanguage: locale,
    url: absoluteUrl(`/${locale}/courses/${course.slug}`),
    provider: { '@type': 'Person', name: settings.fullName, url: siteUrl },
    educationalLevel: course.level,
    teaches: course.outcomes,
    coursePrerequisites: course.prerequisites,
    timeRequired: `PT${course.durationHours}H`,
    hasCourseInstance: instances.length > 0 ? instances : undefined,
  }
}

export function faqSchema(faqs: { question: string; answer: string }[]): JsonLd | null {
  if (faqs.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

export function articleSchema(post: Post, settings: SiteSettings, locale: Locale): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: post.title,
    description: post.excerpt,
    inLanguage: locale,
    datePublished: post.publishedAt,
    url: absoluteUrl(`/${locale}/blog/${post.slug}`),
    author: { '@type': 'Person', name: settings.fullName },
    keywords: post.tags.join(', '),
  }
}

export function credentialSchema(certificate: Certificate, locale: Locale): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalCredential',
    name: certificate.title,
    credentialCategory: certificate.category,
    dateCreated: certificate.issueDate,
    expires: certificate.expiryDate ?? undefined,
    identifier: certificate.credentialId ?? undefined,
    url: certificate.verificationUrl ?? absoluteUrl(`/${locale}/certificates`),
    recognizedBy: { '@type': 'Organization', name: certificate.issuer },
  }
}

/**
 * لا تُصدَّر مراجعات إلا من آراء لها نص مفرّغ حقيقي — توليد بيانات
 * منظمة من نص بديل وحده مخالف لسياسات البيانات المنظمة (SPEC §9.3).
 */
export function reviewSchemas(
  testimonials: Testimonial[],
  settings: SiteSettings,
): JsonLd[] {
  return testimonials
    .filter((testimonial) => Boolean(testimonial.transcript?.trim()))
    .map((testimonial) => ({
      '@context': 'https://schema.org',
      '@type': 'Review',
      reviewBody: testimonial.transcript,
      datePublished: testimonial.date ?? undefined,
      author: { '@type': 'Person', name: testimonial.traineeName },
      itemReviewed: {
        '@type': 'Course',
        name: testimonial.courseTitle ?? settings.fullName,
        provider: { '@type': 'Person', name: settings.fullName },
      },
    }))
}

export type { JsonLd }
