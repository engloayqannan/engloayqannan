import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { CohortsPanel, CohortsPanelSkeleton } from '@/components/courses/CohortsPanel'
import { JsonLd } from '@/components/seo/JsonLd'
import { TestimonialCard } from '@/components/testimonials/TestimonialCard'
import { Button } from '@/components/ui/Button'
import { Badge, Card, DefinitionRow, Prose } from '@/components/ui/primitives'
import { RichText } from '@/components/ui/RichText'
import { getCourse, getCourseSlugs, getSiteSettings, getTestimonials } from '@/lib/content'
import { courseStatus } from '@/lib/courses/cohort-status'
import { isLocale, locales, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { breadcrumbSchema, courseSchema, faqSchema } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { formatMoney } from '@/lib/utils/format'

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getCourseSlugs()
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: raw, slug } = await params
  if (!isLocale(raw)) return {}

  const locale = raw as Locale
  const dictionary = getDictionary(locale)
  const course = await getCourse(slug, locale)

  if (!course) return {}

  return buildMetadata({
    locale,
    path: `courses/${slug}`,
    title: course.seo?.title ?? course.title,
    description: course.seo?.description ?? course.summary,
    siteName: dictionary.meta.siteName,
    ogImage: course.coverImage?.url ?? null,
  })
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: raw, slug } = await params
  if (!isLocale(raw)) notFound()

  const locale = raw as Locale
  const dictionary = getDictionary(locale)

  const [course, settings, testimonials] = await Promise.all([
    getCourse(slug, locale),
    getSiteSettings(locale),
    getTestimonials(locale),
  ])

  if (!course) notFound()

  const status = courseStatus(course.cohorts)
  const related = testimonials.filter((testimonial) => testimonial.courseSlug === slug)
  const canRegister = status === 'open' || status === 'few_left'

  return (
    <>
      <div className="border-b border-border bg-bg-elevated">
        <div className="container-page py-12">
          <Link href={`/${locale}/courses`} className="text-2xs text-muted hover:text-fg">
            ← {dictionary.common.backToCourses}
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone="accent">{dictionary.courses.level[course.level]}</Badge>
            {course.modes.map((mode) => (
              <Badge key={mode}>{dictionary.courses.mode[mode]}</Badge>
            ))}
            <Badge>{dictionary.courses.status[status]}</Badge>
          </div>

          <h1 className="mt-5 max-w-3xl text-3xl">{course.title}</h1>
          <p className="mt-4 max-w-3xl text-muted">{course.summary}</p>
        </div>
      </div>

      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-14">
          <section aria-labelledby="overview">
            <h2 id="overview" className="text-xl">
              {dictionary.course.overview}
            </h2>
            <Prose className="mt-4">
              <RichText value={course.description} />
            </Prose>
          </section>

          {course.outcomes.length > 0 && (
            <section aria-labelledby="outcomes">
              <h2 id="outcomes" className="text-xl">
                {dictionary.course.outcomes}
              </h2>
              <p className="mt-2 text-sm text-muted">{dictionary.course.outcomesIntro}</p>
              <ul className="mt-4 space-y-3">
                {course.outcomes.map((outcome) => (
                  <li key={outcome} className="flex gap-3 text-sm">
                    <span aria-hidden="true" className="mt-1 text-accent">
                      ✓
                    </span>
                    <span className="text-muted">{outcome}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {course.prerequisites.length > 0 && (
            <section aria-labelledby="prerequisites">
              <h2 id="prerequisites" className="text-xl">
                {dictionary.course.prerequisites}
              </h2>
              <ul className="mt-4 list-disc space-y-2 ps-6 text-sm text-muted">
                {course.prerequisites.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {course.syllabus.length > 0 && (
            <section aria-labelledby="syllabus">
              <h2 id="syllabus" className="text-xl">
                {dictionary.course.syllabus}
              </h2>
              <div className="mt-4 space-y-3">
                {course.syllabus.map((module, index) => (
                  <details
                    key={module.title}
                    open={index === 0}
                    className="group rounded-md border border-border bg-surface"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 text-sm font-semibold">
                      <span>{module.title}</span>
                      <span className="text-2xs font-normal text-muted">
                        <span data-numeric>{module.hours}</span> {dictionary.course.moduleHours}
                      </span>
                    </summary>
                    <ul className="list-disc space-y-2 border-t border-border px-5 py-4 ps-10 text-sm text-muted">
                      {module.topics.map((topic) => (
                        <li key={topic}>{topic}</li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="cohorts">
            <h2 id="cohorts" className="text-xl">
              {dictionary.course.cohorts}
            </h2>
            <div className="mt-4">
              <Suspense fallback={<CohortsPanelSkeleton />}>
                <CohortsPanel slug={slug} locale={locale} dictionary={dictionary} />
              </Suspense>
            </div>
          </section>

          {course.faqs.length > 0 && (
            <section aria-labelledby="faqs">
              <h2 id="faqs" className="text-xl">
                {dictionary.course.faqs}
              </h2>
              <div className="mt-4 space-y-3">
                {course.faqs.map((faq) => (
                  <details key={faq.question} className="rounded-md border border-border bg-surface">
                    <summary className="cursor-pointer px-5 py-4 text-sm font-semibold">
                      {faq.question}
                    </summary>
                    <p className="border-t border-border px-5 py-4 text-sm text-muted">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section aria-labelledby="testimonials">
              <h2 id="testimonials" className="text-xl">
                {dictionary.course.relatedTestimonials}
              </h2>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                {related.map((testimonial) => (
                  <TestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    locale={locale}
                    dictionary={dictionary}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <Card className="p-6">
            <dl>
              {course.priceIndividual && (
                <DefinitionRow term={dictionary.course.priceIndividual}>
                  {formatMoney(course.priceIndividual, locale)}
                </DefinitionRow>
              )}

              {course.corporate.available && (
                <DefinitionRow term={dictionary.course.priceCorporate}>
                  {course.corporate.showPrice && course.corporate.price
                    ? formatMoney(course.corporate.price, locale)
                    : dictionary.course.priceOnRequest}
                </DefinitionRow>
              )}

              <DefinitionRow term={dictionary.course.duration}>
                <span data-numeric>{course.durationHours}</span> {dictionary.common.hours}
              </DefinitionRow>

              <DefinitionRow term={dictionary.course.sessionsCount}>
                <span data-numeric>{course.sessionsCount}</span> {dictionary.common.sessions}
              </DefinitionRow>

              {course.locations.length > 0 && (
                <DefinitionRow term={dictionary.course.delivery}>
                  {course.locations.map((location) => location.city).join('، ')}
                </DefinitionRow>
              )}
            </dl>

            <div className="mt-6 space-y-3">
              {canRegister ? (
                <Button href={`/${locale}/courses/${slug}/register`} className="w-full">
                  {dictionary.course.register}
                </Button>
              ) : (
                <Button href={`/${locale}/contact`} variant="secondary" className="w-full">
                  {status === 'full' ? dictionary.course.joinWaitlist : dictionary.course.notifyMe}
                </Button>
              )}

              <Button href={`/${locale}/contact`} variant="ghost" className="w-full">
                {dictionary.home.heroCtaSecondary}
              </Button>
            </div>

            {course.technologies.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
                {course.technologies.map((tech) => (
                  <li key={tech}>
                    <Badge>{tech}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </aside>
      </div>

      <JsonLd
        data={[
          courseSchema(course, settings, locale),
          breadcrumbSchema([
            { name: dictionary.nav.home, path: `/${locale}` },
            { name: dictionary.nav.courses, path: `/${locale}/courses` },
            { name: course.title, path: `/${locale}/courses/${slug}` },
          ]),
          ...(faqSchema(course.faqs) ? [faqSchema(course.faqs)!] : []),
        ]}
      />
    </>
  )
}
