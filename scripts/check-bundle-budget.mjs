/**
 * ميزانية الحزمة الأولى (SPEC §10.1).
 *
 * يقرأ ما يحمّله كل مسار فعلياً من بيان البناء لا مجموع الملفات على
 * القرص. وُضع بعد انحدار حقيقي: استيراد من جذر `next-sanity` سحب مكوّنات
 * المعاينة المباشرة إلى المتصفح وأضاف ١٠٤ كيلوبايت مضغوطة إلى كل صفحة
 * دون أن يظهر ذلك في أي اختبار.
 */
import { gzipSync } from 'node:zlib'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const MANIFEST = join(ROOT, '.next', 'app-build-manifest.json')
/**
 * الأرضية المقيسة لهذا المكدّس نحو ١٠٧ كيلوبايت مضغوطة (React 19 مع
 * زمن تشغيل App Router)، وصفحتا النموذجين تضيفان نحو ٢٢ لأجل
 * react-hook-form و zod و resolvers — وهي كلفة مقصودة لأن نفس مخطط
 * التحقق يعمل على العميل والخادم فلا يتباعدان (SPEC §7.1).
 *
 * الرقم هنا مقيس لا مُتمنّى: رفعه يحتاج مبرراً مكتوباً، وخفضه يحتاج
 * إزالة كود فعلي.
 */
const BUDGET_KB = Number.parseInt(process.env.JS_BUDGET_KB ?? '135', 10)

if (!existsSync(MANIFEST)) {
  console.error('check-bundle-budget: no build output. Run `npm run build` first.')
  process.exit(1)
}

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'))
/**
 * الاستوديو أداة تحرير يستخدمها صاحب الموقع وحده، وله جذر تخطيط مستقل
 * لا يشارك الموقع منه شيئاً — فلا يدخل ميزانية الزوار.
 */
const isAdminRoute = (route) => route.includes('(studio)')

const routes = Object.fromEntries(
  Object.entries(manifest.pages ?? {}).filter(([route]) => !isAdminRoute(route)),
)

// polyfills تُحمَّل بشرط legacy فقط ولا تُحسب في ميزانية المتصفحات الحديثة
const isCounted = (file) => file.endsWith('.js') && !file.includes('polyfills')

function gzipKb(files) {
  const unique = Array.from(new Set(files)).filter(isCounted)

  const bytes = unique.reduce((total, file) => {
    const path = join(ROOT, '.next', file)
    if (!existsSync(path)) return total
    return total + gzipSync(readFileSync(path)).length
  }, 0)

  return bytes / 1024
}

const entries = Object.entries(routes)

if (entries.length === 0) {
  console.error('check-bundle-budget: manifest has no app routes — was the build complete?')
  process.exit(1)
}

const rows = []
let worst = 0

for (const [route, files] of entries) {
  const total = gzipKb(files)
  rows.push([route, total])
  if (total > worst) worst = total
}

rows.sort((a, b) => b[1] - a[1])

console.log(`first load JS, gzipped — ${rows.length} app routes`)
for (const [route, size] of rows.slice(0, 8)) {
  console.log(`  ${size.toFixed(1)} kB  ${route}`)
}

if (worst > BUDGET_KB) {
  console.error(
    `\ncheck-bundle-budget: heaviest first load is ${worst.toFixed(1)} kB gzipped, ` +
      `over the ${BUDGET_KB} kB budget.`,
  )
  process.exit(1)
}

console.log(`\ncheck-bundle-budget: within the ${BUDGET_KB} kB budget`)
