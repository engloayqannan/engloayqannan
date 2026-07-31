import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Badge, Card, EmptyState } from '@/components/ui/primitives'
import { getTeachingEngagements } from '@/lib/content'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { formatPeriod } from '@/lib/utils/format'

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
    path: 'teaching',
    title: dictionary.teaching.title,
    description: dictionary.teaching.subtitle,
    siteName: dictionary.meta.siteName,
  })
}

export default async function TeachingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()

  const locale = raw as Locale
  const dictionary = getDictionary(locale)
  const engagements = await getTeachingEngagements(locale)

  return (
    <div className="container-page py-16">
      <header className="max-w-2xl">
        <h1 className="text-3xl">{dictionary.teaching.title}</h1>
        <p className="mt-3 text-muted">{dictionary.teaching.subtitle}</p>
      </header>

      <div className="mt-10">
        {engagements.length === 0 ? (
          <EmptyState title={dictionary.teaching.empty} />
        ) : (
          <ul className="space-y-6">
            {engagements.map((engagement) => (
              <Card as="li" key={engagement.id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg">{engagement.institution}</h2>
                    <p className="mt-1 text-xs text-muted">{engagement.role}</p>
                  </div>
                  <Badge>
                    <span data-numeric>
                      {formatPeriod(
                        engagement.startDate,
                        engagement.endDate,
                        locale,
                        dictionary.about.present,
                      )}
                    </span>
                  </Badge>
                </div>

                <p className="mt-4 text-sm text-muted">{engagement.description}</p>

                <dl className="mt-5 grid gap-4 border-t border-border pt-4 text-2xs sm:grid-cols-2">
                  <div>
                    <dt className="text-muted">{dictionary.teaching.coursesTaught}</dt>
                    <dd className="mt-1">
                      <ul className="flex flex-wrap gap-2">
                        {engagement.coursesTaught.map((course) => (
                          <li key={course}>
                            <Badge tone="accent">{course}</Badge>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">{dictionary.teaching.location}</dt>
                    <dd className="mt-1 font-semibold">
                      {engagement.city}، {engagement.country}
                    </dd>
                  </div>
                </dl>
              </Card>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
