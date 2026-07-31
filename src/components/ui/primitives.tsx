import type { ReactNode } from 'react'

import { cn } from '@/lib/utils/format'

export function Card({
  children,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'article' | 'li' | 'section' | 'figure'
}) {
  return (
    <Tag
      className={cn(
        'rounded-md border border-border bg-surface shadow-card transition-colors duration-150',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'border-border-strong bg-bg-elevated text-muted',
  accent: 'border-transparent bg-accent-soft text-accent',
  success: 'border-transparent bg-accent-soft text-success',
  warning: 'border-transparent bg-accent-soft text-warning',
  danger: 'border-transparent bg-accent-soft text-danger',
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-2xs font-semibold',
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Section({
  title,
  subtitle,
  action,
  children,
  className,
  id,
}: {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={cn('py-16 md:py-20', className)}>
      <div className="container-page">
        {(title || action) && (
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              {title && <h2 className="text-2xl">{title}</h2>}
              {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
            </div>
            {action}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-md border border-dashed border-border-strong bg-surface/50 px-6 py-14 text-center">
      <p className="text-lg font-semibold">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-md text-muted">{body}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}

export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'max-w-3xl space-y-4 leading-relaxed text-muted [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:text-fg [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:text-fg [&_strong]:text-fg',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function DefinitionRow({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border py-3 last:border-b-0">
      <dt className="text-xs text-muted">{term}</dt>
      <dd className="text-sm font-semibold">{children}</dd>
    </div>
  )
}
