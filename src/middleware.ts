import { NextResponse, type NextRequest } from 'next/server'

import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  isLocale,
  locales,
  matchLocale,
} from '@/lib/i18n/config'

const PUBLIC_FILE = /\.[^/]+$/

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // الاستوديو والـ API والملفات الثابتة خارج نظام اللغات
  if (
    pathname.startsWith('/studio') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  )

  if (hasLocale) {
    // نحفظ اللغة التي يتصفح بها فعلاً حتى تُحترم في الزيارة القادمة للجذر
    const current = pathname.split('/')[1]
    const response = NextResponse.next()

    if (isLocale(current) && request.cookies.get(LOCALE_COOKIE)?.value !== current) {
      response.cookies.set(LOCALE_COOKIE, current, {
        maxAge: LOCALE_COOKIE_MAX_AGE,
        path: '/',
        sameSite: 'lax',
      })
    }

    return response
  }

  // تفضيل المستخدم المحفوظ يسبق ترويسة المتصفح
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value
  const locale = isLocale(cookieLocale)
    ? cookieLocale
    : matchLocale(request.headers.get('accept-language'))

  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`

  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
