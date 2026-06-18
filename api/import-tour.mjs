import { verifyAdmin } from './_lib/auth.mjs'
import { isImportConfigured } from './_lib/config.mjs'
import { importOneTour } from './_lib/import-one.mjs'

export const config = {
  maxDuration: 60,
  memory: 1024,
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isImportConfigured()) {
    return res.status(503).json({
      error:
        'Import API not configured. Add SUPABASE_SERVICE_ROLE_KEY to Vercel environment variables.',
    })
  }

  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  const auth = await verifyAdmin(token)
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.message })
  }

  const { cityId, name, link, skipExisting = true } = req.body ?? {}
  if (!cityId || !link) {
    return res.status(400).json({ error: 'cityId and link are required' })
  }

  try {
    const result = await importOneTour({ cityId, name, link, skipExisting })
    return res.status(200).json(result)
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Import failed',
    })
  }
}
