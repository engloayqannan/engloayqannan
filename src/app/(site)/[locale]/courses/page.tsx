import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CourseCard } from '@/components/courses/CourseCard'
import { Button } from '@/components/ui/Button'
import { Badge, EmptyState } from '@/components/ui/primitives'
import { getCourses, getSiteSettings } from '@/lib/content'
import type { CourseWithCohorts, DeliveryMode, Level } from '@/lib/content/types'
import { courseStatus } from '@/lib/courses/cohort-status'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { cn } from '@/lib/utils/format'

export const revalidate = 3600

type SearchParams = Record<string, string | string[] | undefined>

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
    path: 'courses',
    title: dictionary.courses.title,
    description: dictionary.courses.subtitle,
    siteName: dictionary.meta.siteName,
  })
}

function single(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function filterCourses(
  courses: CourseWithCohorts[],
  filters: { mode: string | null; level: string | null; tech: string | null; open: boolean },
): CourseWithCohorts[] {
  return courses.filter((course) => {
    if (filters.mode && !course.modes.includes(filters.mode as DeliveryMode)) return false
    if (filters.level && course.level !== (filters.level as Level)) return false
    if (filters.tech && !course.technologies.includes(filters.tech)) return false

    if (filters.open) {
      const status = courseStatus(course.cohorts)
      if (status !== 'open' && status !== 'few_left') return false
    }

    return true
  })
}

/** الفلاتر تُعكس في الـ URL لتكون قابلة للمشاركة وصديقة لزر الرجوع (SPEC §5.3). */
function buildFilterHref(
  base: string,
  current: SearchParams,
  key: string,
  value: string | null,
): string {
  const params = new URLSearchParams()

  for (const [existingKey, existingValue] of Object.entries(current)) {
    const resolved = single(existingValue)
    if (resolved) params.set(existingKey, resolved)
  }

  if (value === null) params.delete(key)
  else params.set(key, value)

  const query = params.toString()
  return query ? `${base}?${query}` : base
}

function FilterGroup({
  label,
  options,
  activeValue,
  paramKey,
  base,
  current,
  allLabel,
}: {
  label: string
  options: { value: string; label: string }[]
  activeValue: string | null
  paramKey: string
  base: string
  current: SearchParams
  allLabel: string
}) {
  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="sr-only">{label}</legend>
      <span className="text-2xs font-semibold text-muted">{label}</span>

      <Link
        href={buildFilterHref(base, current, paramKey, null)}
        aria-current={activeValue === null ? 'true' : undefined}
        className={cn(
          'rounded-full border px-3 py-1 text-2xs transition-colors',
          activeValue === null
            ? 'border-transparent bg-accent-soft text-accent'
            : 'border-border text-muted hover:text-fg',
        )}
      >
        {allLabel}
      </Link>

      {options.map((option) => (
        <Link
          key={option.value}
          href={buildFilterHref(base, current, paramKey, option.value)}
          aria-current={activeValue === option.value ? 'true' : undefined}
          className={cn(
            'rounded-full border px-3 py-1 text-2xs transition-colors',
            activeValue === option.value
              ? 'border-transparent bg-accent-soft text-accent'
              : 'border-border text-muted hover:text-fg',
          )}
        >
          {option.label}
        </Link>
      ))}
    </fieldset>
  )
}

export default async function CoursesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<SearchParams>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()

  const locale = raw as Locale
  const dictionary = getDictionary(locale)
  const query = await searchParams

  const [courses] = await Promise.all([getCourses(locale), getSiteSettings(locale)])

  const filters = {
    mode: single(query.mode),
    level: single(query.level),
    tech: single(query.tech),
    open: single(query.open) === '1',
  }

  const filtered = filterCourses(courses, filters)
  const base = `/${locale}/courses`
  const technologies = Array.from(new Set(courses.flatMap((course) => course.technologies))).sort()
  const hasFilters = Boolean(filters.mode || filters.level || filters.tech || filters.open)

  return (
    <div className="container-page py-16">
      <header className="max-w-2xl">
        <h1 className="text-3xl">{dictionary.courses.title}</h1>
        <p className="mt-3 text-muted">{dictionary.courses.subtitle}</p>
      </header>

      <section aria-label={dictionary.courses.filtersTitle} className="mt-10 space-y-4">
        <FilterGroup
          label={dictionary.courses.filterMode}
          paramKey="mode"
          base={base}
          current={query}
          activeValue={filters.mode}
          allLabel={dictionary.courses.all}
          options={(['online', 'onsite', 'hybrid'] as const).map((mode) => ({
            value: mode,
            label: dictionary.courses.mode[mode],
          }))}
        />

        <FilterGroup
          label={dictionary.courses.filterLevel}
          paramKey="level"
          base={base}
          current={query}
          activeValue={filters.level}
          allLabel={dictionary.courses.all}
          options={(['beginner', 'intermediate', 'advanced'] as const).map((level) => ({
            value: level,
            label: dictionary.courses.level[level],
          }))}
        />

        {technologies.length > 0 && (
          <FilterGroup
            label={dictionary.courses.filterTech}
            paramKey="tech"
            base={base}
            current={query}
            activeValue={filters.tech}
            allLabel={dictionary.courses.all}
            options={technologies.map((tech) => ({ value: tech, label: tech }))}
          />
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href={buildFilterHref(base, query, 'open', filters.open ? null : '1')}
            className={cn(
              'rounded-full border px-3 py-1 text-2xs transition-colors',
              filters.open
                ? 'border-transparent bg-accent-soft text-accent'
                : 'border-border text-muted hover:text-fg',
            )}
          >
            {dictionary.courses.filterOpenOnly}
          </Link>

          {hasFilters && (
            <Link href={base} className="text-2xs text-muted underline hover:text-fg">
              {dictionary.courses.clearFilters}
            </Link>
          )}

          <Badge>
            <span data-numeric>{filtered.length}</span> {dictionary.courses.resultsCount}
          </Badge>
        </div>
      </section>

      <div className="mt-10">
        {filtered.length === 0 ? (
          <EmptyState
            title={dictionary.courses.emptyTitle}
            body={dictionary.courses.emptyBody}
            action={
              <Button href={`/${locale}/contact`} variant="secondary">
                {dictionary.home.heroCtaSecondary}
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                locale={locale}
                dictionary={dictionary}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
