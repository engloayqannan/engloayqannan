import type { Cohort, CohortStatus } from '@/lib/content/types'

/** عتبة إظهار «مقاعد محدودة» (SPEC §5.4) */
export const FEW_SEATS_THRESHOLD = 3

export interface CohortAvailability {
  status: CohortStatus
  /** هل يُسمح بفتح نموذج التسجيل على هذه الدفعة؟ */
  canRegister: boolean
  seatsRemaining: number
}

/**
 * تُحسب الحالة من الحقائق (المقاعد، الموعد النهائي، تاريخ البدء) لا من
 * الحقل المعلَن وحده — حتى لا تبقى دفعة ممتلئة معروضة كمفتوحة إذا نسي
 * المحرر تحديث الحالة يدوياً (SPEC §5.4).
 *
 * الحقل المعلَن يُحترم فقط حين يكون أكثر تقييداً من الحساب الآلي:
 * المحرر يستطيع إغلاق دفعة مبكراً، ولا يستطيع فتح دفعة ممتلئة.
 */
export function resolveCohortAvailability(
  cohort: Pick<
    Cohort,
    'seatsRemaining' | 'registrationDeadline' | 'startDate' | 'declaredStatus'
  >,
  now: Date = new Date(),
): CohortAvailability {
  const seatsRemaining = Math.max(0, cohort.seatsRemaining ?? 0)

  if (cohort.declaredStatus === 'closed') {
    return { status: 'closed', canRegister: false, seatsRemaining }
  }

  if (cohort.declaredStatus === 'full' || seatsRemaining === 0) {
    // دفعة بلا تاريخ ومقاعدها صفر ما تزال «قريباً» لا «مكتملة»
    if (!cohort.startDate && cohort.declaredStatus !== 'full') {
      return { status: 'soon', canRegister: false, seatsRemaining }
    }
    return { status: 'full', canRegister: false, seatsRemaining }
  }

  if (!cohort.startDate) {
    return { status: 'soon', canRegister: false, seatsRemaining }
  }

  const deadline = cohort.registrationDeadline
    ? new Date(cohort.registrationDeadline)
    : new Date(cohort.startDate)

  if (Number.isFinite(deadline.getTime()) && deadline.getTime() <= now.getTime()) {
    return { status: 'closed', canRegister: false, seatsRemaining }
  }

  if (seatsRemaining <= FEW_SEATS_THRESHOLD) {
    return { status: 'few_left', canRegister: true, seatsRemaining }
  }

  return { status: 'open', canRegister: true, seatsRemaining }
}

/** الدفعات التي يمكن اختيارها في نموذج التسجيل. */
export function registrableCohorts(cohorts: Cohort[], now: Date = new Date()): Cohort[] {
  return cohorts.filter((cohort) => resolveCohortAvailability(cohort, now).canRegister)
}

/** أقرب دفعة قادمة — تُستخدم في بطاقة الدورة والشريط الجانبي. */
export function nextCohort(cohorts: Cohort[], now: Date = new Date()): Cohort | null {
  const upcoming = cohorts
    .filter((cohort) => cohort.startDate !== null)
    .filter((cohort) => new Date(cohort.startDate as string).getTime() >= now.getTime())
    .sort(
      (a, b) =>
        new Date(a.startDate as string).getTime() - new Date(b.startDate as string).getTime(),
    )

  return upcoming[0] ?? null
}

/** حالة الدورة ككل: أفضل حالة متاحة بين دفعاتها. */
export function courseStatus(cohorts: Cohort[], now: Date = new Date()): CohortStatus {
  if (cohorts.length === 0) return 'soon'

  const statuses = cohorts.map((cohort) => resolveCohortAvailability(cohort, now).status)
  const priority: CohortStatus[] = ['open', 'few_left', 'soon', 'full', 'closed']

  for (const status of priority) {
    if (statuses.includes(status)) return status
  }

  return 'closed'
}
