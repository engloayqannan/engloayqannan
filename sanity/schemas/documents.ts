/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * مخططات وثائق Sanity (SPEC §6.2).
 *
 * القواعد التي تُفرض هنا لا في الواجهة، لأنها قواعد محتوى لا عرض:
 * - النص البديل إلزامي لكل صورة ذات معنى
 * - لا يُنشر رأي متدرّب دون تأكيد موافقة صاحبه
 * - وثائق التسجيل والرسائل تُقرأ من الاستوديو فقط ولا تُنشأ يدوياً
 */

const required = (rule: any) => rule.required()

export const siteSettings = {
  name: 'siteSettings',
  title: 'إعدادات الموقع',
  type: 'document',
  fields: [
    { name: 'fullName', title: 'الاسم الكامل', type: 'localeString', validation: required },
    { name: 'headline', title: 'المسمّى المهني', type: 'localeString', validation: required },
    { name: 'shortBio', title: 'نبذة قصيرة', type: 'localeText', validation: required },
    { name: 'longBio', title: 'السيرة المفصّلة', type: 'localeBlock' },
    {
      name: 'avatar',
      title: 'الصورة الشخصية',
      type: 'image',
      fields: [
        { name: 'alt', title: 'نص بديل', type: 'localeString', validation: required },
      ],
    },
    { name: 'cvAr', title: 'السيرة الذاتية (عربي)', type: 'file' },
    { name: 'cvEn', title: 'السيرة الذاتية (إنجليزي)', type: 'file' },
    { name: 'email', title: 'البريد الإلكتروني', type: 'string', validation: required },
    {
      name: 'whatsappNumber',
      title: 'رقم الواتساب',
      description: 'بصيغة E.164، مثل ‎+962791234567',
      type: 'string',
      validation: (rule: any) =>
        rule.required().regex(/^\+[1-9]\d{7,14}$/, { name: 'E.164' }),
    },
    {
      name: 'socials',
      title: 'روابط التواصل',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              type: 'string',
              options: { list: ['linkedin', 'github', 'youtube', 'x', 'website'] },
            },
            { name: 'url', type: 'url' },
          ],
        },
      ],
    },
    {
      name: 'stats',
      title: 'الإحصائيات',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', type: 'localeString' },
            { name: 'value', type: 'number' },
            { name: 'suffix', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'approach',
      title: 'منهجية التدريب',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'localeString' },
            { name: 'body', type: 'localeText' },
          ],
        },
      ],
    },
    {
      name: 'timeline',
      title: 'المسار المهني',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'period', type: 'string' },
            { name: 'title', type: 'localeString' },
            { name: 'organisation', type: 'localeString' },
            { name: 'body', type: 'localeText' },
          ],
        },
      ],
    },
  ],
}

export const course = {
  name: 'course',
  title: 'دورة',
  type: 'document',
  fields: [
    { name: 'title', title: 'العنوان', type: 'localeString', validation: required },
    {
      name: 'slug',
      title: 'المعرّف في الرابط',
      type: 'slug',
      description: 'مشترك بين اللغتين حتى يحافظ مبدّل اللغة على الصفحة',
      options: { source: 'title.en' },
      validation: required,
    },
    { name: 'summary', title: 'الملخص', type: 'localeText', validation: required },
    { name: 'description', title: 'الوصف', type: 'localeBlock' },
    {
      name: 'level',
      title: 'المستوى',
      type: 'string',
      options: { list: ['beginner', 'intermediate', 'advanced'] },
      validation: required,
    },
    { name: 'durationHours', title: 'عدد الساعات', type: 'number', validation: required },
    { name: 'sessionsCount', title: 'عدد الجلسات', type: 'number' },
    {
      name: 'language',
      title: 'لغة التدريس',
      type: 'string',
      options: { list: ['ar', 'en', 'both'] },
    },
    { name: 'prerequisites', title: 'المتطلبات المسبقة', type: 'array', of: [{ type: 'localeString' }] },
    { name: 'outcomes', title: 'مخرجات التعلّم', type: 'array', of: [{ type: 'localeString' }] },
    {
      name: 'syllabus',
      title: 'المنهج',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'moduleTitle', type: 'localeString' },
            { name: 'topics', type: 'array', of: [{ type: 'localeString' }] },
            { name: 'hours', type: 'number' },
          ],
        },
      ],
    },
    {
      name: 'modes',
      title: 'أنماط التقديم',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: ['online', 'onsite', 'hybrid'] },
      validation: required,
    },
    {
      name: 'cities',
      title: 'المدن',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'city', type: 'localeString' },
            { name: 'country', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'coverImage',
      title: 'صورة الغلاف',
      type: 'image',
      fields: [{ name: 'alt', title: 'نص بديل', type: 'localeString', validation: required }],
    },
    { name: 'technologies', title: 'التقنيات', type: 'array', of: [{ type: 'string' }] },
    { name: 'priceIndividual', title: 'سعر الفرد', type: 'money' },
    {
      name: 'corporate',
      title: 'تدريب الشركات',
      type: 'object',
      fields: [
        { name: 'available', title: 'متاح', type: 'boolean', initialValue: true },
        {
          name: 'showPrice',
          title: 'إظهار السعر',
          description: 'عند الإطفاء يُعرض «اطلب عرض سعر» بدل الرقم',
          type: 'boolean',
          initialValue: false,
        },
        { name: 'amount', type: 'number' },
        { name: 'currency', type: 'string', initialValue: 'USD' },
      ],
    },
    {
      name: 'faqs',
      title: 'أسئلة شائعة',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'q', title: 'السؤال', type: 'localeString' },
            { name: 'a', title: 'الجواب', type: 'localeText' },
          ],
        },
      ],
    },
    { name: 'featured', title: 'مميّزة', type: 'boolean', initialValue: false },
    { name: 'order', title: 'الترتيب', type: 'number', initialValue: 100 },
  ],
}

