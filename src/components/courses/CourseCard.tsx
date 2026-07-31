import Link from 'next/link'

import { Badge, Card } from '@/components/ui/primitives'
import type { CourseWithCohorts } from '@/lib/content/types'
import { courseStatus, nextCohort } from '@/lib/courses/cohort-status'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionary'
import { formatDate } from '@/lib/utils/format'

const statusTone = {
  open: 'success',
  few_left: 'warning',
  full: 'danger',
  soon: 'accent',
  closed: 'neutral',
} as const

export function CourseStatusBadge({
  status,
  dictionary,
}: {
  status: keyof typeof statusTone
  dictionary: Dictionary
}) {
  return <Badge tone={statusTone[status]}>{dictionary.courses.status[status]}</Badge>
}

export function CourseCard({
  course,
  locale,
  dictionary,
}: {
  course: CourseWithCohorts
  locale: Locale
  dictionary: Dictionary
}) {
  const status = courseStatus(course.cohorts)
  const upcoming = nextCohort(course.cohorts)

  return (
    <Card as="article" className="relative flex h-full flex-col p-6 hover:border-border-strong">
      <div className="flex flex-wrap items-center gap-2">
        <CourseStatusBadge status={status} dictionary={dictionary} />
        {course.modes.map((mode) => (
          <Badge key={mode}>{dictionary.courses.mode[mode]}</Badge>
        ))}
      </div>

      <h3 className="mt-4 text-lg">
        <Link
          href={`/${locale}/courses/${course.slug}`}
          className="after:absolute after:inset-0 hover:text-accent"
        >
          {course.title}
        </Link>
      </h3>

      <p className="mt-3 flex-1 text-sm text-muted">{course.summary}</p>

      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-2xs text-muted">
        <div>
          <dt className="sr-only">{dictionary.courses.filterLevel}</dt>
          <dd className="font-semibold text-fg">{dictionary.courses.level[course.level]}</dd>
        </div>
        <div className="text-end">
          <dt className="sr-only">{dictionary.course.duration}</dt>
          <dd>
            <span data-numeric>{course.durationHours}</span> {dictionary.common.hours}
          </dd>
        </div>
      </dl>

      {upcoming?.startDate && (
        <p className="mt-3 text-2xs text-muted">
          {dictionary.course.cohortStart}:{' '}
          <time dateTime={upcoming.startDate} className="font-semibold text-fg">
            {formatDate(upcoming.startDate, locale)}
          </time>
        </p>
      )}
    </Card>
  )
}
