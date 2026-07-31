import Link from 'next/link'

import { CourseCard } from '@/components/courses/CourseCard'
import { Hero } from '@/components/sections/Hero'
import { StatsBar } from '@/components/sections/StatsBar'
import { TestimonialCard } from '@/components/testimonials/TestimonialCard'
import { Button } from '@/components/ui/Button'
import { Card, Section } from '@/components/ui/primitives'
import {
  getCertificates,
  getCourses,
  getPosts,
  getSiteSettings,
  getTeachingEngagements,
  getTestimonials,
} from '@/lib/content'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { formatDate } from '@/lib/utils/format'
import { notFound } from 'next/navigation'

export const revalidate = 3600

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()

  const locale = raw as Locale
  const dictionary = getDictionary(locale)

  const [settings, courses, certificates, testimonials, teaching, posts] = await Promise.all([
    getSiteSettings(locale),
    getCourses(locale),
    getCertificates(locale),
    getTestimonials(locale),
    getTeachingEngagements(locale),
    getPosts(locale),
  ])

  const featuredCourses = (courses.filter((course) => course.featured).length > 0
    ? courses.filter((course) => course.featured)
    : courses
  ).slice(0, 3)

  const featuredTestimonials = (testimonials.filter((item) => item.featured).length > 0
    ? testimonials.filter((item) => item.featured)
    : testimonials
  ).slice(0, 3)

  return (
    <>
      <Hero settings={settings} locale={locale} dictionary={dictionary} />

      <div className="container-page -mt-8 md:-mt-10">
        <StatsBar stats={settings.stats} locale={locale} />
      </div>

      <Section
        title={dictionary.home.featuredCourses}
        subtitle={dictionary.home.featuredCoursesSubtitle}
        action={
          <Button href={`/${locale}/courses`} variant="secondary" size="sm">
            {dictionary.common.viewAll}
          </Button>
        }
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              locale={locale}
              dictionary={dictionary}
            />
          ))}
        </div>
      </Section>

      {settings.approach.length > 0 && (
        <Section title={dictionary.home.approachTitle} className="bg-bg-elevated">
          <div className="grid gap-6 md:grid-cols-2">
            {settings.approach.map((item) => (
              <Card key={item.title} className="p-6">
                <h3 className="text-lg">{item.title}</h3>
                <p className="mt-3 text-sm text-muted">{item.body}</p>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {certificates.length > 0 && (
        <Section
          title={dictionary.home.certificatesTitle}
          action={
            <Button href={`/${locale}/certificates`} variant="secondary" size="sm">
              {dictionary.common.viewAll}
            </Button>
          }
        >
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {certificates.slice(0, 4).map((certificate) => (
              <Card as="li" key={certificate.id} className="p-5">
                <p className="text-sm font-semibold">{certificate.title}</p>
                <p className="mt-2 text-2xs text-muted">{certificate.issuer}</p>
                <time dateTime={certificate.issueDate} className="mt-1 block text-2xs text-muted">
                  {formatDate(certificate.issueDate, locale)}
                </time>
              </Card>
            ))}
          </ul>
        </Section>
      )}

      {featuredTestimonials.length > 0 && (
        <Section
          title={dictionary.home.testimonialsTitle}
          className="bg-bg-elevated"
          action={
            <Button href={`/${locale}/testimonials`} variant="secondary" size="sm">
              {dictionary.common.viewAll}
            </Button>
          }
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredTestimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                locale={locale}
                dictionary={dictionary}
              />
            ))}
          </div>
        </Section>
      )}

      {teaching.length > 0 && (
        <Section
          title={dictionary.home.teachingTitle}
          action={
            <Button href={`/${locale}/teaching`} variant="secondary" size="sm">
              {dictionary.common.viewAll}
            </Button>
          }
        >
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teaching.slice(0, 3).map((engagement) => (
              <Card as="li" key={engagement.id} className="p-5">
                <p className="text-sm font-semibold">{engagement.institution}</p>
                <p className="mt-2 text-2xs text-muted">{engagement.role}</p>
              </Card>
            ))}
          </ul>
        </Section>
      )}

      {posts.length > 0 && (
        <Section
          title={dictionary.home.blogTitle}
          className="bg-bg-elevated"
          action={
            <Button href={`/${locale}/blog`} variant="secondary" size="sm">
              {dictionary.common.viewAll}
            </Button>
          }
        >
          <div className="grid gap-6 md:grid-cols-3">
            {posts.slice(0, 3).map((post) => (
              <Card key={post.id} className="relative p-6">
                <time dateTime={post.publishedAt} className="text-2xs text-muted">
                  {formatDate(post.publishedAt, locale)}
                </time>
                <h3 className="mt-3 text-lg">
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="after:absolute after:inset-0 hover:text-accent"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-3 text-sm text-muted">{post.excerpt}</p>
              </Card>
            ))}
          </div>
        </Section>
      )}

      <Section>
        <Card className="flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-xl">{dictionary.home.finalCtaTitle}</h2>
            <p className="mt-2 text-sm text-muted">{dictionary.home.finalCtaBody}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href={`/${locale}/courses`}>{dictionary.home.heroCtaPrimary}</Button>
            <Button href={`/${locale}/contact`} variant="secondary">
              {dictionary.home.heroCtaSecondary}
            </Button>
          </div>
        </Card>
      </Section>
    </>
  )
}
