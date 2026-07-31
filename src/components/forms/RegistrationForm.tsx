'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Field } from '@/components/forms/Field'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/primitives'
import type { DeliveryMode } from '@/lib/content/types'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionary'
import { buildWhatsAppLink } from '@/lib/notifications/whatsapp'
import { createRegistrationSchema, type RegistrationInput } from '@/lib/validation/schemas'

export interface CohortOption {
  id: string
  label: string
  mode: DeliveryMode
}

interface RegistrationFormProps {
  locale: Locale
  dictionary: Dictionary
  courseSlug: string
  courseTitle: string
  modes: DeliveryMode[]
  cohorts: CohortOption[]
  defaultCohortId: string | null
  whatsappNumber: string
}

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'success'; whatsappSent: boolean; cohortLabel: string }
  | { kind: 'error'; message: string }

export function RegistrationForm({
  locale,
  dictionary,
  courseSlug,
  courseTitle,
  modes,
  cohorts,
  defaultCohortId,
  whatsappNumber,
}: RegistrationFormProps) {
  const loadedAt = useRef(Date.now())
  const [state, setState] = useState<SubmitState>({ kind: 'idle' })

  const schema = useMemo(
    () => createRegistrationSchema(dictionary.validation),
    [dictionary.validation],
  )

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      courseSlug,
      cohortId: defaultCohortId ?? cohorts[0]?.id ?? '',
      preferredMode: modes[0] ?? 'online',
      registrationType: 'individual',
      experienceLevel: 'beginner',
      locale,
      website: '',
    },
  })

  const preferredMode = watch('preferredMode')
  const registrationType = watch('registrationType')
  const cityRequired = preferredMode !== 'online'

  async function onSubmit(values: RegistrationInput) {
    setState({ kind: 'idle' })

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, loadedAt: loadedAt.current }),
      })

      const result = (await response.json()) as {
        ok: boolean
        code?: string
        whatsappSent?: boolean
        fieldErrors?: Record<string, string>
      }

      if (result.ok) {
        const cohort = cohorts.find((item) => item.id === values.cohortId)
        setState({
          kind: 'success',
          whatsappSent: result.whatsappSent ?? false,
          cohortLabel: cohort?.label ?? '',
        })
        return
      }

      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          setError(field as keyof RegistrationInput, { message })
        }
      }

      const messages: Record<string, string> = {
        cohort_unavailable: dictionary.register.errorCohortFull,
        rate_limited: dictionary.register.errorRateLimited,
      }

      setState({
        kind: 'error',
        message: messages[result.code ?? ''] ?? dictionary.register.errorGeneric,
      })
    } catch {
      setState({ kind: 'error', message: dictionary.register.errorGeneric })
    }
  }

  if (state.kind === 'success') {
    // المسار البديل: حين لا يكون إرسال الواتساب التلقائي مفعّلاً، يرسل
    // المتدرّب التفاصيل بنفسه برسالة معبّأة (SPEC §7.4)
    const whatsappLink = state.whatsappSent
      ? null
      : buildWhatsAppLink(
          whatsappNumber,
          locale === 'ar'
            ? `مرحباً، سجّلت في دورة ${courseTitle}${state.cohortLabel ? ` — ${state.cohortLabel}` : ''}.`
            : `Hello, I registered for ${courseTitle}${state.cohortLabel ? ` — ${state.cohortLabel}` : ''}.`,
        )

    return (
      <Card className="p-8" data-testid="registration-success">
        <div role="status" aria-live="polite">
          <h2 className="text-xl">{dictionary.register.successTitle}</h2>
          <p className="mt-3 text-sm text-muted">{dictionary.register.successBody}</p>
        </div>

        <dl className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{dictionary.register.course}</dt>
            <dd className="font-semibold">{courseTitle}</dd>
          </div>
          {state.cohortLabel && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{dictionary.register.cohort}</dt>
              <dd className="font-semibold">{state.cohortLabel}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          {whatsappLink && (
            <Button href={whatsappLink} external>
              {dictionary.register.successWhatsapp}
            </Button>
          )}
          <Button href={`/${locale}`} variant="secondary">
            {dictionary.register.backHome}
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {state.kind === 'error' && (
        <div
          role="alert"
          className="rounded-sm border border-danger bg-accent-soft px-4 py-3 text-sm text-danger"
        >
          <p className="font-semibold">{dictionary.register.errorTitle}</p>
          <p className="mt-1">{state.message}</p>
        </div>
      )}

      {/* حقل شرك مخفي عن البشر ومقروء للآلي (SPEC §7.5) */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          id="fullName"
          label={dictionary.register.fullName}
          required
          error={errors.fullName?.message}
        >
          {(props) => <input type="text" autoComplete="name" {...props} {...register('fullName')} />}
        </Field>

        <Field
          id="email"
          label={dictionary.register.email}
          required
          error={errors.email?.message}
        >
          {(props) => (
            <input type="email" dir="ltr" autoComplete="email" {...props} {...register('email')} />
          )}
        </Field>
      </div>

      <Field
        id="phone"
        label={dictionary.register.phone}
        hint={dictionary.register.phoneHint}
        required
        error={errors.phone?.message}
      >
        {(props) => (
          <input
            type="tel"
            dir="ltr"
            inputMode="tel"
            placeholder="+962791234567"
            autoComplete="tel"
            {...props}
            {...register('phone')}
          />
        )}
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          id="cohortId"
          label={dictionary.register.cohort}
          required
          error={errors.cohortId?.message}
        >
          {(props) => (
            <select {...props} {...register('cohortId')}>
              <option value="">{dictionary.register.selectCohort}</option>
              {cohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>
                  {cohort.label}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field
          id="preferredMode"
          label={dictionary.register.preferredMode}
          required
          error={errors.preferredMode?.message}
        >
          {(props) => (
            <select {...props} {...register('preferredMode')}>
              {modes.map((mode) => (
                <option key={mode} value={mode}>
                  {dictionary.courses.mode[mode]}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      {cityRequired && (
        <Field
          id="city"
          label={dictionary.register.city}
          hint={dictionary.register.cityHint}
          required
          error={errors.city?.message}
        >
          {(props) => <input type="text" {...props} {...register('city')} />}
        </Field>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          id="experienceLevel"
          label={dictionary.register.experienceLevel}
          required
          error={errors.experienceLevel?.message}
        >
          {(props) => (
            <select {...props} {...register('experienceLevel')}>
              <option value="beginner">{dictionary.courses.level.beginner}</option>
              <option value="intermediate">{dictionary.courses.level.intermediate}</option>
              <option value="advanced">{dictionary.courses.level.advanced}</option>
            </select>
          )}
        </Field>

        <Field
          id="registrationType"
          label={dictionary.register.registrationType}
          required
          error={errors.registrationType?.message}
        >
          {(props) => (
            <select {...props} {...register('registrationType')}>
              <option value="individual">{dictionary.register.asIndividual}</option>
              <option value="company">{dictionary.register.asCompany}</option>
            </select>
          )}
        </Field>
      </div>

      {registrationType === 'company' && (
        <Field
          id="companyName"
          label={dictionary.register.companyName}
          required
          error={errors.companyName?.message}
        >
          {(props) => <input type="text" {...props} {...register('companyName')} />}
        </Field>
      )}

      <Field
        id="notes"
        label={dictionary.register.notes}
        hint={dictionary.register.notesHint}
        error={errors.notes?.message}
      >
        {(props) => <textarea rows={4} {...props} {...register('notes')} />}
      </Field>

      <div className="space-y-1.5">
        <label className="flex items-start gap-3 text-xs">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? 'consent-error' : undefined}
            {...register('consent')}
          />
          <span className="text-muted">{dictionary.register.consent}</span>
        </label>
        {errors.consent && (
          <p id="consent-error" className="text-2xs font-semibold text-danger">
            {errors.consent.message}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? dictionary.register.submitting : dictionary.register.submit}
      </Button>
    </form>
  )
}
