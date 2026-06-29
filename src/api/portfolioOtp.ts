import { getSupabase, isSupabaseConfigured } from '../lib/supabase'

export interface PortfolioOtpSendPayload {
  name: string
  email: string
  phone: string
  projectName?: string | null
}

export interface PortfolioOtpSendResult {
  expiresIn: number
  phoneMasked: string
}

export interface PortfolioOtpVerifyPayload {
  phone: string
  otp: string
}

export interface PortfolioOtpVerifyResult {
  name: string
  email: string
  phone: string
  verifiedAt: string
}

type EdgeOk<T> = { ok: true } & T
type EdgeErr = { ok: false; error: string }

function parseEdgeError(error: unknown, data: unknown): string {
  if (data && typeof data === 'object' && 'error' in data) {
    const msg = (data as EdgeErr).error
    if (typeof msg === 'string' && msg.trim()) return msg
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message)
  }
  return 'Request failed'
}

export async function sendPortfolioWhatsAppOtp(
  payload: PortfolioOtpSendPayload,
): Promise<PortfolioOtpSendResult> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured')
  }

  const supabase = getSupabase()
  const { data, error } = await supabase.functions.invoke('portfolio-otp-send', {
    body: payload,
  })

  if (error || !data || !(data as EdgeOk<PortfolioOtpSendResult>).ok) {
    throw new Error(parseEdgeError(error, data))
  }

  const result = data as EdgeOk<PortfolioOtpSendResult>
  return {
    expiresIn: result.expiresIn,
    phoneMasked: result.phoneMasked,
  }
}

export async function verifyPortfolioWhatsAppOtp(
  payload: PortfolioOtpVerifyPayload,
): Promise<PortfolioOtpVerifyResult> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured')
  }

  const supabase = getSupabase()
  const { data, error } = await supabase.functions.invoke('portfolio-otp-verify', {
    body: payload,
  })

  if (error || !data || !(data as { ok?: boolean }).ok) {
    throw new Error(parseEdgeError(error, data))
  }

  const result = data as EdgeOk<{ profile: PortfolioOtpVerifyResult }>
  return result.profile
}
