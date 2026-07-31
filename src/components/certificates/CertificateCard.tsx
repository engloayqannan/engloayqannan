import { Badge, Card } from '@/components/ui/primitives'
import type { Certificate } from '@/lib/content/types'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionary'
import { formatDate, interpolate } from '@/lib/utils/format'

import { CertificateLightbox } from './CertificateLightbox'

/**
 * البطاقة نفسها مكوّن خادم — الجزء التفاعلي الوحيد هو عارض الصورة.
 */
export function CertificateCard({
  certificate,
  locale,
  dictionary,
}: {
  certificate: Certificate
  locale: Locale
  dictionary: Dictionary
}) {
  return (
    <Card as="li" className="flex h-full flex-col overflow-hidden">
      <CertificateLightbox
        image={certificate.image}
        title={certificate.title}
        triggerLabel={dictionary.certificates.viewImage}
        closeLabel={dictionary.common.close}
      />

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold">{certificate.title}</h3>
          <Badge>{dictionary.certificates.category[certificate.category]}</Badge>
        </div>

        <dl className="space-y-1 text-2xs text-muted">
          <div className="flex gap-2">
            <dt>{dictionary.certificates.issuer}:</dt>
            <dd className="font-medium text-fg">{certificate.issuer}</dd>
          </div>
          <div className="flex gap-2">
            <dt>{dictionary.certificates.issued}:</dt>
            <dd>
              <time dateTime={certificate.issueDate}>
                {formatDate(certificate.issueDate, locale)}
              </time>
            </dd>
          </div>
          {certificate.expiryDate && (
            <div className="flex gap-2">
              <dt>{dictionary.certificates.expires}:</dt>
              <dd>
                <time dateTime={certificate.expiryDate}>
                  {formatDate(certificate.expiryDate, locale)}
                </time>
              </dd>
            </div>
          )}
          {certificate.credentialId && (
            <div className="flex gap-2">
              <dt>{dictionary.certificates.credentialId}:</dt>
              <dd dir="ltr" className="font-mono">
                {certificate.credentialId}
              </dd>
            </div>
          )}
        </dl>

        {certificate.verificationUrl && (
          <a
            href={certificate.verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={interpolate(dictionary.certificates.verifyAria, {
              title: certificate.title,
            })}
            className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
          >
            {dictionary.certificates.verify}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M14 5h5v5M19 5l-8 8M18 14v5H5V6h5" strokeLinecap="round" />
            </svg>
          </a>
        )}
      </div>
    </Card>
  )
}
