import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ ok: false, error: message }, status)
}

/** Normalize Indian mobile numbers to E.164 (+91XXXXXXXXXX). */
export function normalizeIndianPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  if (digits.length === 13 && digits.startsWith('091')) return `+91${digits.slice(3)}`
  return null
}

export function generateOtp(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000
  return String(n).padStart(6, '0')
}

export async function hashOtp(otp: string, phoneE164: string): Promise<string> {
  const secret = Deno.env.get('OTP_HASH_SECRET')
  if (!secret) throw new Error('OTP_HASH_SECRET is not configured')

  const data = new TextEncoder().encode(`${secret}:${phoneE164}:${otp}`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

interface MetaApiError {
  error?: {
    message?: string
    type?: string
    code?: number
    error_subcode?: number
  }
}

/**
 * Send OTP via Meta WhatsApp Cloud API (official).
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates
 */
export async function sendWhatsAppOtp(phoneE164: string, otp: string): Promise<void> {
  const devMode = Deno.env.get('WHATSAPP_DEV_MODE') === 'true'
  const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')

  if (devMode) {
    console.log(`[portfolio-otp][dev] WhatsApp OTP for ${phoneE164}: ${otp}`)
    return
  }

  if (!accessToken || !phoneNumberId) {
    throw new Error(
      'WhatsApp Cloud API is not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in Edge Function secrets.',
    )
  }

  const apiVersion = Deno.env.get('WHATSAPP_GRAPH_API_VERSION') ?? 'v21.0'
  const templateName = Deno.env.get('WHATSAPP_OTP_TEMPLATE') ?? 'portfolio_access_otp'
  const templateLanguage = Deno.env.get('WHATSAPP_TEMPLATE_LANGUAGE') ?? 'en'
  const templateType = (Deno.env.get('WHATSAPP_OTP_TEMPLATE_TYPE') ?? 'authentication').toLowerCase()
  const includeCopyButton = Deno.env.get('WHATSAPP_OTP_COPY_BUTTON') !== 'false'

  const to = phoneE164.replace(/\D/g, '')
  const template = buildWhatsAppTemplate({
    templateName,
    templateLanguage,
    templateType,
    otp,
    includeCopyButton,
  })

  const res = await fetch(
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'template',
        template,
      }),
    },
  )

  const payload = (await res.json().catch(() => ({}))) as MetaApiError

  if (!res.ok) {
    const detail =
      payload.error?.message ??
      `HTTP ${res.status} from WhatsApp Cloud API`
    throw new Error(`WhatsApp Cloud API: ${detail}`)
  }
}

function buildWhatsAppTemplate(opts: {
  templateName: string
  templateLanguage: string
  templateType: string
  otp: string
  includeCopyButton: boolean
}) {
  const { templateName, templateLanguage, templateType, otp, includeCopyButton } = opts

  const base = {
    name: templateName,
    language: { code: templateLanguage },
  }

  // Official Authentication OTP templates (category: AUTHENTICATION)
  if (templateType === 'authentication') {
    const components: Record<string, unknown>[] = [
      {
        type: 'body',
        parameters: [{ type: 'text', text: otp }],
      },
    ]

    if (includeCopyButton) {
      components.push({
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [{ type: 'text', text: otp }],
      })
    }

    return { ...base, components }
  }

  // Utility template with one body variable {{1}}
  return {
    ...base,
    components: [
      {
        type: 'body',
        parameters: [{ type: 'text', text: otp }],
      },
    ],
  }
}

export function createServiceClient() {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) throw new Error('Supabase service role is not configured')

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
