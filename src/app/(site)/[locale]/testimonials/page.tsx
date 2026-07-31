import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/seo/JsonLd'
import { TestimonialCard } from '@/components/testimonials/TestimonialCard'
import { EmptyState } from '@/components/ui/primitives'
import { getSiteSettings, getTestimonials } from '@/lib/content'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { reviewSchemas } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { cn } from '@/lib/utils/format'

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: raw } = await params
  if (!isLocale(raw)) return {}

  const locale = raw as Locale
  const dictionary = getDictionary(locale)

  return buildMetadata({
    locale,
    path: 'testimonials',
    title: dictionary.testimonials.title,
    description: dictionary.testimonials.subtitle,
    siteName: dictionary.meta.siteName,
  })
}

export default async function TestimonialsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()

  const locale = raw as Locale
  const dictionary = getDictionary(locale)
  const query = await searchParams

  const [testimonials, settings] = await Promise.all([
    getTestimonials(locale),
    getSiteSettings(locale),
  ])

  const activeCourse = Array.isArray(query.course) ? query.course[0] : query.course
  const courses = Array.from(
    new Map(
      testimonials
        .filter((item) => item.courseSlug && item.courseTitle)
        .map((item) => [item.courseSlug as string, item.courseTitle as string]),
    ).entries(),
  )

  const filtered = activeCourse
    ? testimonials.filter((item) => item.courseSlug === activeCourse)
    : testimonials

  const base = `/${locale}/testimonials`

  return (
    <div className="container-page py-16">
      <header className="max-w-2xl">
        <h1 className="text-3xl">{dictionary.testimonials.title}</h1>
        <p className="mt-3 text-muted">{dictionary.testimonials.subtitle}</p>
      </header>

      {courses.length > 0 && (
        <nav aria-label={dictionary.testimonials.filterByCourse} className="mt-8">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link
                href={base}
                aria-current={!activeCourse ? 'true' : undefined}
                className={cn(
                  'rounded-full border px-3 py-1 text-2xs transition-colors',
                  !activeCourse
                    ? 'border-transparent bg-accent-soft text-accent'
                    : 'border-border text-muted hover:text-fg',
                )}
              >
                {dictionary.testimonials.allCourses}
              </Link>
            </li>
            {courses.map(([slug, title]) => (
              <li key={slug}>
                <Link
                  href={`${base}?course=${encodeURIComponent(slug)}`}
                  aria-current={activeCourse === slug ? 'true' : undefined}
                  className={cn(
                    'rounded-full border px-3 py-1 text-2xs transition-colors',
                    activeCourse === slug
                      ? 'border-transparent bg-accent-soft text-accent'
                      : 'border-border text-muted hover:text-fg',
                  )}
                >
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="mt-10">
        {filtered.length === 0 ? (
          <EmptyState title={dictionary.testimonials.empty} />
        ) : (
          <div className="columns-1 gap-6 md:columns-2 lg:columns-3 [&>*]:mb-6">
            {filtered.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                locale={locale}
                dictionary={dictionary}
              />
            ))}
          </div>
        )}
      </div>

      {/* مراجعات منظمة من النصوص المفرّغة فقط (SPEC §9.3) */}
      <JsonLd data={reviewSchemas(filtered, settings)} />
    </div>
  )
}
