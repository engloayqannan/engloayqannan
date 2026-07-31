import { IBM_Plex_Mono, IBM_Plex_Sans_Arabic, Inter } from 'next/font/google'

/**
 * خطوط self-hosted عبر next/font — لا طلبات لخوادم خطوط خارجية،
 * و`display: swap` يمنع النص غير المرئي أثناء التحميل (SPEC §4.2).
 */

export const latinFont = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-latin',
})

export const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-arabic',
})

export const monoFont = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-mono',
})

export const fontVariables = `${latinFont.variable} ${arabicFont.variable} ${monoFont.variable}`
