import { getCourse, getCourseSlugs } from '@/lib/content'
import { isLocale, locales, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/seo/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Course share image'

/**
 * صور المشاركة على مسار ديناميكي تحتاج معاملات ثابتة، وإلا لم تُدرج
 * وسوم og:image في الصفحات المولّدة مسبقاً (SPEC §9.2).
 */
export async function generateStaticParams() {
  const slugs = await getCourseSlugs()
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export default async function CourseOgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: raw, slug } = await params
  const locale: Locale = isLocale(raw) ? raw : 'ar'
  const dictionary = getDictionary(locale)
  const course = await getCourse(slug, locale)

  return renderOgCard({
    locale,
    eyebrow: dictionary.courses.title,
    title: course?.title ?? dictionary.courses.title,
    subtitle: course?.summary ?? null,
    footer: course
      ? `${dictionary.courses.level[course.level]} · ${course.durationHours} ${dictionary.common.hours}`
      : null,
  })
}
