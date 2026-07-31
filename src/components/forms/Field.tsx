'use client'

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils/format'

const controlClasses =
  'w-full rounded-sm border border-border bg-bg-elevated px-3 py-2.5 text-sm text-fg placeholder:text-muted focus-visible:border-accent'

export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: (props: {
    id: string
    'aria-describedby': string | undefined
    'aria-invalid': boolean | undefined
    className: string
  }) => ReactNode
}) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="space-y-1.5">
      {/* علامة الحقل المطلوب تأتي من CSS لا من DOM: إبقاؤها خارج نص
          التسمية يحفظ الاسم المتاح نظيفاً لقارئات الشاشة وللمحدّدات */}
      <label
        htmlFor={id}
        className={cn('block text-xs font-semibold', required && 'label-required')}
      >
        {label}
      </label>

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        className: cn(controlClasses, error && 'border-danger'),
      })}

      {hint && (
        <p id={hintId} className="text-2xs text-muted">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-2xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
