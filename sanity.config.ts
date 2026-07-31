import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { localeBlock, localeString, localeText, money } from './sanity/schemas/localized'
import { schemaTypes } from './sanity/schemas/documents'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

/**
 * الاستوديو مدمج داخل نفس التطبيق على /studio (SPEC §3.2)، في جذر
 * تخطيط مستقل حتى لا يشارك الموقع أي شيء من حزمته.
 *
 * وثائق التسجيل والرسائل تظهر في القائمة لأنها لوحة الطلبات، لكنها
 * للقراءة فقط ولا تُنشأ يدوياً — مصدرها الوحيد نماذج الموقع.
 */
export default defineConfig({
  name: 'trainer-portfolio',
  title: 'موقع مدرّب Front-End',
  basePath: '/studio',
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: [localeString, localeText, localeBlock, money, ...schemaTypes] as never,
  },
  document: {
    // لا تُنشأ طلبات التسجيل ولا الرسائل من الاستوديو
    newDocumentOptions: (previous) =>
      previous.filter(
        (item) =>
          item.templateId !== 'registration' && item.templateId !== 'contactMessage',
      ),
  },
})