export const cohort = {
  name: 'cohort',
  title: 'دفعة',
  type: 'document',
  fields: [
    { name: 'course', title: 'الدورة', type: 'reference', to: [{ type: 'course' }], validation: required },
    { name: 'startDate', title: 'تاريخ البدء', type: 'datetime' },
    { name: 'endDate', title: 'تاريخ الانتهاء', type: 'datetime' },
    {
      name: 'timezone',
      title: 'المنطقة الزمنية',
      description: 'بصيغة IANA، مثل Asia/Amman — تُعرض الأوقات بها وبتوقيت الزائر',
      type: 'string',
      initialValue: 'Asia/Amman',
      validation: required,
    },
    { name: 'schedule', title: 'المواعيد', type: 'localeString' },
    {
      name: 'mode',
      title: 'النمط',
      type: 'string',
      options: { list: ['online', 'onsite', 'hybrid'] },
      validation: required,
    },
    { name: 'city', title: 'المدينة', type: 'localeString' },
    { name: 'capacity', title: 'السعة', type: 'number' },
    {
      name: 'seatsRemaining',
      title: 'المقاعد المتبقية',
      description:
        'يُحدَّث يدوياً. الموقع يمنع التسجيل تلقائياً حين يصل الرقم إلى صفر حتى لو بقيت الحالة «مفتوح».',
      type: 'number',
      validation: (rule: any) => rule.required().min(0),
    },
    { name: 'registrationDeadline', title: 'آخر موعد للتسجيل', type: 'datetime' },
    {
      name: 'status',
      title: 'الحالة المعلنة',
      description: 'تُستخدم للإغلاق المبكر فقط — لا يمكنها فتح دفعة ممتلئة',
      type: 'string',
      options: { list: ['open', 'full', 'soon', 'closed'] },
    },
    { name: 'priceOverride', title: 'سعر خاص بالدفعة', type: 'money' },
  ],
}

export const certificate = {
  name: 'certificate',
  title: 'شهادة',
  type: 'document',
  fields: [
    { name: 'title', title: 'العنوان', type: 'localeString', validation: required },
    { name: 'issuer', title: 'الجهة المانحة', type: 'localeString', validation: required },
    { name: 'issueDate', title: 'تاريخ الإصدار', type: 'date', validation: required },
    { name: 'expiryDate', title: 'تاريخ الانتهاء', type: 'date' },
    { name: 'credentialId', title: 'رقم الاعتماد', type: 'string' },
    { name: 'verificationUrl', title: 'رابط التحقق', type: 'url' },
    {
      name: 'image',
      title: 'صورة الشهادة',
      type: 'image',
      validation: required,
      fields: [{ name: 'alt', title: 'نص بديل', type: 'localeString', validation: required }],
    },
    {
      name: 'category',
      title: 'الفئة',
      type: 'string',
      options: { list: ['technical', 'training', 'academic'] },
    },
    { name: 'order', title: 'الترتيب', type: 'number', initialValue: 100 },
  ],
}

export const testimonial = {
  name: 'testimonial',
  title: 'رأي متدرّب',
  type: 'document',
  fields: [
    {
      name: 'screenshot',
      title: 'لقطة من كلام المتدرّب',
      description: 'اطمس أرقام الهواتف وصور الملفات الشخصية داخل اللقطة قبل الرفع.',
      type: 'image',
      validation: required,
      fields: [],
    },
    {
      name: 'altText',
      title: 'النص البديل',
      description:
        'يصف فحوى الرأي لا شكل الصورة. إلزامي: اللقطة وحدها غير مقروءة لقارئ الشاشة ولا لمحركات البحث.',
      type: 'localeString',
      validation: required,
    },
    {
      name: 'transcript',
      title: 'النص المفرّغ',
      description:
        'موصى به بشدة: يُعرض تحت الصورة، ولا تُصدَّر بيانات Review المنظمة بدونه.',
      type: 'localeText',
    },
    { name: 'traineeName', title: 'اسم المتدرّب', type: 'string', validation: required },
    { name: 'traineeTitle', title: 'المسمّى', type: 'localeString' },
    { name: 'course', title: 'الدورة', type: 'reference', to: [{ type: 'course' }] },
    { name: 'cohortLabel', title: 'الشعبة / الدفعة', type: 'string' },
    { name: 'date', title: 'التاريخ', type: 'date' },
    {
      name: 'consentGiven',
      title: 'تأكيد موافقة صاحب الرأي على النشر',
      description:
        'شرط قانوني وأخلاقي لا حقل إداري. الرأي بلا موافقة لا يُعرض في الموقع إطلاقاً.',
      type: 'boolean',
      initialValue: false,
      validation: (rule: any) =>
        rule.custom((value: boolean) =>
          value === true ? true : 'لا يمكن نشر رأي دون تأكيد موافقة صاحبه',
        ),
    },
    { name: 'featured', title: 'مميّز', type: 'boolean', initialValue: false },
  ],
}

