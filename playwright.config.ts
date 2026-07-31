import { defineConfig, devices } from '@playwright/test'

const PORT = 3100
const baseURL = `http://127.0.0.1:${PORT}`

/**
 * بعض البيئات توفّر Chromium مثبّتاً مسبقاً بإصدار لا يطابق ما تتوقعه
 * حزمة Playwright. `PLAYWRIGHT_CHROMIUM_PATH` يوجّه المشغّل للملف
 * التنفيذي الموجود بدل محاولة تنزيل نسخة جديدة.
 */
const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], launchOptions: { executablePath: chromiumPath } },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], launchOptions: { executablePath: chromiumPath } },
    },
  ],
  webServer: {
    // المصرف الاحتياطي يجعل تدفق التسجيل قابلاً للتشغيل بلا CMS ولا بريد
    command: `REGISTRATION_FALLBACK_SINK=1 RATE_LIMIT_MAX=200 npx next start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
