import { ImageResponse } from 'next/og'

import type { Locale } from '@/lib/i18n/config'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

/**
 * تشكيل النص العربي في next/og يتطلب تحميل خط عربي صريح، وإلا ظهرت
 * الحروف منفصلة أو مربعات فارغة (SPEC §9.2).
 *
 * الخط يُجلب مرة واحدة ويُخزَّن في الذاكرة: البناء يولّد عشرات الصور،
 * وطلب خط مستقل لكل صورة يصطدم بحدود المزوّد فتفشل بعض الطلبات —
 * و`satori` يرمي خطأً حين لا يجد أي خط، فيُسقط البناء كله.
 */
let fontPromise: Promise<ArrayBuffer | null> | null = null

async function fetchArabicFont(): Promise<ArrayBuffer | null> {
  try {
    const cssResponse = await fetch(
      'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@700',
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    )

    if (!cssResponse.ok) return null

    const css = await cssResponse.text()
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype|woff2?)'\)/)?.[1]
    if (!url) return null

    const fontResponse = await fetch(url)
    if (!fontResponse.ok) return null

    return await fontResponse.arrayBuffer()
  } catch {
    return null
  }
}

export function loadArabicFont(): Promise<ArrayBuffer | null> {
  fontPromise ??= fetchArabicFont()
  return fontPromise
}

export interface OgCardInput {
  locale: Locale
  eyebrow: string
  title: string
  subtitle?: string | null
  footer?: string | null
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value
}

/**
 * satori لا ينفّذ خوارزمية Unicode ثنائية الاتجاه: يشكّل حروف الكلمة
 * العربية صحيحة، لكنه يرصّ الكلمات من اليسار إلى اليمين ويتجاهل
 * `direction: rtl` تماماً — فيخرج العنوان العربي مقلوب ترتيب الكلمات.
 *
 * الحل: ترتيب الكلمات يدوياً في حاوية `row-reverse` قابلة للالتفاف،
 * فيضع المحرّك أول كلمة أقصى اليمين كما هو متوقع.
 */
function BidiText({
  text,
  locale,
  style,
}: {
  text: string
  locale: Locale
  style: Record<string, string | number>
}) {
  if (locale !== 'ar') return <div style={style}>{text}</div>

  return (
    <div
      style={{
        ...style,
        display: 'flex',
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        columnGap: 14,
      }}
    >
      {text.split(/\s+/).filter(Boolean).map((word, index) => (
        <span key={`${word}-${index}`}>{word}</span>
      ))}
    </div>
  )
}

/**
 * بطاقة مشاركة موحّدة الشكل لكل أنواع الصفحات. حين يتعذّر تحميل الخط
 * تُرسم البطاقة بهويتها البصرية بلا نص بدل أن ينهار البناء — صورة
 * مشاركة باهتة أهون من نشر معطَّل.
 */
export async function renderOgCard({
  locale,
  eyebrow,
  title,
  subtitle,
  footer,
}: OgCardInput): Promise<ImageResponse> {
  const font = await loadArabicFont()

  // عقد النص بلا display:flex عمداً: satori يعامل الكلمات داخل حاوية
  // flex كعناصر مستقلة فينعكس ترتيبها في الاتجاه RTL
  // satori يتجاهل direction، فمحاذاة العناصر غير النصية تُضبط صراحةً
  const accentBar = (
    <div
      style={{
        marginTop: 44,
        height: 6,
        width: 180,
        backgroundColor: '#22d3ee',
        alignSelf: locale === 'ar' ? 'flex-end' : 'flex-start',
      }}
    />
  )

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
        {font ? (
          // satori لا يعامل الأجزاء (fragments) كحاويات تخطيط، فتتراكم
          // العناصر فوق بعضها. لا بد من حاوية flex صريحة.
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <BidiText text={eyebrow} locale={locale} style={{ fontSize: 26, color: '#22d3ee' }} />

            <BidiText
              text={truncate(title, 120)}
              locale={locale}
              style={{
                marginTop: 24,
                fontSize: title.length > 60 ? 48 : 62,
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            />

            {subtitle && (
              <BidiText
                text={truncate(subtitle, 110)}
                locale={locale}
                style={{ marginTop: 24, fontSize: 28, color: '#93a4b5', lineHeight: 1.5 }}
              />
            )}

            {accentBar}

            {footer && (
              <BidiText
                text={footer}
                locale={locale}
                style={{ marginTop: 28, fontSize: 24, color: '#93a4b5' }}
              />
            )}
          </div>
        ) : (
          accentBar
        )}
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: font
        ? [{ name: 'IBM Plex Sans Arabic', data: font, style: 'normal', weight: 700 }]
        : [],
    },
  )
}
