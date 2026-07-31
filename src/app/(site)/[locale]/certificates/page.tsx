import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CertificateCard } from '@/components/certificates/CertificateCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { EmptyState } from '@/components/ui/primitives'
import { getCertificates } from '@/lib/content'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { credentialSchema } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: raw } = await params
  if (!isLocale(raw)) return {}

  const locale = raw as Locale
  const dictionary = getDictionary(locale)

  return buildMetadata({
    locale,
    path: 'certificates',
    title: dictionary.certificates.title,
    description: dictionary.certificates.subtitle,
    siteName: dictionary.meta.siteName,
  })
}

export default async function CertificatesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()

  const locale = raw as Locale
  const dictionary = getDictionary(locale)
  const certificates = await getCertificates(locale)

  return (
    <div className="container-page py-16">
      <header className="max-w-2xl">
        <h1 className="text-3xl">{dictionary.certificates.title}</h1>
        <p className="mt-3 text-muted">{dictionary.certificates.subtitle}</p>
      </header>

      <div className="mt-10">
        {certificates.length === 0 ? (
          <EmptyState title={dictionary.certificates.empty} />
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((certificate) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                locale={locale}
                dictionary={dictionary}
              />
            ))}
          </ul>
        )}
      </div>

      <JsonLd
        data={certificates.map((certificate) => credentialSchema(certificate, locale))}
      />
    </div>
  )
}
