import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/lib/seo/metadata'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // الاستوديو ومسارات الـ API لا قيمة لها في الفهرسة (SPEC §9.4)
      disallow: ['/studio', '/api/'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
