'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import type { Locale } from '@/lib/i18n/config'
import { cn } from '@/lib/utils/format'

import { LocaleSwitcher } from './LocaleSwitcher'
import { ThemeToggle } from './ThemeToggle'

export interface NavItem {
  href: string
  label: string
}

interface HeaderProps {
  locale: Locale
  brand: string
  items: NavItem[]
  labels: {
    openMenu: string
    closeMenu: string
    mainNavigation: string
    themeToggle: string
    localeSwitch: string
  }
}

export function Header({ locale, brand, items, labels }: HeaderProps) {
  const pathname = usePathname() ?? ''
  const [open, setOpen] = useState(false)

  // إغلاق قائمة الجوال عند الانتقال لصفحة أخرى
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  function isActive(href: string) {
    if (href === `/${locale}`) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href={`/${locale}`} className="text-sm font-bold tracking-tight">
          {brand}
        </Link>

        <nav aria-label={labels.mainNavigation} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={cn(
                    'rounded-sm px-3 py-2 text-xs font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-accent-soft text-accent'
                      : 'text-muted hover:bg-surface hover:text-fg',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {/* useSearchParams يجبر الصفحة على العرض على العميل ما لم يُعزل
              داخل Suspense — العزل يبقي كل الصفحات ثابتة (SPEC §3.3) */}
          <Suspense
            fallback={<div className="h-10 w-16 rounded-sm border border-border" aria-hidden="true" />}
          >
            <LocaleSwitcher locale={locale} label={labels.localeSwitch} />
          </Suspense>
          <ThemeToggle label={labels.themeToggle} />

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? labels.closeMenu : labels.openMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-border text-muted lg:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label={labels.mainNavigation}
          className="border-t border-border bg-bg lg:hidden"
        >
          <ul className="container-page flex flex-col py-2">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={cn(
                    'block rounded-sm px-3 py-3 text-sm font-medium',
                    isActive(item.href) ? 'text-accent' : 'text-muted',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
