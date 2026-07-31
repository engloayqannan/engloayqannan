import { getSiteSettings } from '@/lib/content'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/seo/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Open Graph image'

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'ar'
  const dictionary = getDictionary(locale)
  const settings = await getSiteSettings(locale)

  return renderOgCard({
    locale,
    eyebrow: dictionary.home.heroEyebrow,
    title: settings.fullName,
    subtitle: settings.headline,
  })
}
