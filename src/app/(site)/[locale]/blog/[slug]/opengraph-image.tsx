import { getPost, getPostSlugs } from '@/lib/content'
import { isLocale, locales, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/seo/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Article share image'

export async function generateStaticParams() {
  const slugs = await getPostSlugs()
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export default async function PostOgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: raw, slug } = await params
  const locale: Locale = isLocale(raw) ? raw : 'ar'
  const dictionary = getDictionary(locale)
  const post = await getPost(slug, locale)

  return renderOgCard({
    locale,
    eyebrow: dictionary.blog.title,
    title: post?.title ?? dictionary.blog.title,
    subtitle: post?.excerpt ?? null,
    footer: post ? `${post.readingTime} ${dictionary.blog.readingTime}` : null,
  })
}
