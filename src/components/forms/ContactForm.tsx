'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Field } from '@/components/forms/Field'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/primitives'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionary'
import { createContactSchema, type ContactInput } from '@/lib/validation/schemas'

type SubmitState = { kind: 'idle' } | { kind: 'success' } | { kind: 'error'; message: string }

export function ContactForm({
  locale,
  dictionary,
}: {
  locale: Locale
  dictionary: Dictionary
}) {
  const loadedAt = useRef(Date.now())
  const [state, setState] = useState<SubmitState>({ kind: 'idle' })

  const schema = useMemo(
    () => createContactSchema(dictionary.validation),
    [dictionary.validation],
  )

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(schema),
    defaultValues: { locale, inquiryType: 'individual', website: '' },
  })

  async function onSubmit(values: ContactInput) {
    setState({ kind: 'idle' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, loadedAt: loadedAt.current }),
      })

      const result = (await response.json()) as {
        ok: boolean
        code?: string
        fieldErrors?: Record<string, string>
      }

      if (result.ok) {
        setState({ kind: 'success' })
        return
      }

      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          setError(field as keyof ContactInput, { message })
        }
      }

      setState({
        kind: 'error',
        message:
          result.code === 'rate_limited'
            ? dictionary.register.errorRateLimited
            : dictionary.register.errorGeneric,
      })
    } catch {
      setState({ kind: 'error', message: dictionary.register.errorGeneric })
    }
  }

  if (state.kind === 'success') {
    return (
      <Card className="p-8" data-testid="contact-success">
        <div role="status" aria-live="polite">
          <h2 className="text-xl">{dictionary.contact.successTitle}</h2>
          <p className="mt-3 text-sm text-muted">{dictionary.contact.successBody}</p>
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
          {state.message}
        </div>
      )}

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('website')}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          id="contact-name"
          label={dictionary.contact.fullName}
          required
          error={errors.fullName?.message}
        >
          {(props) => <input type="text" autoComplete="name" {...props} {...register('fullName')} />}
        </Field>

        <Field
          id="contact-email"
          label={dictionary.contact.email}
          required
          error={errors.email?.message}
        >
          {(props) => (
            <input type="email" dir="ltr" autoComplete="email" {...props} {...register('email')} />
          )}
        </Field>
      </div>

      <Field
        id="contact-type"
        label={dictionary.contact.inquiryType}
        required
        error={errors.inquiryType?.message}
      >
        {(props) => (
          <select {...props} {...register('inquiryType')}>
            <option value="individual">{dictionary.contact.type.individual}</option>
            <option value="corporate">{dictionary.contact.type.corporate}</option>
            <option value="academic">{dictionary.contact.type.academic}</option>
            <option value="other">{dictionary.contact.type.other}</option>
          </select>
        )}
      </Field>

      <Field
        id="contact-message"
        label={dictionary.contact.message}
        required
        error={errors.message?.message}
      >
        {(props) => <textarea rows={6} {...props} {...register('message')} />}
      </Field>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? dictionary.contact.submitting : dictionary.contact.submit}
      </Button>
    </form>
  )
}
