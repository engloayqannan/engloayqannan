import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import { Card, Prose, Section } from '@/components/ui/primitives'
import { RichText } from '@/components/ui/RichText'
import { getSiteSettings } from '@/lib/content'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { isVectorAsset } from '@/lib/utils/format'

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
  const settings = await getSiteSettings(locale)

  return buildMetadata({
    locale,
    path: 'about',
    title: dictionary.about.title,
    description: settings.shortBio,
    siteName: dictionary.meta.siteName,
  })
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()

  const locale = raw as Locale
  const dictionary = getDictionary(locale)
  const settings = await getSiteSettings(locale)

  return (
    <>
      <div className="border-b border-border bg-bg-elevated">
        <div className="container-page grid gap-10 py-16 md:grid-cols-[1fr_16rem] md:items-start">
          <div>
            <h1 className="text-3xl">{dictionary.about.title}</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted">{settings.headline}</p>
            <Prose className="mt-6">
              <RichText value={settings.longBio} />
            </Prose>

            <div className="mt-8 flex flex-wrap gap-3">
              {settings.cvUrl && (
                <Button href={settings.cvUrl} external>
                  {dictionary.about.downloadCv}
                </Button>
              )}
              <Button href={`/${locale}/contact`} variant="secondary">
                {dictionary.home.heroCtaSecondary}
              </Button>
            </div>
          </div>

          {settings.avatar && (
            <Image
              src={settings.avatar.url}
              alt={settings.avatar.alt}
              width={settings.avatar.width ?? 480}
              height={settings.avatar.height ?? 480}
              sizes="(max-width: 768px) 60vw, 16rem"
              unoptimized={isVectorAsset(settings.avatar.url)}
              className="w-full max-w-64 rounded-md border border-border"
            />
          )}
        </div>
      </div>

      {settings.timeline.length > 0 && (
        <Section title={dictionary.about.timelineTitle}>
          <ol className="space-y-4">
            {settings.timeline.map((entry) => (
              <Card as="li" key={`${entry.period}-${entry.title}`} className="p-6">
                <p className="text-2xs font-semibold text-accent" data-numeric>
                  {entry.period}
                </p>
                <h3 className="mt-2 text-lg">{entry.title}</h3>
                <p className="mt-1 text-xs text-muted">{entry.organisation}</p>
                <p className="mt-3 text-sm text-muted">{entry.body}</p>
              </Card>
            ))}
          </ol>
        </Section>
      )}

      {settings.approach.length > 0 && (
        <Section title={dictionary.about.approachTitle} className="bg-bg-elevated">
          <div className="grid gap-6 md:grid-cols-2">
            {settings.approach.map((item) => (
              <Card key={item.title} className="p-6">
                <h3 className="text-lg">{item.title}</h3>
                <p className="mt-3 text-sm text-muted">{item.body}</p>
              </Card>
            ))}
          </div>
        </Section>
      )}
    </>
  )
}
