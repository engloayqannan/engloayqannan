'use client'

import * as Dialog from '@radix-ui/react-dialog'
import Image from 'next/image'
import { useState } from 'react'

import { Badge, Card } from '@/components/ui/primitives'
import type { Certificate } from '@/lib/content/types'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionary'
import { formatDate, interpolate, isVectorAsset } from '@/lib/utils/format'

export function CertificateCard({
  certificate,
  locale,
  dictionary,
}: {
  certificate: Certificate
  locale: Locale
  dictionary: Dictionary
}) {
  const [open, setOpen] = useState(false)

  return (
    <Card as="li" className="flex h-full flex-col overflow-hidden">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button
            type="button"
            className="group block w-full bg-bg-elevated p-3 text-start"
            aria-label={`${dictionary.certificates.viewImage}: ${certificate.title}`}
          >
            <Image
              src={certificate.image.url}
              alt={certificate.image.alt}
              width={certificate.image.width ?? 800}
              height={certificate.image.height ?? 566}
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized={isVectorAsset(certificate.image.url)}
              className="h-auto w-full rounded-sm transition-transform duration-250 group-hover:scale-[1.02]"
            />
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
          <Dialog.Content className="fixed inset-4 z-50 flex flex-col items-center justify-center gap-4 focus:outline-none">
            <Dialog.Title className="sr-only">{certificate.title}</Dialog.Title>
            <Dialog.Description className="sr-only">{certificate.image.alt}</Dialog.Description>

            <Image
              src={certificate.image.url}
              alt={certificate.image.alt}
              width={certificate.image.width ?? 800}
              height={certificate.image.height ?? 566}
              unoptimized={isVectorAsset(certificate.image.url)}
              className="max-h-[80dvh] w-auto max-w-full rounded-md bg-white"
            />

            <Dialog.Close className="rounded-sm bg-surface px-4 py-2 text-xs font-semibold text-fg">
              {dictionary.common.close}
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

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
