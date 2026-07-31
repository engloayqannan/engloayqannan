import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { ReactNode } from 'react'

import { CodeBlock } from '@/components/ui/CodeBlock'
import { slugifyHeading } from '@/lib/content/headings'
import type { RichText as RichTextValue } from '@/lib/content/types'

function headingText(children: ReactNode): string {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(headingText).join('')
  if (children && typeof children === 'object' && 'props' in children) {
    return headingText((children as { props: { children?: ReactNode } }).props.children)
  }
  return ''
}

/**
 * العناوين تحمل معرّفات مشتقة من نصّها ليعمل جدول المحتويات والروابط
 * العميقة — والمعرّف يدعم العربية (SPEC §5.9).
 */
function buildComponents(labels: { copy: string; copied: string }): PortableTextComponents {
  return {
    block: {
      normal: ({ children }) => <p>{children}</p>,
      h2: ({ children }) => <h2 id={slugifyHeading(headingText(children))}>{children}</h2>,
      h3: ({ children }) => <h3 id={slugifyHeading(headingText(children))}>{children}</h3>,
      blockquote: ({ children }) => (
        <blockquote className="border-s-2 border-accent ps-4 italic">{children}</blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => <ul className="list-disc space-y-2 ps-6">{children}</ul>,
      number: ({ children }) => <ol className="list-decimal space-y-2 ps-6">{children}</ol>,
    },
    types: {
      code: ({ value }) => {
        const block = value as { code?: string; language?: string }
        if (!block?.code) return null

        return (
          <CodeBlock
            code={block.code}
            language={block.language}
            copyLabel={labels.copy}
            copiedLabel={labels.copied}
          />
        )
      },
    },
    marks: {
      // مقتطفات الكود تبقى LTR حتى داخل فقرة عربية (SPEC §4.2)
      code: ({ children }) => (
        <code className="rounded-sm bg-bg-elevated px-1.5 py-0.5 text-xs text-accent">
          {children}
        </code>
      ),
      link: ({ children, value }) => {
        const href = (value as { href?: string } | undefined)?.href ?? '#'
        const isExternal = href.startsWith('http')

        return (
          <a
            href={href}
            className="text-accent underline underline-offset-4"
            {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {children}
          </a>
        )
      },
    },
  }
}

export function RichText({
  value,
  copyLabel = 'Copy',
  copiedLabel = 'Copied',
}: {
  value: RichTextValue | null | undefined
  copyLabel?: string
  copiedLabel?: string
}) {
  if (!value || value.length === 0) return null

  return (
    <PortableText
      value={value}
      components={buildComponents({ copy: copyLabel, copied: copiedLabel })}
    />
  )
}
