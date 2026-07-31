import Link from 'next/link'

import type { SocialLink } from '@/lib/content/types'
import type { Locale } from '@/lib/i18n/config'

const socialLabels: Record<SocialLink['platform'], string> = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  youtube: 'YouTube',
  x: 'X',
  website: 'Website',
}

interface FooterProps {
  locale: Locale
  brand: string
  tagline: string
  socials: SocialLink[]
  navItems: { href: string; label: string }[]
  labels: { rights: string; privacy: string }
}

export function Footer({ locale, brand, tagline, socials, navItems, labels }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-bg-elevated">
      <div className="container-page grid gap-10 py-12 md:grid-cols-3">
        <div>
          <p className="text-sm font-bold">{brand}</p>
          <p className="mt-2 max-w-xs text-xs text-muted">{tagline}</p>
        </div>

        <nav aria-label={brand}>
          <ul className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-xs text-muted hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <ul className="flex flex-wrap gap-3">
            {socials.map((social) => (
              <li key={social.url}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm border border-border px-3 py-2 text-2xs text-muted transition-colors hover:bg-surface hover:text-fg"
                >
                  {socialLabels[social.platform]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-5 text-2xs text-muted">
          <p>
            <span data-numeric>{year}</span> © {brand} — {labels.rights}
          </p>
          <Link href={`/${locale}/privacy`} className="hover:text-fg">
            {labels.privacy}
          </Link>
        </div>
      </div>
    </footer>
  )
}
