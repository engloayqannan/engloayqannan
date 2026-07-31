import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Prose } from '@/components/ui/primitives'
import { getSiteSettings } from '@/lib/content'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { buildMetadata } from '@/lib/seo/metadata'

export const revalidate = 86400

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
    path: 'privacy',
    title: dictionary.footer.privacy,
    description: dictionary.meta.defaultDescription,
    siteName: dictionary.meta.siteName,
  })
}

/**
 * سياسة خصوصية موجزة تشرح ما يُجمع ولماذا ومدة الاحتفاظ وكيفية
 * طلب الحذف (SPEC §11). النص هنا صياغة أولية تحتاج مراجعة قانونية
 * قبل الإطلاق على دومين فعلي.
 */
export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()

  const locale = raw as Locale
  const dictionary = getDictionary(locale)
  const settings = await getSiteSettings(locale)

  const sections =
    locale === 'ar'
      ? [
          {
            title: 'ما البيانات التي نجمعها',
            body: 'عند التسجيل في دورة نجمع: الاسم، البريد الإلكتروني، رقم الهاتف/الواتساب، الدورة والدفعة المختارة، النمط المفضّل، المدينة (للتدريب الوجاهي)، مستواك الحالي، ونوع التسجيل. عند إرسال نموذج التواصل نجمع الاسم والبريد ونوع الطلب ونص الرسالة.',
          },
          {
            title: 'لماذا نجمعها',
            body: 'لتأكيد مقعدك في الدورة والتواصل معك بخصوص التفاصيل التنظيمية والدفع. لا تُستخدم بياناتك لأي غرض تسويقي دون موافقة منفصلة، ولا تُباع أو تُشارك مع أطراف ثالثة.',
          },
          {
            title: 'إشعارات الواتساب',
            body: 'يُرسل تأكيد التسجيل إلى رقم الواتساب الذي تزوّدنا به، عبر واجهة WhatsApp Cloud API من Meta. تخضع معالجة الرسالة لدى Meta لسياسة الخصوصية الخاصة بها.',
          },
          {
            title: 'التحليلات',
            body: 'نستخدم Vercel Analytics وSpeed Insights لقياس الزيارات وأداء الصفحات. هذه الأدوات لا تستخدم كوكيز ولا تتعقّبك عبر المواقع، لذلك لا توجد لافتة موافقة كوكيز على هذا الموقع.',
          },
          {
            title: 'مدة الاحتفاظ',
            body: 'تُحفظ بيانات التسجيل طوال مدة الدورة ولمدة اثني عشر شهراً بعدها لأغراض المتابعة وإصدار الشهادات، ثم تُحذف.',
          },
          {
            title: 'حقوقك',
            body: `يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها في أي وقت بمراسلتنا على ${settings.email}. تُنفَّذ طلبات الحذف خلال ثلاثين يوماً.`,
          },
          {
            title: 'لقطات آراء المتدربين',
            body: 'تُنشر لقطات آراء المتدربين بموافقة أصحابها المسبقة فقط، وتُطمس أي بيانات حساسة داخل اللقطة. لطلب إزالة رأي منشور راسلنا وسيُزال فوراً.',
          },
        ]
      : [
          {
            title: 'What we collect',
            body: 'When you register for a course we collect: your name, email address, phone/WhatsApp number, the chosen course and cohort, preferred delivery mode, city (for onsite training), your current level, and registration type. The contact form collects your name, email, enquiry type, and message.',
          },
          {
            title: 'Why we collect it',
            body: 'To confirm your seat and communicate with you about scheduling and payment. Your data is not used for marketing without separate consent, and is never sold or shared with third parties.',
          },
          {
            title: 'WhatsApp notifications',
            body: 'Your registration confirmation is sent to the WhatsApp number you provide, through Meta’s WhatsApp Cloud API. Meta’s handling of that message is governed by its own privacy policy.',
          },
          {
            title: 'Analytics',
            body: 'We use Vercel Analytics and Speed Insights to measure traffic and page performance. These tools set no cookies and do not track you across sites, which is why this site carries no cookie consent banner.',
          },
          {
            title: 'Retention',
            body: 'Registration data is kept for the duration of the course and for twelve months afterwards for follow-up and certificate issuance, then deleted.',
          },
          {
            title: 'Your rights',
            body: `You can request access to, correction of, or deletion of your data at any time by writing to ${settings.email}. Deletion requests are actioned within thirty days.`,
          },
          {
            title: 'Testimonial screenshots',
            body: 'Trainee testimonial screenshots are published only with the prior consent of their authors, with sensitive details redacted. To request removal of a published testimonial, contact us and it will be taken down immediately.',
          },
        ]

  return (
    <div className="container-page max-w-3xl py-16">
      <h1 className="text-3xl">{dictionary.footer.privacy}</h1>

      <Prose className="mt-8 max-w-none">
        {sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </Prose>
    </div>
  )
}
