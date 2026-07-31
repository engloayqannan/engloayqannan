import type { RichText } from './types'

export interface Heading {
  id: string
  text: string
  level: 2 | 3
}

/**
 * معرّف ثابت مشتق من نص العنوان. يدعم العربية: لا يعتمد على [a-z]
 * وإلا صارت كل عناوين المقالات العربية فارغة ثم متضاربة.
 */
export function slugifyHeading(text: string): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    // يُبقي الحروف والأرقام بأي أبجدية، ويحذف الترقيم فقط
    .replace(/[^\p{Letter}\p{Number}-]/gu, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')

  return base.length > 0 ? base : 'section'
}

function blockText(block: RichText[number]): string {
  return block.children
    .map((child) => child.text)
    .join('')
    .trim()
}

/**
 * يستخرج عناوين المقال لبناء جدول المحتويات، ويضمن تفرّد المعرّفات
 * حتى لو تكرر نص عنوانين.
 */
export function extractHeadings(value: RichText | null | undefined): Heading[] {
  if (!value) return []

  const seen = new Map<string, number>()
  const headings: Heading[] = []

  for (const block of value) {
    if (block._type !== 'block') continue
    if (block.style !== 'h2' && block.style !== 'h3') continue

    const text = blockText(block)
    if (text.length === 0) continue

    const base = slugifyHeading(text)
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)

    headings.push({
      id: count === 0 ? base : `${base}-${count + 1}`,
      text,
      level: block.style === 'h2' ? 2 : 3,
    })
  }

  return headings
}

/** جدول المحتويات يُعرض للمقالات الطويلة فقط (SPEC §5.9). */
export const TOC_MIN_HEADINGS = 3
