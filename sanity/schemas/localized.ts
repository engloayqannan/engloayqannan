/**
 * أنواع التعريب على مستوى الحقل (SPEC §6.1).
 *
 * `ar` مطلوب دائماً، و`en` اختياري — وغيابه يُخفي الوثيقة من الواجهة
 * الإنجليزية بدل عرض نص عربي داخل صفحة إنجليزية.
 *
 * الملفات هنا تُستهلك من `sanity.config.ts` بعد تثبيت حزمة `sanity`.
 * كُتبت ككائنات عادية عمداً حتى لا يعتمد بناء الموقع على حزمة الاستوديو.
 */

export const localeString = {
  name: 'localeString',
  title: 'نص قصير مترجم',
  type: 'object',
  fields: [
    { name: 'ar', title: 'العربية', type: 'string', validation: (rule: any) => rule.required() },
    { name: 'en', title: 'English', type: 'string' },
  ],
}

export const localeText = {
  name: 'localeText',
  title: 'نص مترجم',
  type: 'object',
  fields: [
    {
      name: 'ar',
      title: 'العربية',
      type: 'text',
      rows: 4,
      validation: (rule: any) => rule.required(),
    },
    { name: 'en', title: 'English', type: 'text', rows: 4 },
  ],
}

export const localeBlock = {
  name: 'localeBlock',
  title: 'محتوى غني مترجم',
  type: 'object',
  fields: [
    {
      name: 'ar',
      title: 'العربية',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (rule: any) => rule.required(),
    },
    { name: 'en', title: 'English', type: 'array', of: [{ type: 'block' }] },
  ],
}

export const money = {
  name: 'money',
  title: 'سعر',
  type: 'object',
  fields: [
    { name: 'amount', title: 'المبلغ', type: 'number' },
    {
      name: 'currency',
      title: 'العملة',
      type: 'string',
      initialValue: 'USD',
      options: { list: ['USD', 'JOD', 'SAR', 'AED', 'EUR'] },
    },
  ],
}
