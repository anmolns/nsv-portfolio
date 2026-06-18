import { isImportConfigured } from '../_lib/config.mjs'

export default function handler(_req, res) {
  const configured = isImportConfigured()
  return res.status(200).json({
    ok: configured,
    configured,
    runtime: process.env.VERCEL ? 'vercel' : 'local',
  })
}
