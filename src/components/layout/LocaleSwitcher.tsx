'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

import { localeNames, switchLocalePath, type Locale } from '@/lib/i18n/config'

/**
 * يحافظ على الصفحة الحالية وفلاترها عند تبديل اللغة — لا يعيد
 * المستخدم إلى الرئيسية (SPEC §4.1).
 */
export function LocaleSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() ?? '/'
  const searchParams = useSearchParams()

  const target: Locale = locale === 'ar' ? 'en' : 'ar'
  const query = searchParams?.toString()
  const href = `${switchLocalePath(pathname, target)}${query ? `?${query}` : ''}`

  return (
    <Link
      href={href}
      hrefLang={target}
      lang={target}
      aria-label={label}
      className="inline-flex h-10 items-center rounded-sm border border-border px-3 text-xs font-semibold text-muted transition-colors hover:bg-surface hover:text-fg"
    >
      {localeNames[target]}
    </Link>
  )
}
