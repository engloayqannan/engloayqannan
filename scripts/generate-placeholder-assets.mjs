/**
 * يولّد لقطات آراء تجريبية بصيغة SVG لاختبار التخطيط قبل توفر الصور الحقيقية.
 * تُستبدل كلها بصور فعلية من Sanity قبل الإطلاق (SPEC §12).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, '../public/placeholder')

const testimonials = [
  {
    file: 'testimonial-1.svg',
    name: 'سارة م.',
    lines: [
      'الدورة غيّرت طريقة تفكيري بالكامل.',
      'أول مرة أفهم الـ rendering لماذا يعمل',
      'هكذا وليس فقط كيف أكتبه.',
    ],
  },
  {
    file: 'testimonial-2.svg',
    name: 'Omar K.',
    lines: [
      'Best training I have attended in years.',
      'The performance module alone paid for',
      'itself in the first sprint back at work.',
    ],
  },
  {
    file: 'testimonial-3.svg',
    name: 'ليلى ح.',
    lines: [
      'التطبيق العملي كان أقوى جزء.',
      'خرجنا بمشروع كامل على GitHub',
      'وليس بشرائح عرض فقط.',
    ],
  },
  {
    file: 'testimonial-4.svg',
    name: 'Yousef A.',
    lines: [
      'Clear explanations, zero fluff.',
      'He answered every question, including',
      'the ones I was embarrassed to ask.',
    ],
  },
  {
    file: 'testimonial-5.svg',
    name: 'نور ع.',
    lines: [
      'حصلت على وظيفة بعد شهرين من الدورة.',
      'التدريب على مقابلات العمل كان',
      'إضافة لم أتوقعها.',
    ],
  },
]

const escape = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function buildSvg({ name, lines }) {
  const width = 720
  const lineHeight = 34
  const height = 150 + lines.length * lineHeight

  const body = lines
    .map(
      (line, index) =>
        `    <text x="40" y="${132 + index * lineHeight}" font-size="21" fill="#0b0f14" font-family="system-ui, sans-serif">${escape(line)}</text>`,
    )
    .join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
  <rect width="${width}" height="${height}" rx="20" fill="#e9f3ec"/>
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="16" fill="#ffffff"/>
  <circle cx="56" cy="66" r="18" fill="#22d3ee" opacity="0.25"/>
  <text x="86" y="73" font-size="19" font-weight="600" fill="#0b0f14" font-family="system-ui, sans-serif">${escape(name)}</text>
${body}
  <text x="40" y="${height - 40}" font-size="15" fill="#55606e" font-family="system-ui, sans-serif">[PLACEHOLDER] sample screenshot</text>
</svg>
`
}

mkdirSync(outDir, { recursive: true })

for (const testimonial of testimonials) {
  writeFileSync(resolve(outDir, testimonial.file), buildSvg(testimonial), 'utf8')
}

writeFileSync(
  resolve(outDir, 'certificate.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="566" viewBox="0 0 800 566" role="img">
  <rect width="800" height="566" fill="#f6f8fa"/>
  <rect x="28" y="28" width="744" height="510" fill="#ffffff" stroke="#d8dee6" stroke-width="2"/>
  <rect x="60" y="60" width="680" height="446" fill="none" stroke="#0891b2" stroke-width="3"/>
  <text x="400" y="200" text-anchor="middle" font-size="34" font-weight="700" fill="#0b0f14" font-family="system-ui, sans-serif">CERTIFICATE</text>
  <text x="400" y="250" text-anchor="middle" font-size="20" fill="#55606e" font-family="system-ui, sans-serif">[PLACEHOLDER] certificate image</text>
  <line x1="240" y1="380" x2="560" y2="380" stroke="#d8dee6" stroke-width="2"/>
  <text x="400" y="412" text-anchor="middle" font-size="16" fill="#55606e" font-family="system-ui, sans-serif">Issuing body</text>
</svg>
`,
  'utf8',
)

writeFileSync(
  resolve(outDir, 'avatar.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480" role="img">
  <rect width="480" height="480" fill="#161e29"/>
  <circle cx="240" cy="190" r="78" fill="#22d3ee" opacity="0.3"/>
  <path d="M96 452c0-79 64-143 144-143s144 64 144 143z" fill="#22d3ee" opacity="0.22"/>
  <text x="240" y="466" text-anchor="middle" font-size="18" fill="#93a4b5" font-family="system-ui, sans-serif">[PLACEHOLDER] photo</text>
</svg>
`,
  'utf8',
)

console.log(`generated ${testimonials.length + 2} placeholder assets in public/placeholder`)
