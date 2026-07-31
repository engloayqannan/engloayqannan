import type { Locale } from '@/lib/i18n/config'
import type { Money } from '@/lib/content/types'

/**
 * الأرقام لاتينية في الواجهتين — قرار مقصود للجمهور التقني (SPEC §4.2).
 */
const numberingSystem = 'latn'

function intlLocale(locale: Locale): string {
  return locale === 'ar' ? `ar-u-nu-${numberingSystem}` : 'en-GB'
}

export function formatDate(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatMonthYear(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat(intlLocale(locale), {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/** وقت مضبوط بمنطقة زمنية صريحة — لا يعتمد على منطقة الخادم. */
export function formatTimeInZone(
  iso: string | null | undefined,
  timezone: string,
  locale: Locale,
): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  try {
    return new Intl.DateTimeFormat(intlLocale(locale), {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone,
    }).format(date)
  } catch {
    return new Intl.DateTimeFormat(intlLocale(locale), {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date)
  }
}

export function formatDateInZone(
  iso: string | null | undefined,
  timezone: string,
  locale: Locale,
): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  try {
    return new Intl.DateTimeFormat(intlLocale(locale), {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: timezone,
    }).format(date)
  } catch {
    return formatDate(iso, locale)
  }
}

/** اسم مختصر للمنطقة الزمنية كما يعرضه المتصفح، مثل GMT+3. */
export function timezoneLabel(timezone: string, locale: Locale): string {
  try {
    const parts = new Intl.DateTimeFormat(intlLocale(locale), {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    }).formatToParts(new Date())

    return parts.find((part) => part.type === 'timeZoneName')?.value ?? timezone
  } catch {
    return timezone
  }
}

export function formatMoney(money: Money | null | undefined, locale: Locale): string {
  if (!money) return ''

  try {
    return new Intl.NumberFormat(intlLocale(locale), {
      style: 'currency',
      currency: money.currency,
      maximumFractionDigits: 0,
    }).format(money.amount)
  } catch {
    return `${money.amount} ${money.currency}`
  }
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale)).format(value)
}

/** مدة الفترة بصيغة «٢٠١٩ — الآن». */
export function formatPeriod(
  startDate: string,
  endDate: string | null,
  locale: Locale,
  presentLabel: string,
): string {
  const start = new Date(startDate)
  const startYear = Number.isNaN(start.getTime())
    ? ''
    : new Intl.DateTimeFormat(intlLocale(locale), { year: 'numeric' }).format(start)

  if (!endDate) return `${startYear} — ${presentLabel}`

  const end = new Date(endDate)
  const endYear = Number.isNaN(end.getTime())
    ? ''
    : new Intl.DateTimeFormat(intlLocale(locale), { year: 'numeric' }).format(end)

  return `${startYear} — ${endYear}`
}

/** الأصول المتجهة تُعرض بلا تحسين — لا يعالج محسّن الصور ملفات SVG. */
export function isVectorAsset(url: string): boolean {
  return url.toLowerCase().endsWith('.svg')
}

export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}

/** يستبدل العناصر النائبة `{name}` داخل نص مترجم. */
export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  )
}
