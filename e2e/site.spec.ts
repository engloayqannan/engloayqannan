import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const PAGES = [
  '',
  '/about',
  '/courses',
  '/courses/react-professional',
  '/certificates',
  '/testimonials',
  '/teaching',
  '/blog',
  '/contact',
]

test.describe('التنقل واللغة', () => {
  test('الجذر يعيد التوجيه إلى لغة مدعومة', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/(ar|en)$/)
  })

  test('تبديل اللغة يحافظ على الصفحة الحالية', async ({ page }) => {
    await page.goto('/ar/courses/react-professional')
    await page.getByRole('link', { name: 'التبديل إلى الإنجليزية' }).click()

    await expect(page).toHaveURL('/en/courses/react-professional')
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
  })

  test('تبديل اللغة يحافظ على الفلاتر في الرابط', async ({ page }) => {
    await page.goto('/ar/courses?level=beginner')
    await page.getByRole('link', { name: 'التبديل إلى الإنجليزية' }).click()

    await expect(page).toHaveURL('/en/courses?level=beginner')
  })

  test('فلاتر الدورات تنعكس في الرابط وتعمل مع زر الرجوع', async ({ page }) => {
    await page.goto('/ar/courses')
    await page.getByRole('link', { name: 'مبتدئ', exact: true }).click()

    await expect(page).toHaveURL(/level=beginner/)

    await page.goBack()
    await expect(page).toHaveURL('/ar/courses')
  })

  test('رابط تخطّي المحتوى يظهر عند التركيز', async ({ page }) => {
    await page.goto('/ar')
    await page.keyboard.press('Tab')

    await expect(page.getByRole('link', { name: 'تخطَّ إلى المحتوى' })).toBeFocused()
  })
})

test.describe('الوضع الداكن والفاتح', () => {
  test('التبديل يثبت بعد إعادة التحميل', async ({ page }) => {
    await page.goto('/ar')

    await page.getByRole('button', { name: 'بدّل بين الوضع الداكن والفاتح' }).click()
    const chosen = await page.locator('html').getAttribute('data-theme')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', chosen ?? 'light')
  })
})

test.describe('عارض صور الشهادات', () => {
  test('يفتح ويُغلق بمفتاح Esc ويعيد التركيز لمصدره', async ({ page }) => {
    await page.goto('/ar/certificates')

    const trigger = page.getByRole('button', { name: /عرض صورة الشهادة/ }).first()
    await trigger.click()

    await expect(page.getByRole('dialog')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })
})

test.describe('إمكانية الوصول', () => {
  for (const path of PAGES) {
    for (const locale of ['ar', 'en']) {
      test(`صفر مخالفات جسيمة — ${locale}${path || '/'}`, async ({ page }) => {
        await page.goto(`/${locale}${path}`)

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze()

        const serious = results.violations.filter((violation) =>
          ['critical', 'serious'].includes(violation.impact ?? ''),
        )

        expect(
          serious,
          serious.map((violation) => `${violation.id}: ${violation.help}`).join('\n'),
        ).toEqual([])
      })
    }
  }

  test('كل لقطة رأي لها نص بديل غير فارغ', async ({ page }) => {
    await page.goto('/ar/testimonials')

    const images = page.locator('figure img')
    const count = await images.count()
    expect(count).toBeGreaterThan(0)

    for (let index = 0; index < count; index += 1) {
      const alt = await images.nth(index).getAttribute('alt')
      expect(alt?.trim().length ?? 0).toBeGreaterThan(10)
    }
  })
})

test.describe('التخطيط', () => {
  // انحدار حقيقي وقع أثناء التطوير: عنصر مخفي بإزاحة سالبة خلق تمريراً
  // أفقياً في الصفحات RTL وعطّل النقر على الشاشات الصغيرة
  for (const path of ['', '/courses', '/courses/react-professional/register', '/contact']) {
    test(`لا تمرير أفقي في الصفحة العربية — ${path || '/'}`, async ({ page }) => {
      await page.goto(`/ar${path}`)

      const overflow = await page.evaluate(() => {
        const root = document.documentElement
        return root.scrollWidth - root.clientWidth
      })

      expect(overflow).toBeLessThanOrEqual(1)
    })
  }
})

test.describe('SEO', () => {
  // بند قبول صريح: تشكيل العربية في صور المشاركة (SPEC §9.2)
  for (const [label, path] of [
    ['الرئيسية', ''],
    ['صفحة دورة', '/courses/react-professional'],
    ['مقال', '/blog/rtl-layouts-that-do-not-break'],
  ] as const) {
    test(`صورة مشاركة عربية تُولَّد لـ ${label}`, async ({ page, request }) => {
      await page.goto(`/ar${path}`)

      const url = await page
        .locator('meta[property="og:image"]')
        .first()
        .getAttribute('content')

      expect(url, 'وسم og:image مفقود').toBeTruthy()

      const response = await request.get(new URL(url as string).pathname + new URL(url as string).search)

      expect(response.status()).toBe(200)
      expect(response.headers()['content-type']).toContain('image/png')

      // صورة بلا خط تخرج شبه فارغة؛ الحجم المعقول دليل على رسم النص
      const body = await response.body()
      expect(body.byteLength).toBeGreaterThan(10_000)
    })
  }

  test('كل صفحة تحمل canonical و hreflang للغتين', async ({ page }) => {
    await page.goto('/ar/courses/react-professional')

    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
    await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveCount(1)
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1)
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1)
  })

  test('صفحة الدورة تصدّر بيانات Course المنظمة', async ({ page }) => {
    await page.goto('/ar/courses/react-professional')

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
    const types = blocks.flatMap((block) => {
      const parsed = JSON.parse(block)
      return (Array.isArray(parsed) ? parsed : [parsed]).map((item) => item['@type'])
    })

    expect(types).toContain('Course')
    expect(types).toContain('BreadcrumbList')
  })
})
