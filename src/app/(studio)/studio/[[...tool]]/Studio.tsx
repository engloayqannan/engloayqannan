'use client'

import { NextStudio } from 'next-sanity/studio'

import config from '../../../../../sanity.config'

/**
 * الاستوديو يعمل على العميل بالكامل. عزله في وحدة 'use client' مقصود:
 * إعداد Sanity ينشئ سياقات React عند التحميل، وتقييمه في الخادم يفشل.
 */
export function Studio() {
  return <NextStudio config={config} />
}
