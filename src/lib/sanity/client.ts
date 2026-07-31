import { createClient, type SanityClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
export const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
export const sanityApiVersion = '2024-10-01'

/**
 * يُستورد العميل من `@sanity/client` لا من `next-sanity`: حزمة
 * `next-sanity` تصدّر مكوّنات عميل للمعاينة المباشرة، واستيراد أي شيء
 * من جذرها يسحبها كلها إلى حزمة المتصفح — قياس فعلي: ١٠٤ كيلوبايت
 * مضغوطة تُحمَّل في كل صفحة بلا فائدة (SPEC §10.1).
 *
 * الموقع يعمل بالكامل بلا Sanity: عند غياب الإعدادات تُقرأ البيانات من
 * المحتوى التجريبي (SPEC §12). هذا يبقي البناء والاختبارات مستقلة عن
 * خدمة خارجية، ويجعل النشر الأول ممكناً قبل تجهيز لوحة المحتوى.
 */
export const isSanityConfigured = Boolean(sanityProjectId)

let cachedClient: SanityClient | null = null

export function getSanityClient(): SanityClient | null {
  if (!isSanityConfigured || !sanityProjectId) return null

  if (!cachedClient) {
    cachedClient = createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: sanityApiVersion,
      useCdn: true,
      perspective: 'published',
    })
  }

  return cachedClient
}

/** عميل بصلاحية كتابة — للخادم فقط، لا يُستدعى من مكوّن عميل أبداً. */
export function getSanityWriteClient(): SanityClient | null {
  const token = process.env.SANITY_API_WRITE_TOKEN
  if (!isSanityConfigured || !sanityProjectId || !token) return null

  return createClient({
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: sanityApiVersion,
    token,
    useCdn: false,
  })
}

export function urlForImage(source: unknown): string | null {
  const client = getSanityClient()
  if (!client || !source) return null

  try {
    return imageUrlBuilder(client).image(source as never).auto('format').url()
  } catch {
    return null
  }
}

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  tags: string[] = [],
): Promise<T | null> {
  const client = getSanityClient()
  if (!client) return null

  try {
    return await client.fetch<T>(query, params, {
      next: { revalidate: 3600, tags },
    })
  } catch (error) {
    // فشل الـ CMS لا يُسقط الصفحة — نسقط للمحتوى التجريبي بدلاً من رمي خطأ
    console.error('[sanity] fetch failed', error instanceof Error ? error.message : error)
    return null
  }
}
