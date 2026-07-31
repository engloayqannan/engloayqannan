import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

import '@/styles/globals.css'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { themeInitScript } from '@/components/layout/ThemeToggle'
import { JsonLd } from '@/components/seo/JsonLd'
import { getPosts, getSiteSettings } from '@/lib/content'
import { fontVariables } from '@/lib/fonts'
import { getDirection, isLocale, locales, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { buildNavigation } from '@/lib/navigation'
import { personSchema, websiteSchema } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: raw } = await params
  if (!isLocale(raw)) return {}

  const locale = raw as Locale
  const dictionary = getDictionary(locale)
  const settings = await getSiteSettings(locale)

  return {
    ...buildMetadata({
      locale,
      title: `${settings.fullName} — ${dictionary.meta.siteName}`,
      description: settings.shortBio || dictionary.meta.defaultDescription,
      siteName: dictionary.meta.siteName,
    }),
    title: {
      default: `${settings.fullName} — ${dictionary.meta.siteName}`,
      template: `%s — ${settings.fullName}`,
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()

  const locale = raw as Locale
  const dictionary = getDictionary(locale)
  const [settings, posts] = await Promise.all([getSiteSettings(locale), getPosts(locale)])
  const navItems = buildNavigation(locale, dictionary, { hasPosts: posts.length > 0 })

  return (
    <html lang={locale} dir={getDirection(locale)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${fontVariables} flex min-h-dvh flex-col`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:start-3 focus:z-50 focus:rounded-sm focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-contrast"
        >
          {dictionary.nav.skipToContent}
        </a>

        <Header
          locale={locale}
          brand={settings.fullName}
          items={navItems}
          labels={{
            openMenu: dictionary.nav.openMenu,
            closeMenu: dictionary.nav.closeMenu,
            mainNavigation: dictionary.nav.mainNavigation,
            themeToggle: dictionary.theme.toggle,
            localeSwitch: dictionary.locale.switchTo,
          }}
        />

        <main id="main" className="flex-1">
          {children}
        </main>

        <Footer
          locale={locale}
          brand={settings.fullName}
          tagline={settings.headline}
          socials={settings.socials}
          navItems={navItems}
          labels={{ rights: dictionary.footer.rights, privacy: dictionary.footer.privacy }}
        />

        <JsonLd
          data={[
            websiteSchema(settings, locale, dictionary.meta.siteName),
            personSchema(settings, locale),
          ]}
        />

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
