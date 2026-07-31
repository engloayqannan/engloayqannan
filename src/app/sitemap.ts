import type { MetadataRoute } from 'next'

import { getCourseSlugs, getPostSlugs } from '@/lib/content'
import { locales } from '@/lib/i18n/config'
import { absoluteUrl } from '@/lib/seo/metadata'

const STATIC_PATHS = [
  '',
  'about',
  'courses',
  'certificates',
  'testimonials',
  'teaching',
  'blog',
  'contact',
  'privacy',
]

/** كل مسار يُصدَّر باللغتين مع بدائل hreflang (SPEC §9.4). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courseSlugs, postSlugs] = await Promise.all([getCourseSlugs(), getPostSlugs()])

  const paths = [
    ...STATIC_PATHS,
    ...courseSlugs.map((slug) => `courses/${slug}`),
    ...postSlugs.map((slug) => `blog/${slug}`),
  ]

  const lastModified = new Date()

  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: absoluteUrl(`/${locale}${path ? `/${path}` : ''}`),
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((alt) => [alt, absoluteUrl(`/${alt}${path ? `/${path}` : ''}`)]),
        ),
      },
    })),
  )
}
