'use client'

import Script from 'next/script'
import { useEffect, useId, useRef, useState } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
          theme?: 'auto' | 'light' | 'dark'
          language?: string
        },
      ) => string
    }
  }
}

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

/**
 * لا يُحمَّل أي سكربت عندما يكون المفتاح العام غائباً — الوضع الافتراضي
 * صفر كلفة على الحزمة والشبكة (SPEC §7.5).
 */
export function Turnstile({
  onToken,
  locale,
}: {
  onToken: (token: string) => void
  locale: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const id = useId()

  useEffect(() => {
    if (!ready || !TURNSTILE_SITE_KEY || !containerRef.current) return
    if (!window.turnstile) return

    window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: onToken,
      'expired-callback': () => onToken(''),
      'error-callback': () => onToken(''),
      theme: 'auto',
      language: locale,
    })
  }, [ready, onToken, locale])

  if (!TURNSTILE_SITE_KEY) return null

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="lazyOnload"
        onLoad={() => setReady(true)}
      />
      <div ref={containerRef} id={`turnstile-${id}`} />
    </>
  )
}
