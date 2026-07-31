import ar from '../../../messages/ar.json'
import en from '../../../messages/en.json'
import { defaultLocale, type Locale } from './config'

/**
 * قاموس العربية هو مصدر الحقيقة لشكل المفاتيح — أي مفتاح ينقص
 * من الإنجليزية يظهر كخطأ نوع في وقت الترجمة لا كنص مفقود في الإنتاج.
 */
export type Dictionary = typeof ar

const dictionaries: Record<Locale, Dictionary> = {
  ar,
  en: en as Dictionary,
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale]
}

export { interpolate } from '@/lib/utils/format'
