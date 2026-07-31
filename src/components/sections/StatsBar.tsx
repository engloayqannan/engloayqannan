'use client'

import { useEffect, useRef, useState } from 'react'

import type { Stat } from '@/lib/content/types'
import type { Locale } from '@/lib/i18n/config'
import { formatNumber } from '@/lib/utils/format'

/**
 * العدّاد يتحرك مرة واحدة عند الظهور، ويُعرض الرقم النهائي فوراً حين
 * يطلب المستخدم تقليل الحركة (SPEC §8.4).
 */
function useCountUp(target: number, enabled: boolean) {
  const [value, setValue] = useState(enabled ? 0 : target)

  useEffect(() => {
    if (!enabled) {
      setValue(target)
      return
    }

    let frame = 0
    const duration = 900
    const start = performance.now()

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))

      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, enabled])

  return value
}

function StatItem({ stat, locale, animate }: { stat: Stat; locale: Locale; animate: boolean }) {
  const value = useCountUp(stat.value, animate)

  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-accent" data-numeric>
        {formatNumber(value, locale)}
        {stat.suffix}
      </p>
      <p className="mt-1 text-2xs text-muted">{stat.label}</p>
    </div>
  )
}

export function StatsBar({ stats, locale }: { stats: Stat[]; locale: Locale }) {
  const ref = useRef<HTMLDivElement>(null)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !ref.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setAnimate(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  if (stats.length === 0) return null

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 gap-6 rounded-md border border-border bg-surface px-6 py-8 md:grid-cols-4"
    >
      {stats.map((stat) => (
        <StatItem key={stat.label} stat={stat} locale={locale} animate={animate} />
      ))}
    </div>
  )
}
