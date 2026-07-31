import type { JsonLd as JsonLdData } from '@/lib/seo/jsonld'

/**
 * البيانات هنا مبنية داخلياً من المحتوى ولا تحمل أي مدخل مستخدم،
 * لذلك حقنها كـ JSON آمن — ومع ذلك نهرب علامة `<` احتياطاً من كسر الوسم.
 */
export function JsonLd({ data }: { data: JsonLdData | JsonLdData[] | null }) {
  if (!data || (Array.isArray(data) && data.length === 0)) return null

  const json = JSON.stringify(data).replace(/</g, '\\u003c')

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
