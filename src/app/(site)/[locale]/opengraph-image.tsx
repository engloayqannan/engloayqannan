import { ImageResponse } from 'next/og'

import { getSiteSettings } from '@/lib/content'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Open Graph image'

/**
 * تشكيل النص العربي في next/og يتطلب تحميل خط عربي صريح داخل الدالة،
 * وإلا ظهرت الحروف منفصلة أو مربعات فارغة. لذلك نجلب الخط من ملفات
 * Google Fonts ونمرّره في fonts (SPEC §9.2).
 */
async function loadFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const cssResponse = await fetch(
      `https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@700&text=${encodeURIComponent(text)}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    )

    const css = await cssResponse.text()
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype|woff2?)'\)/)?.[1]
    if (!url) return null

    const fontResponse = await fetch(url)
    return await fontResponse.arrayBuffer()
  } catch {
    return null
  }
}

export default async function OpengraphImage({
  params,
}: {
  params: { locale: string }
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'ar'
  const dictionary = getDictionary(locale)
  const settings = await getSiteSettings(locale)

  const title = settings.fullName
  const subtitle = settings.headline
  const font = await loadFont(`${title}${subtitle}${dictionary.meta.siteName}`)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          backgroundColor: '#0b0f14',
          color: '#e6edf3',
          direction: locale === 'ar' ? 'rtl' : 'ltr',
        }}
      >
        <div style={{ display: 'flex', fontSize: 28, color: '#22d3ee' }}>
          {dictionary.home.heroEyebrow}
        </div>
        <div style={{ display: 'flex', marginTop: 24, fontSize: 68, fontWeight: 700 }}>
          {title}
        </div>
        <div style={{ display: 'flex', marginTop: 24, fontSize: 32, color: '#93a4b5' }}>
          {subtitle}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 48,
            height: 6,
            width: 180,
            backgroundColor: '#22d3ee',
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: 'IBM Plex Sans Arabic', data: font, style: 'normal', weight: 700 }]
        : undefined,
    },
  )
}
