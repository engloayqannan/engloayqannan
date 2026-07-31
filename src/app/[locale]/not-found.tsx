import Link from 'next/link'

import { defaultLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'

/**
 * صفحة 404 داخل قطاع اللغة لا تستطيع قراءة الـ params، لذلك تُعرض
 * باللغة الافتراضية مع رابط عودة للجذر الذي يعيد التوجيه حسب التفضيل.
 */
export default function NotFound() {
  const dictionary = getDictionary(defaultLocale)

  return (
    <div className="container-page flex min-h-[60dvh] flex-col items-center justify-center py-20 text-center">
      <p className="text-4xl font-bold text-accent" data-numeric>
        404
      </p>
      <h1 className="mt-4 text-2xl">{dictionary.notFound.title}</h1>
      <p className="mt-3 max-w-md text-muted">{dictionary.notFound.body}</p>

      <Link
        href={`/${defaultLocale}`}
        className="mt-8 inline-flex h-11 items-center rounded-sm bg-accent px-5 text-sm font-semibold text-accent-contrast"
      >
        {dictionary.notFound.cta}
      </Link>
    </div>
  )
}