export const teachingEngagement = {
  name: 'teachingEngagement',
  title: 'خبرة أكاديمية',
  type: 'document',
  fields: [
    { name: 'institution', title: 'الجهة', type: 'localeString', validation: required },
    {
      name: 'logo',
      title: 'الشعار',
      type: 'image',
      fields: [{ name: 'alt', title: 'نص بديل', type: 'localeString', validation: required }],
    },
    { name: 'role', title: 'الدور', type: 'localeString', validation: required },
    { name: 'coursesTaught', title: 'المواد', type: 'array', of: [{ type: 'localeString' }] },
    { name: 'startDate', title: 'البداية', type: 'date', validation: required },
    { name: 'endDate', title: 'النهاية', type: 'date' },
    { name: 'city', title: 'المدينة', type: 'localeString' },
    { name: 'country', title: 'الدولة', type: 'string' },
    { name: 'description', title: 'الوصف', type: 'localeText' },
    { name: 'order', title: 'الترتيب', type: 'number', initialValue: 100 },
  ],
}

export const post = {
  name: 'post',
  title: 'مقال',
  type: 'document',
  fields: [
    { name: 'title', title: 'العنوان', type: 'localeString', validation: required },
    { name: 'slug', title: 'المعرّف', type: 'slug', options: { source: 'title.en' }, validation: required },
    { name: 'excerpt', title: 'المقتطف', type: 'localeText', validation: required },
    { name: 'body', title: 'المحتوى', type: 'localeBlock', validation: required },
    {
      name: 'coverImage',
      title: 'صورة الغلاف',
      type: 'image',
      fields: [{ name: 'alt', title: 'نص بديل', type: 'localeString', validation: required }],
    },
    { name: 'tags', title: 'الوسوم', type: 'array', of: [{ type: 'string' }] },
    { name: 'publishedAt', title: 'تاريخ النشر', type: 'datetime', validation: required },
    { name: 'readingTime', title: 'زمن القراءة (دقائق)', type: 'number' },
  ],
}

/**
 * وثائق واردة من الموقع. تحتوي بيانات شخصية ولا تُقرأ من الواجهة العامة
 * أبداً — تُقرأ داخل الاستوديو فقط بصلاحية محرر (SPEC §6.3).
 */
export const registration = {
  name: 'registration',
  title: 'طلب تسجيل',
  type: 'document',
  readOnly: true,
  fields: [
    { name: 'course', type: 'reference', to: [{ type: 'course' }] },
    { name: 'cohort', type: 'reference', to: [{ type: 'cohort' }] },
    { name: 'fullName', type: 'string' },
    { name: 'email', type: 'string' },
    { name: 'phone', type: 'string' },
    { name: 'preferredMode', type: 'string' },
    { name: 'city', type: 'string' },
    { name: 'experienceLevel', type: 'string' },
    { name: 'registrationType', type: 'string' },
    { name: 'companyName', type: 'string' },
    { name: 'notes', type: 'text' },
    { name: 'locale', type: 'string' },
    {
      name: 'status',
      type: 'string',
      readOnly: false,
      options: { list: ['new', 'contacted', 'confirmed', 'cancelled', 'waitlist'] },
    },
    { name: 'source', type: 'string' },
    {
      name: 'suspectedAutomation',
      title: 'إرسال سريع غير معتاد',
      description: 'إشارة ظنّية فقط — الطلب معالَج بالكامل ولم يُرفض.',
      type: 'boolean',
    },
    { name: 'submittedAt', type: 'datetime' },
  ],
  preview: {
    select: { title: 'fullName', subtitle: 'email' },
  },
}

export const contactMessage = {
  name: 'contactMessage',
  title: 'رسالة تواصل',
  type: 'document',
  readOnly: true,
  fields: [
    { name: 'fullName', type: 'string' },
    { name: 'email', type: 'string' },
    { name: 'inquiryType', type: 'string' },
    { name: 'message', type: 'text' },
    { name: 'locale', type: 'string' },
    {
      name: 'status',
      type: 'string',
      readOnly: false,
      options: { list: ['new', 'replied', 'archived'] },
    },
    { name: 'suspectedAutomation', type: 'boolean' },
    { name: 'submittedAt', type: 'datetime' },
  ],
  preview: {
    select: { title: 'fullName', subtitle: 'inquiryType' },
  },
}

export const schemaTypes = [
  siteSettings,
  course,
  cohort,
  certificate,
  testimonial,
  teachingEngagement,
  post,
  registration,
  contactMessage,
]
