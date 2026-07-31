import type { Metadata } from 'next'

import { locales, type Locale } from '@/lib/i18n/config'

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}

/** المسار بلا جزء اللغة، لبناء بدائل hreflang. */
function alternatesFor(path: string): Record<string, string> {
  const clean = path.replace(/^\//, '')
  const entries = locales.map((locale) => [locale, absoluteUrl(`/${locale}${clean ? `/${clean}` : ''}`)])

  return {
    ...Object.fromEntries(entries),
    // العربية هي الافتراضية عند غياب تطابق لغوي (SPEC §9.1)
    'x-default': absoluteUrl(`/ar${clean ? `/${clean}` : ''}`),
  }
}

export interface PageMetadataInput {
  locale: Locale
  /** المسار بلا لغة، مثل "courses/react-professional" */
  path?: string
  title: string
  description: string
  siteName: string
  ogImage?: string | null
  type?: 'website' | 'article'
  publishedTime?: string | null
  noIndex?: boolean
}

export function buildMetadata({
  locale,
  path = '',
  title,
  description,
  siteName,
  ogImage,
  type = 'website',
  publishedTime,
  noIndex,
}: PageMetadataInput): Metadata {
  const clean = path.replace(/^\//, '')
  const canonical = absoluteUrl(`/${locale}${clean ? `/${clean}` : ''}`)

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical,
      languages: alternatesFor(clean),
    },
    openGraph: {
      type,
      title,
      description,
      url: canonical,
      siteName,
      locale: locale === 'ar' ? 'ar_AR' : 'en_US',
      // يُحذف المفتاح تماماً عند غياب صورة صريحة — تعيينه إلى undefined
      // يمنع Next من إدراج صورة opengraph-image المولّدة بالاصطلاح
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: title }] } : {}),
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  }
}
