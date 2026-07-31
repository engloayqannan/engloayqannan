import { expect, test } from '@playwright/test'

/**
 * المسارات الحرجة من SPEC §13.1. تُشغَّل على بناء الإنتاج بلا Sanity،
 * أي على المحتوى التجريبي — وهو ما يجعلها قابلة للتشغيل في CI بلا أسرار.
 */

const OPEN_COURSE = 'react-professional'
const FULL_COURSE = 'typescript-in-depth'

test.describe('التسجيل', () => {
  test('زر التسجيل في صفحة الدورة يفتح النموذج على الدفعة الصحيحة', async ({ page }) => {
    await page.goto(`/ar/courses/${OPEN_COURSE}`)

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar')

    const register = page.getByRole('link', { name: 'سجّل الآن' }).first()
    const href = await register.getAttribute('href')
    await register.click()

    await expect(page).toHaveURL(/\/ar\/courses\/.*\/register/)
    await expect(page.getByRole('button', { name: 'أرسل طلب التسجيل' })).toBeVisible()

    // الدفعة المطلوبة في الرابط تُختار مسبقاً في النموذج
    const requested = href?.match(/cohort=([^&]+)/)?.[1]
    if (requested) {
      await expect(page.getByLabel('الدفعة', { exact: true })).toHaveValue(requested)
    }
  })

  test('تسجيل ناجح بالعربية حتى صفحة النجاح', async ({ page }) => {
    await page.goto(`/ar/courses/${OPEN_COURSE}/register`)

    await page.getByLabel('الاسم الكامل').fill('سارة محمد')
    await page.getByLabel('البريد الإلكتروني', { exact: true }).fill('sara@example.com')
    await page.getByLabel('رقم الهاتف / الواتساب').fill('+962791234567')
    await page.getByText(/أوافق على استلام/).click()

    await page.getByRole('button', { name: 'أرسل طلب التسجيل' }).click()

    await expect(page.getByTestId('registration-success')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('heading', { name: 'تم استلام طلبك' })).toBeVisible()
  })

  test('تسجيل ناجح بالإنجليزية', async ({ page }) => {
    await page.goto(`/en/courses/${OPEN_COURSE}/register`)

    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')

    await page.getByLabel('Full name').fill('Omar Khaled')
    await page.getByLabel('Email address', { exact: true }).fill('omar@example.com')
    await page.getByLabel('Phone / WhatsApp number').fill('+962791234567')
    await page.getByText(/I agree to receive/).click()

    await page.getByRole('button', { name: 'Submit registration' }).click()

    await expect(page.getByTestId('registration-success')).toBeVisible({ timeout: 15_000 })
  })

  test('لا يعرض النموذج دفعة ممتلئة أصلاً', async ({ page }) => {
    await page.goto(`/ar/courses/${FULL_COURSE}/register`)

    // الدفعة الوحيدة لهذه الدورة مقاعدها صفر، فلا يُعرض نموذج تسجيل
    await expect(page.getByRole('button', { name: 'أرسل طلب التسجيل' })).toHaveCount(0)
  })

  test('يرفض الخادم التسجيل على دفعة ممتلئة', async ({ request }) => {
    const response = await request.post('/api/register', {
      data: {
        fullName: 'سارة محمد',
        email: 'sara@example.com',
        phone: '+962791234567',
        courseSlug: FULL_COURSE,
        cohortId: 'cohort-typescript-1',
        preferredMode: 'online',
        experienceLevel: 'beginner',
        registrationType: 'individual',
        consent: true,
        locale: 'ar',
      },
    })

    expect(response.status()).toBe(409)
    expect((await response.json()).code).toBe('cohort_unavailable')
  })

  test('ينجح التسجيل رغم تعطّل إشعار الواتساب', async ({ request }) => {
    // إعدادات Meta غير مضبوطة في CI، أي أن قناة الواتساب متعطّلة فعلياً.
    // ومع ذلك يجب أن يعود التسجيل ناجحاً (SPEC §7.3 قاعدة ١).
    const response = await request.post('/api/register', {
      data: {
        fullName: 'ليلى حسن',
        email: `layla-${Date.now()}@example.com`,
        phone: '+962791234599',
        courseSlug: OPEN_COURSE,
        cohortId: 'cohort-react-1',
        preferredMode: 'online',
        experienceLevel: 'beginner',
        registrationType: 'individual',
        consent: true,
        locale: 'ar',
      },
    })

    expect(response.ok()).toBe(true)

    const body = await response.json()
    expect(body.ok).toBe(true)
    expect(body.whatsappSent).toBe(false)
  })

  test('يرفض الخادم طلباً ناقص التحقق برسائل مترجمة', async ({ request }) => {
    const response = await request.post('/api/register', {
      data: {
        fullName: 'ا',
        email: 'not-an-email',
        phone: '0791234567',
        courseSlug: OPEN_COURSE,
        cohortId: 'cohort-react-1',
        preferredMode: 'online',
        experienceLevel: 'beginner',
        registrationType: 'individual',
        consent: true,
        locale: 'ar',
      },
    })

    expect(response.status()).toBe(400)

    const body = await response.json()
    expect(body.code).toBe('invalid')
    expect(body.fieldErrors.email).toBeTruthy()
    expect(body.fieldErrors.phone).toBeTruthy()
  })
})
