import { connection } from 'next/server'

import { CourseStatusBadge } from '@/components/courses/CourseCard'
import { Button } from '@/components/ui/Button'
import { getCourse } from '@/lib/content'
import { resolveCohortAvailability } from '@/lib/courses/cohort-status'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionary'
import { formatDateInZone, formatDate, interpolate, timezoneLabel } from '@/lib/utils/format'

/**
 * المقاعد وحالة التسجيل تُقرأ خارج الكاش. عرض «متبقٍ ٣ مقاعد» وهي
 * ممتلئة خطأ منتَج لا خطأ أداء، لذلك هذا الجزء وحده ديناميكي بينما
 * تبقى بقية الصفحة ثابتة (SPEC §3.3).
 */
export async function CohortsPanel({
  slug,
  locale,
  dictionary,
}: {
  slug: string
  locale: Locale
  dictionary: Dictionary
}) {
  await connection()

  const course = await getCourse(slug, locale)
  const cohorts = course?.cohorts ?? []

  if (cohorts.length === 0) {
    return <p className="text-sm text-muted">{dictionary.course.noCohorts}</p>
  }

  return (
    <ul className="space-y-4">
      {cohorts.map((cohort) => {
        const availability = resolveCohortAvailability(cohort)
        const zone = timezoneLabel(cohort.timezone, locale)

        return (
          <li
            key={cohort.id}
            className="rounded-md border border-border bg-surface p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">
                  {cohort.startDate ? (
                    <time dateTime={cohort.startDate}>
                      {formatDateInZone(cohort.startDate, cohort.timezone, locale)}
                    </time>
                  ) : (
                    dictionary.courses.status.soon
                  )}
                </p>
                <p className="mt-1 text-2xs text-muted">
                  {cohort.schedule} · {zone}
                  {cohort.city ? ` · ${cohort.city}` : ''}
                </p>
              </div>

              <CourseStatusBadge status={availability.status} dictionary={dictionary} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-2xs text-muted sm:grid-cols-3">
              <div>
                <dt>{dictionary.courses.filterMode}</dt>
                <dd className="mt-1 font-semibold text-fg">
                  {dictionary.courses.mode[cohort.mode]}
                </dd>
              </div>
              <div>
                <dt>{dictionary.course.cohortSeats}</dt>
                <dd className="mt-1 font-semibold text-fg" data-numeric>
                  {availability.seatsRemaining}
                </dd>
              </div>
              {cohort.registrationDeadline && (
                <div>
                  <dt>{dictionary.course.cohortDeadline}</dt>
                  <dd className="mt-1 font-semibold text-fg">
                    <time dateTime={cohort.registrationDeadline}>
                      {formatDate(cohort.registrationDeadline, locale)}
                    </time>
                  </dd>
                </div>
              )}
            </dl>

            {availability.status === 'few_left' && (
              <p className="mt-3 text-2xs font-semibold text-warning">
                {interpolate(dictionary.course.seatsLeft, {
                  count: availability.seatsRemaining,
                })}
              </p>
            )}

            <div className="mt-4">
              {availability.canRegister ? (
                <Button
                  href={`/${locale}/courses/${slug}/register?cohort=${cohort.id}`}
                  size="sm"
                >
                  {dictionary.course.register}
                </Button>
              ) : (
                <Button href={`/${locale}/contact`} size="sm" variant="secondary">
                  {availability.status === 'full'
                    ? dictionary.course.joinWaitlist
                    : availability.status === 'soon'
                      ? dictionary.course.notifyMe
                      : dictionary.course.registrationClosed}
                </Button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function CohortsPanelSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {[0, 1].map((index) => (
        <div key={index} className="h-36 animate-pulse rounded-md border border-border bg-surface" />
      ))}
    </div>
  )
}
