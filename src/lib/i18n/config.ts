export const locales = ['ar', 'en'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'ar'

export const localeDirections: Record<Locale, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
}

export const localeNames: Record<Locale, string> = {
  ar: 'العربية',
  en: 'English',
}

/** اسم الكوكي الذي يحفظ تفضيل اللغة (سنة واحدة). */
export const LOCALE_COOKIE = 'NEXT_LOCALE'
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value)
}

export function getDirection(locale: Locale): 'rtl' | 'ltr' {
  return localeDirections[locale]
}

/**
 * يستبدل جزء اللغة في المسار مع الحفاظ على بقية الصفحة،
 * حتى لا يعيد مبدّل اللغة المستخدم إلى الرئيسية (SPEC §4.1).
 */
export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return `/${target}`
  if (isLocale(segments[0])) {
    segments[0] = target
    return `/${segments.join('/')}`
  }

  return `/${target}/${segments.join('/')}`
}

/**
 * يختار أفضل لغة مطابقة من ترويسة Accept-Language،
 * ويسقط للغة الافتراضية (العربية) عند غياب تطابق.
 */
export function matchLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale

  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag = '', ...params] = part.trim().split(';')
      const qParam = params.find((p) => p.trim().startsWith('q='))
      const quality = qParam ? Number.parseFloat(qParam.split('=')[1] ?? '1') : 1
      return { tag: tag.trim().toLowerCase(), quality: Number.isNaN(quality) ? 0 : quality }
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((a, b) => b.quality - a.quality)

  for (const { tag } of ranked) {
    const base = tag.split('-')[0]
    if (isLocale(base)) return base
  }

  return defaultLocale
}
