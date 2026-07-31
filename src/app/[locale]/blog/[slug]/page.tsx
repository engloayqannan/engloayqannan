import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/seo/JsonLd'
import { Badge, Card, Prose } from '@/components/ui/primitives'
import { RichText } from '@/components/ui/RichText'
import { getPost, getPostSlugs, getPosts, getSiteSettings } from '@/lib/content'
import { isLocale, locales, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { articleSchema, breadcrumbSchema } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { formatDate } from '@/lib/utils/format'

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getPostSlugs()
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: raw, slug } = await params
  if (!isLocale(raw)) return {}

  const locale = raw as Locale
  const dictionary = getDictionary(locale)
  const post = await getPost(slug, locale)

  if (!post) return {}

  return buildMetadata({
    locale,
    path: `blog/${slug}`,
    title: post.title,
    description: post.excerpt,
    siteName: dictionary.meta.siteName,
    type: 'article',
    publishedTime: post.publishedAt,
    ogImage: post.coverImage?.url ?? null,
  })
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: raw, slug } = await params
  if (!isLocale(raw)) notFound()

  const locale = raw as Locale
  const dictionary = getDictionary(locale)

  const [post, settings, allPosts] = await Promise.all([
    getPost(slug, locale),
    getSiteSettings(locale),
    getPosts(locale),
  ])

  if (!post) notFound()

  const related = allPosts
    .filter((item) => item.slug !== post.slug)
    .filter((item) => item.tags.some((tag) => post.tags.includes(tag)))
    .slice(0, 2)

  return (
    <article className="container-page max-w-3xl py-16">
      <Link href={`/${locale}/blog`} className="text-2xs text-muted hover:text-fg">
        ← {dictionary.blog.title}
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl">{post.title}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-2xs text-muted">
          <span>{dictionary.blog.publishedOn}</span>
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
          <span aria-hidden="true">·</span>
          <span>
            <span data-numeric>{post.readingTime}</span> {dictionary.blog.readingTime}
          </span>
        </div>

        {post.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Badge>{tag}</Badge>
              </li>
            ))}
          </ul>
        )}
      </header>

      <Prose className="mt-10 max-w-none">
        <RichText value={post.body} />
      </Prose>

      {related.length > 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="text-xl">{dictionary.blog.relatedPosts}</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {related.map((item) => (
              <Card as="li" key={item.id} className="relative p-5">
                <h3 className="text-sm font-semibold">
                  <Link
                    href={`/${locale}/blog/${item.slug}`}
                    className="after:absolute after:inset-0 hover:text-accent"
                  >
                    {item.title}
                  </Link>
                </h3>
                <p className="mt-2 text-2xs text-muted">{item.excerpt}</p>
              </Card>
            ))}
          </ul>
        </section>
      )}

      <JsonLd
        data={[
          articleSchema(post, settings, locale),
          breadcrumbSchema([
            { name: dictionary.nav.home, path: `/${locale}` },
            { name: dictionary.blog.title, path: `/${locale}/blog` },
            { name: post.title, path: `/${locale}/blog/${slug}` },
          ]),
        ]}
      />
    </article>
  )
}
