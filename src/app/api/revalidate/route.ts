import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'

export const runtime = 'nodejs'

const KNOWN_TAGS = new Set([
  'siteSettings',
  'course',
  'cohort',
  'certificate',
  'testimonial',
  'teachingEngagement',
  'post',
])

function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false

  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false

  return timingSafeEqual(a, b)
}

/**
 * webhook من Sanity لإبطال الكاش فور نشر تعديل (SPEC §13.3).
 * محمي بسرّ مشترك ويُقارن بزمن ثابت (SPEC §11).
 */
export async function POST(request: Request) {
  const expected = process.env.SANITY_REVALIDATE_SECRET

  if (!expected) {
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 501 })
  }

  const provided =
    request.headers.get('x-revalidate-secret') ??
    new URL(request.url).searchParams.get('secret')

  if (!secretMatches(provided, expected)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  let type: string | undefined

  try {
    const body = (await request.json()) as { _type?: string }
    type = body._type
  } catch {
    // Sanity قد يرسل جسماً فارغاً — نبطل كل الوسوم المعروفة عندها
  }

  const tags = type && KNOWN_TAGS.has(type) ? [type] : Array.from(KNOWN_TAGS)
  for (const tag of tags) revalidateTag(tag)

  return NextResponse.json({ ok: true, revalidated: tags })
}
