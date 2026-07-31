/**
 * استعلامات GROQ. الحقول المعرَّبة تُستخرج بـ coalesce حتى تسقط
 * الوثيقة للعربية عند غياب الترجمة الإنجليزية بدل أن تعود فارغة.
 */

const localized = (field: string) => `"${field}": coalesce(${field}[$locale], ${field}.ar)`

const imageFields = (field: string, altField: string) =>
  `"${field}": {"asset": ${field}.asset, "alt": coalesce(${altField}[$locale], ${altField}.ar)}`

export const siteSettingsQuery = /* groq */ `
*[_type == "siteSettings"][0]{
  ${localized('fullName')},
  ${localized('headline')},
  ${localized('shortBio')},
  "longBio": coalesce(longBio[$locale], longBio.ar),
  ${imageFields('avatar', 'avatar.alt')},
  "cvUrl": select($locale == "en" => cvEn.asset->url, cvAr.asset->url),
  email,
  whatsappNumber,
  socials[]{platform, url},
  stats[]{"label": coalesce(label[$locale], label.ar), value, suffix},
  approach[]{"title": coalesce(title[$locale], title.ar), "body": coalesce(body[$locale], body.ar)},
  timeline[]{
    "period": coalesce(period[$locale], period.ar),
    "title": coalesce(title[$locale], title.ar),
    "organisation": coalesce(organisation[$locale], organisation.ar),
    "body": coalesce(body[$locale], body.ar)
  }
}`

const courseProjection = /* groq */ `
  "id": _id,
  "slug": slug.current,
  ${localized('title')},
  ${localized('summary')},
  "description": coalesce(description[$locale], description.ar),
  level,
  durationHours,
  sessionsCount,
  language,
  "prerequisites": prerequisites[]{"value": coalesce(@[$locale], @.ar)}.value,
  "outcomes": outcomes[]{"value": coalesce(@[$locale], @.ar)}.value,
  syllabus[]{
    "title": coalesce(moduleTitle[$locale], moduleTitle.ar),
    "topics": topics[]{"value": coalesce(@[$locale], @.ar)}.value,
    hours
  },
  modes,
  "locations": cities[]{"city": coalesce(city[$locale], city.ar), country},
  ${imageFields('coverImage', 'coverImage.alt')},
  technologies,
  priceIndividual,
  corporate,
  faqs[]{
    "question": coalesce(q[$locale], q.ar),
    "answer": coalesce(a[$locale], a.ar)
  },
  featured,
  order
`

export const coursesQuery = /* groq */ `
*[_type == "course" && defined(slug.current)] | order(order asc){
  ${courseProjection},
  "cohorts": *[_type == "cohort" && references(^._id)] | order(startDate asc){
    "id": _id,
    "courseSlug": ^.slug.current,
    startDate,
    endDate,
    timezone,
    "schedule": coalesce(schedule[$locale], schedule.ar),
    mode,
    "city": coalesce(city[$locale], city.ar),
    capacity,
    seatsRemaining,
    registrationDeadline,
    "declaredStatus": status,
    "price": priceOverride
  }
}`

export const courseBySlugQuery = /* groq */ `
*[_type == "course" && slug.current == $slug][0]{
  ${courseProjection},
  "cohorts": *[_type == "cohort" && references(^._id)] | order(startDate asc){
    "id": _id,
    "courseSlug": ^.slug.current,
    startDate,
    endDate,
    timezone,
    "schedule": coalesce(schedule[$locale], schedule.ar),
    mode,
    "city": coalesce(city[$locale], city.ar),
    capacity,
    seatsRemaining,
    registrationDeadline,
    "declaredStatus": status,
    "price": priceOverride
  }
}`

export const courseSlugsQuery = /* groq */ `
*[_type == "course" && defined(slug.current)].slug.current`

export const certificatesQuery = /* groq */ `
*[_type == "certificate"] | order(order asc){
  "id": _id,
  ${localized('title')},
  ${localized('issuer')},
  issueDate,
  expiryDate,
  credentialId,
  verificationUrl,
  ${imageFields('image', 'image.alt')},
  category,
  order
}`

export const testimonialsQuery = /* groq */ `
*[_type == "testimonial" && consentGiven == true] | order(date desc){
  "id": _id,
  ${imageFields('screenshot', 'altText')},
  "transcript": coalesce(transcript[$locale], transcript.ar),
  traineeName,
  "traineeTitle": coalesce(traineeTitle[$locale], traineeTitle.ar),
  "courseSlug": course->slug.current,
  "courseTitle": coalesce(course->title[$locale], course->title.ar),
  cohortLabel,
  date,
  featured
}`

export const teachingQuery = /* groq */ `
*[_type == "teachingEngagement"] | order(order asc){
  "id": _id,
  ${localized('institution')},
  ${imageFields('logo', 'logo.alt')},
  ${localized('role')},
  "coursesTaught": coursesTaught[]{"value": coalesce(@[$locale], @.ar)}.value,
  startDate,
  endDate,
  ${localized('city')},
  country,
  ${localized('description')},
  order
}`

export const postsQuery = /* groq */ `
*[_type == "post" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc){
  "id": _id,
  "slug": slug.current,
  ${localized('title')},
  ${localized('excerpt')},
  "body": coalesce(body[$locale], body.ar),
  ${imageFields('coverImage', 'coverImage.alt')},
  tags,
  publishedAt,
  readingTime
}`

export const postBySlugQuery = /* groq */ `
*[_type == "post" && slug.current == $slug][0]{
  "id": _id,
  "slug": slug.current,
  ${localized('title')},
  ${localized('excerpt')},
  "body": coalesce(body[$locale], body.ar),
  ${imageFields('coverImage', 'coverImage.alt')},
  tags,
  publishedAt,
  readingTime
}`

export const postSlugsQuery = /* groq */ `
*[_type == "post" && defined(slug.current)].slug.current`
