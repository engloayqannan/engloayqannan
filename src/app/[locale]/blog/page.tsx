import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Badge, Card, EmptyState } from '@/components/ui/primitives'
import { getPosts } from '@/lib/content'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'
import { formatDate } from '@/lib/utils/format'

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
    path: 'blog',
    title: dictionary.blog.title,
    description: dictionary.blog.subtitle,
    siteName: dictionary.meta.siteName,
  })
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()

  const locale = raw as Locale
  const dictionary = getDictionary(locale)
  const posts = await getPosts(locale)

  return (
    <div className="container-page py-16">
      <header className="max-w-2xl">
        <h1 className="text-3xl">{dictionary.blog.title}</h1>
        <p className="mt-3 text-muted">{dictionary.blog.subtitle}</p>
      </header>

      <div className="mt-10">
        {posts.length === 0 ? (
          <EmptyState title={dictionary.blog.empty} />
        ) : (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card as="li" key={post.id} className="relative flex h-full flex-col p-6">
                <div className="flex flex-wrap items-center gap-3 text-2xs text-muted">
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
                  <span aria-hidden="true">·</span>
                  <span>
                    <span data-numeric>{post.readingTime}</span> {dictionary.blog.readingTime}
                  </span>
                </div>

                <h2 className="mt-3 text-lg">
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="after:absolute after:inset-0 hover:text-accent"
                  >
                    {post.title}
                  </Link>
                </h2>

                <p className="mt-3 flex-1 text-sm text-muted">{post.excerpt}</p>

                {post.tags.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <li key={tag}>
                        <Badge>{tag}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
