import { describe, expect, it } from 'vitest'

import { getDirection, isLocale, matchLocale, switchLocalePath } from './config'

describe('switchLocalePath', () => {
  it('يحافظ على الصفحة الحالية عند تبديل اللغة', () => {
    expect(switchLocalePath('/ar/courses/react-professional', 'en')).toBe(
      '/en/courses/react-professional',
    )
  })

  it('يبدّل لغة الجذر', () => {
    expect(switchLocalePath('/ar', 'en')).toBe('/en')
  })

  it('يضيف اللغة لمسار بلا بادئة لغوية', () => {
    expect(switchLocalePath('/courses', 'ar')).toBe('/ar/courses')
  })

  it('يتعامل مع الجذر الفارغ', () => {
    expect(switchLocalePath('/', 'ar')).toBe('/ar')
  })
})

describe('matchLocale', () => {
  it('يختار الإنجليزية من ترويسة إنجليزية', () => {
    expect(matchLocale('en-US,en;q=0.9')).toBe('en')
  })

  it('يختار العربية من ترويسة عربية', () => {
    expect(matchLocale('ar-JO,ar;q=0.9,en;q=0.5')).toBe('ar')
  })

  it('يحترم ترتيب الجودة لا ترتيب الظهور', () => {
    expect(matchLocale('fr;q=1.0,en;q=0.9,ar;q=0.95')).toBe('ar')
  })

  it('يسقط للعربية عند غياب تطابق أو غياب الترويسة', () => {
    expect(matchLocale('fr-FR,de;q=0.8')).toBe('ar')
    expect(matchLocale(null)).toBe('ar')
    expect(matchLocale('')).toBe('ar')
  })
})

describe('isLocale و getDirection', () => {
  it('يقبل اللغات المعروفة فقط', () => {
    expect(isLocale('ar')).toBe(true)
    expect(isLocale('en')).toBe(true)
    expect(isLocale('fr')).toBe(false)
    expect(isLocale(undefined)).toBe(false)
  })

  it('يعيد الاتجاه الصحيح لكل لغة', () => {
    expect(getDirection('ar')).toBe('rtl')
    expect(getDirection('en')).toBe('ltr')
  })
})
