import type { Dictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/config'

export interface NavEntry {
  href: string
  label: string
}

/**
 * المدونة تُخفى من التنقل حين لا يوجد محتوى منشور — قسم فارغ يضرّ
 * بالمصداقية أكثر مما ينفع (SPEC §5.9).
 */
export function buildNavigation(
  locale: Locale,
  dictionary: Dictionary,
  options: { hasPosts: boolean },
): NavEntry[] {
  const entries: NavEntry[] = [
    { href: `/${locale}/about`, label: dictionary.nav.about },
    { href: `/${locale}/courses`, label: dictionary.nav.courses },
    { href: `/${locale}/certificates`, label: dictionary.nav.certificates },
    { href: `/${locale}/testimonials`, label: dictionary.nav.testimonials },
    { href: `/${locale}/teaching`, label: dictionary.nav.teaching },
  ]

  if (options.hasPosts) {
    entries.push({ href: `/${locale}/blog`, label: dictionary.nav.blog })
  }

  entries.push({ href: `/${locale}/contact`, label: dictionary.nav.contact })

  return entries
}
