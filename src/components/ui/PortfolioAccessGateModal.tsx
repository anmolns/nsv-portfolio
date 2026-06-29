import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  sendPortfolioWhatsAppOtp,
  verifyPortfolioWhatsAppOtp,
} from '../../api/portfolioOtp'
import { pauseSmoothScroll, resumeSmoothScroll } from '../../lib/lenisControl'
import { savePortfolioAccess } from '../../lib/portfolioAccess'
import { cn } from '../../lib/utils'

interface PortfolioAccessGateModalProps {
  pendingProjectName?: string | null
  onValidated: () => void
}

type Step = 'details' | 'otp'

interface FormState {
  name: string
  email: string
  phone: string
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  otp?: string
  submit?: string
}

function validateDetails(data: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!data.name.trim()) errors.name = 'Name is required'
  if (!data.email.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Enter a valid email'
  }
  const digits = data.phone.replace(/\D/g, '')
  if (!digits) errors.phone = 'Phone number is required'
  else if (digits.length !== 10 && !(digits.length === 12 && digits.startsWith('91'))) {
    errors.phone = 'Enter a valid 10-digit mobile number'
  }
  return errors
}

export function PortfolioAccessGateModal({
  pendingProjectName,
  onValidated,
}: PortfolioAccessGateModalProps) {
  const [step, setStep] = useState<Step>('details')
  const [data, setData] = useState<FormState>({ name: '', email: '', phone: '' })
  const [otp, setOtp] = useState('')
  const [phoneMasked, setPhoneMasked] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    pauseSmoothScroll()
    return () => resumeSmoothScroll()
  }, [])

  useEffect(() => {
    if (resendIn <= 0) return
    const timer = window.setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [resendIn])

  const update = (key: keyof FormState, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined, submit: undefined }))
  }

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-slate-light',
      'focus:border-navy/30 focus:outline-none focus:ring-1 focus:ring-navy/10',
      hasError ? 'border-red-400' : 'border-border',
    )

  const sendOtp = async () => {
    const nextErrors = validateDetails(data)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    setErrors({})

    try {
      const result = await sendPortfolioWhatsAppOtp({
        name: data.name,
        email: data.email,
        phone: data.phone,
        projectName: pendingProjectName,
      })
      setPhoneMasked(result.phoneMasked)
      setResendIn(60)
      setOtp('')
      setStep('otp')
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Could not send WhatsApp code',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDetailsSubmit = (e: FormEvent) => {
    e.preventDefault()
    void sendOtp()
  }

  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!/^\d{6}$/.test(otp.trim())) {
      setErrors({ otp: 'Enter the 6-digit code' })
      return
    }

    setSubmitting(true)
    setErrors({})

    try {
      const profile = await verifyPortfolioWhatsAppOtp({
        phone: data.phone,
        otp: otp.trim(),
      })
      savePortfolioAccess(profile)
      onValidated()
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Verification failed',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div
      className="portfolio-access-gate fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <div className="portfolio-access-gate-backdrop absolute inset-0" aria-hidden />

      <div
        className="portfolio-access-gate-panel relative z-10 w-full max-w-sm px-7 py-8 sm:px-8 sm:py-9"
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-labelledby="portfolio-access-title"
      >
        <div className="mb-7 text-center">
          <h2
            id="portfolio-access-title"
            className="font-display text-xl font-semibold text-navy"
          >
            View our work
          </h2>
          <p className="mt-1.5 text-sm text-slate">
            {step === 'otp'
              ? `Enter the code sent to WhatsApp ${phoneMasked || 'your number'}.`
              : pendingProjectName
                ? `Verify via WhatsApp to watch ${pendingProjectName}.`
                : 'Verify via WhatsApp to continue.'}
          </p>
        </div>

        {step === 'details' ? (
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-navy">Name</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className={inputClass(!!errors.name)}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-navy">Email</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                className={inputClass(!!errors.email)}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-navy">WhatsApp number</label>
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+91 98765 43210"
                autoComplete="tel"
                className={inputClass(!!errors.phone)}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>

            {errors.submit && (
              <p className="text-center text-xs text-red-500">{errors.submit}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-lg bg-navy py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Sending code…' : 'Send WhatsApp code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-navy">Verification code</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  if (errors.otp || errors.submit) {
                    setErrors((prev) => ({ ...prev, otp: undefined, submit: undefined }))
                  }
                }}
                placeholder="6-digit code"
                className={cn(inputClass(!!errors.otp), 'tracking-[0.35em] text-center font-medium')}
              />
              {errors.otp && <p className="mt-1 text-xs text-red-500">{errors.otp}</p>}
            </div>

            {errors.submit && (
              <p className="text-center text-xs text-red-500">{errors.submit}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-lg bg-navy py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Verifying…' : 'Verify & continue'}
            </button>

            <div className="flex items-center justify-between gap-3 pt-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setStep('details')
                  setOtp('')
                  setErrors({})
                }}
                className="text-slate hover:text-navy"
              >
                Edit details
              </button>
              <button
                type="button"
                disabled={submitting || resendIn > 0}
                onClick={() => void sendOtp()}
                className="text-cyan font-medium hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}

        <p className="mt-4 text-center text-xs text-slate-light">
          We only use this to verify access and share portfolio updates.
        </p>
      </div>
    </div>,
    document.body,
  )
}
