'use client'

import { useCallback, useState } from 'react'

/**
 * مقتطف الكود يبقى LTR دائماً حتى داخل مقال عربي (SPEC §4.2)،
 * ويُمرَّر كنص خام بلا تمييز صياغي: مكتبة التمييز تكلّف أضعاف ما تضيفه
 * على مدونة صغيرة، والقراءة مضمونة بالخط الأحادي والتباين وحدهما.
 */
export function CodeBlock({
  code,
  language,
  copyLabel,
  copiedLabel,
}: {
  code: string
  language?: string
  copyLabel: string
  copiedLabel: string
}) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // الحافظة محظورة في بعض السياقات — النص يبقى قابلاً للتحديد يدوياً
    }
  }, [code])

  return (
    <div className="relative overflow-hidden rounded-md border border-border bg-bg-elevated">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="font-mono text-2xs text-muted">{language ?? 'code'}</span>

        <button
          type="button"
          onClick={copy}
          className="rounded-sm px-2 py-1 text-2xs font-semibold text-muted transition-colors hover:bg-surface hover:text-fg"
        >
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>

      <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
        <code>{code}</code>
      </pre>

      {/* إعلان نتيجة النسخ لقارئات الشاشة دون نقل التركيز */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ''}
      </span>
    </div>
  )
}
