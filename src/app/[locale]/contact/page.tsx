import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ContactForm } from '@/components/forms/ContactForm'
import { Card } from '@/components/ui/primitives'
import { getSiteSettings } from '@/lib/content'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { buildWhatsAppLink } from '@/lib/notifications/whatsapp'
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
    path: 'contact',
    title: dictionary.contact.title,
    description: dictionary.contact.subtitle,
    siteName: dictionary.meta.siteName,
  })
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()

  const locale = raw as Locale
  const dictionary = getDictionary(locale)
  const settings = await getSiteSettings(locale)

  const whatsappLink = buildWhatsAppLink(
    settings.whatsappNumber,
    locale === 'ar' ? 'مرحباً، لدي استفسار عن الدورات.' : 'Hello, I have a question about the courses.',
  )

  return (
    <div className="container-page py-16">
      <header className="max-w-2xl">
        <h1 className="text-3xl">{dictionary.contact.title}</h1>
        <p className="mt-3 text-muted">{dictionary.contact.subtitle}</p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_18rem] lg:items-start">
        <ContactForm locale={locale} dictionary={dictionary} />

        <Card className="p-6">
          <h2 className="text-lg">{dictionary.contact.directTitle}</h2>

          <ul className="mt-5 space-y-4 text-sm">
            <li>
              <a
                href={`mailto:${settings.email}`}
                dir="ltr"
                className="block text-accent hover:underline"
              >
                {settings.email}
              </a>
            </li>

            {whatsappLink && (
              <li>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  {dictionary.home.whatsappCta}
                </a>
              </li>
            )}

            {settings.socials.map((social) => (
              <li key={social.url}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-fg"
                >
                  {social.platform}
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-6 border-t border-border pt-4 text-2xs text-muted">
            {dictionary.contact.responseTime}
          </p>
        </Card>
      </div>
    </div>
  )
}
