import Image from 'next/image'
import Link from 'next/link'

import { Badge, Card } from '@/components/ui/primitives'
import type { Testimonial } from '@/lib/content/types'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionary'
import { formatMonthYear, isVectorAsset } from '@/lib/utils/format'

/**
 * الرأي صورة من كلام المتدرّب. النص البديل إلزامي، والنص المفرّغ يُعرض
 * تحت الصورة ليكون المحتوى مقروءاً وقابلاً للبحث (SPEC §5.7).
 */
export function TestimonialCard({
  testimonial,
  locale,
  dictionary,
}: {
  testimonial: Testimonial
  locale: Locale
  dictionary: Dictionary
}) {
  const { screenshot } = testimonial

  return (
    <Card as="figure" className="break-inside-avoid overflow-hidden">
      <div className="bg-bg-elevated p-3">
        <Image
          src={screenshot.url}
          alt={screenshot.alt}
          width={screenshot.width ?? 720}
          height={screenshot.height ?? 320}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          unoptimized={isVectorAsset(screenshot.url)}
          className="h-auto w-full rounded-sm"
        />
      </div>

      <figcaption className="space-y-3 p-5">
        {testimonial.transcript && (
          <blockquote className="text-sm leading-relaxed text-fg">
            «{testimonial.transcript}»
          </blockquote>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <div>
            <p className="text-xs font-semibold">{testimonial.traineeName}</p>
            {testimonial.traineeTitle && (
              <p className="text-2xs text-muted">{testimonial.traineeTitle}</p>
            )}
          </div>

          {testimonial.date && (
            <time dateTime={testimonial.date} className="text-2xs text-muted">
              {formatMonthYear(testimonial.date, locale)}
            </time>
          )}
        </div>

        {(testimonial.courseTitle || testimonial.cohortLabel) && (
          <div className="flex flex-wrap items-center gap-2">
            {testimonial.courseTitle &&
              (testimonial.courseSlug ? (
                <Link href={`/${locale}/courses/${testimonial.courseSlug}`}>
                  <Badge tone="accent">{testimonial.courseTitle}</Badge>
                </Link>
              ) : (
                <Badge tone="accent">{testimonial.courseTitle}</Badge>
              ))}

            {testimonial.cohortLabel && (
              <Badge>
                {dictionary.testimonials.cohortLabel}: {testimonial.cohortLabel}
              </Badge>
            )}
          </div>
        )}
      </figcaption>
    </Card>
  )
}
