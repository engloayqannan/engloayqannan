import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RegistrationForm, type CohortOption } from '@/components/forms/RegistrationForm'
import { EmptyState } from '@/components/ui/primitives'
import { Button } from '@/components/ui/Button'
import { getCourse, getSiteSettings } from '@/lib/content'
import { registrableCohorts } from '@/lib/courses/cohort-status'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { formatDate } from '@/lib/utils/format'

/**
 * صفحة التسجيل ديناميكية دائماً: قائمة الدفعات المتاحة تتغير مع
 * المقاعد، ولا يجوز تقديم نسخة مخزّنة تعرض دفعة امتلأت (SPEC §3.3).
 */
export const dynamic = 'force-dynamic'

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

  return buildMetadata({
    locale,
    path: `courses/${slug}/register`,
    title: `${dictionary.register.title} — ${course?.title ?? ''}`.trim(),
    description: dictionary.register.subtitle,
    siteName: dictionary.meta.siteName,
    // صفحة إجرائية لا قيمة لها في نتائج البحث
    noIndex: true,
  })
}

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale: raw, slug } = await params
  if (!isLocale(raw)) notFound()

  const locale = raw as Locale
  const dictionary = getDictionary(locale)
  const query = await searchParams

  const [course, settings] = await Promise.all([getCourse(slug, locale), getSiteSettings(locale)])
  if (!course) notFound()

  const available = registrableCohorts(course.cohorts)

  const options: CohortOption[] = available.map((cohort) => ({
    id: cohort.id,
    mode: cohort.mode,
    label: [
      cohort.startDate ? formatDate(cohort.startDate, locale) : dictionary.courses.status.soon,
      cohort.schedule,
      cohort.city,
    ]
      .filter(Boolean)
      .join(' · '),
  }))

  const requestedCohort = Array.isArray(query.cohort) ? query.cohort[0] : query.cohort
  const defaultCohortId =
    requestedCohort && options.some((option) => option.id === requestedCohort)
      ? requestedCohort
      : (options[0]?.id ?? null)

  return (
    <div className="container-page max-w-3xl py-16">
      <Link href={`/${locale}/courses/${slug}`} className="text-2xs text-muted hover:text-fg">
        ← {course.title}
      </Link>

      <h1 className="mt-4 text-3xl">{dictionary.register.title}</h1>
      <p className="mt-3 text-muted">{dictionary.register.subtitle}</p>

      <div className="mt-10">
        {options.length === 0 ? (
          <EmptyState
            title={dictionary.course.noCohorts}
            action={
              <Button href={`/${locale}/contact`} variant="secondary">
                {dictionary.home.heroCtaSecondary}
              </Button>
            }
          />
        ) : (
          <RegistrationForm
            locale={locale}
            dictionary={dictionary}
            courseSlug={course.slug}
            courseTitle={course.title}
            modes={course.modes}
            cohorts={options}
            defaultCohortId={defaultCohortId}
            whatsappNumber={settings.whatsappNumber}
          />
        )}
      </div>
    </div>
  )
}
