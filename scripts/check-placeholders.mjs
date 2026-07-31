/**
 * بوابة إطلاق: لا يُنشر الموقع على دومين فعلي وفيه محتوى تجريبي (SPEC §12).
 *
 * الفحص يجري على **مخرجات البناء** لا على الكود المصدري: المحتوى التجريبي
 * يُبنى من ثابت داخلي، فمسح النصوص في المصدر يمرّ دائماً ويعطي ضماناً
 * زائفاً. ما يهم هو ما يصل إلى الزائر فعلاً.
 *
 * يُشغَّل حين يكون NEXT_PUBLIC_SITE_URL دوميناً حقيقياً؛ وفي المعاينات
 * والتطوير يمرّ بلا اعتراض لأن المحتوى التجريبي هناك مقصود.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const MARKER = '[PLACEHOLDER]'
const ROOT = resolve(import.meta.dirname, '..')
const BUILD_DIR = join(ROOT, '.next', 'server', 'app')

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
const isProductionDomain =
  siteUrl.length > 0 && !siteUrl.includes('localhost') && !siteUrl.includes('vercel.app')

if (!isProductionDomain && process.env.FORCE_PLACEHOLDER_CHECK !== '1') {
  console.log(
    'check-placeholders: skipped — not a production domain. ' +
      'Set FORCE_PLACEHOLDER_CHECK=1 to run anyway.',
  )
  process.exit(0)
}

if (!existsSync(BUILD_DIR)) {
  console.error(
    'check-placeholders: no build output found. Run `npm run build` before this check —\n' +
      'the gate inspects rendered pages, not source code.',
  )
  process.exit(1)
}

const hits = []

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)

    if (statSync(full).isDirectory()) {
      walk(full)
      continue
    }

    if (!entry.endsWith('.html') && !entry.endsWith('.rsc')) continue

    if (readFileSync(full, 'utf8').includes(MARKER)) {
      hits.push(full.slice(ROOT.length + 1))
    }
  }
}

walk(BUILD_DIR)

if (hits.length > 0) {
  const unique = Array.from(new Set(hits)).sort()

  console.error(
    `check-placeholders: ${unique.length} rendered page(s) still contain ${MARKER} ` +
      `while targeting ${siteUrl}:`,
  )
  for (const hit of unique.slice(0, 25)) console.error(`  ${hit}`)
  if (unique.length > 25) console.error(`  … and ${unique.length - 25} more`)

  console.error(
    '\nReplace the placeholder content (see content/PLACEHOLDERS.md) before deploying to the live domain.',
  )
  process.exit(1)
}

console.log('check-placeholders: clean')
