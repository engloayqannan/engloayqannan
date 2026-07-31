import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/primitives'
import type { SiteSettings } from '@/lib/content/types'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionary'
import { formatNumber } from '@/lib/utils/format'

export function Hero({
  settings,
  locale,
  dictionary,
}: {
  settings: SiteSettings
  locale: Locale
  dictionary: Dictionary
}) {
  const highlights = settings.stats.slice(0, 3)

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div aria-hidden="true" className="surface-grid pointer-events-none absolute inset-0" />

      <div className="container-page relative py-20 md:py-28">
        <div className="max-w-3xl">
          <Badge tone="accent">{dictionary.home.heroEyebrow}</Badge>

          <h1 className="mt-6 text-3xl md:text-4xl">{settings.fullName}</h1>
          <p className="mt-4 text-lg text-muted">{settings.headline}</p>
          <p className="mt-6 max-w-2xl leading-relaxed text-muted">{settings.shortBio}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={`/${locale}/courses`} size="lg">
              {dictionary.home.heroCtaPrimary}
            </Button>
            <Button href={`/${locale}/contact`} size="lg" variant="secondary">
              {dictionary.home.heroCtaSecondary}
            </Button>
          </div>

          {highlights.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {highlights.map((stat) => (
                <li key={stat.label} className="text-xs text-muted">
                  <span className="font-bold text-fg" data-numeric>
                    {formatNumber(stat.value, locale)}
                    {stat.suffix}
                  </span>{' '}
                  {stat.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
