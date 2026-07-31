'use client'

import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

export const THEME_STORAGE_KEY = 'theme'

/**
 * سكربت يُحقن قبل الرسم لمنع وميض تبديل الوضع.
 * غياب اختيار محفوظ يعني «اتبع النظام»، ولا يضع data-theme إطلاقاً
 * حتى تتكفّل قاعدة prefers-color-scheme في CSS بالباقي (SPEC §8.2).
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})()`

function currentTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'

  const explicit = document.documentElement.getAttribute('data-theme')
  if (explicit === 'dark' || explicit === 'light') return explicit

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function ThemeToggle({ label }: { label: string }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTheme(currentTheme())
    setMounted(true)
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // التخزين المحظور لا يمنع التبديل خلال الجلسة الحالية
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={mounted ? theme === 'light' : undefined}
      className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-border text-muted transition-colors hover:bg-surface hover:text-fg"
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
        {mounted && theme === 'light' ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
          </>
        ) : (
          <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
        )}
      </svg>
    </button>
  )
}
