import { PortableText, type PortableTextComponents } from '@portabletext/react'

import type { RichText as RichTextValue } from '@/lib/content/types'

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-s-2 border-accent ps-4 italic">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc space-y-2 ps-6">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal space-y-2 ps-6">{children}</ol>,
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

export function RichText({ value }: { value: RichTextValue | null | undefined }) {
  if (!value || value.length === 0) return null

  return <PortableText value={value} components={components} />
}
