import type { Heading } from '@/lib/content/headings'
import { cn } from '@/lib/utils/format'

/**
 * جدول محتويات ثابت (خادمي) — لا حاجة لتتبّع موضع القراءة بجافاسكربت
 * على مقال، والروابط العميقة وحدها تفي بالغرض (SPEC §5.9).
 */
export function TableOfContents({
  headings,
  title,
}: {
  headings: Heading[]
  title: string
}) {
  if (headings.length === 0) return null

  return (
    <nav
      aria-labelledby="toc-title"
      className="rounded-md border border-border bg-surface p-5 lg:sticky lg:top-24"
    >
      <h2 id="toc-title" className="text-xs font-semibold text-muted">
        {title}
      </h2>

      <ol className="mt-3 space-y-2">
        {headings.map((heading) => (
          <li key={heading.id} className={cn(heading.level === 3 && 'ms-4')}>
            <a
              href={`#${heading.id}`}
              className="text-2xs text-muted transition-colors hover:text-accent"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
