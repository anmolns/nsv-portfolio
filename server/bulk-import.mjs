/**
 * Local dev adapter — same API routes as Vercel (`/api/import-tour`, `/api/bulk-import/health`).
 * Used by Vite proxy during `npm run dev:all`.
 */

import http from 'node:http'

import { isImportConfigured } from '../api/_lib/config.mjs'
import { importOneTour } from '../api/_lib/import-one.mjs'
import { verifyAdmin } from '../api/_lib/auth.mjs'

const PORT = Number(process.env.IMPORT_PORT ?? 3001)

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

async function readJsonBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return null
  return JSON.parse(raw)
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = req.url?.split('?')[0]

  if (url === '/api/bulk-import/health' && req.method === 'GET') {
    const configured = isImportConfigured()
    sendJson(res, 200, { ok: configured, configured, runtime: 'local' })
    return
  }

  if (url === '/api/import-tour' && req.method === 'POST') {
    if (!isImportConfigured()) {
      sendJson(res, 503, {
        error: 'Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart npm run dev:import.',
      })
      return
    }

    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
    const auth = await verifyAdmin(token)
    if (!auth.ok) {
      sendJson(res, auth.status, { error: auth.message })
      return
    }

    let body
    try {
      body = await readJsonBody(req)
    } catch {
      sendJson(res, 400, { error: 'Invalid JSON body' })
      return
    }

    const { cityId, name, link, skipExisting = true } = body ?? {}
    if (!cityId || !link) {
      sendJson(res, 400, { error: 'cityId and link are required' })
      return
    }

    try {
      const result = await importOneTour({ cityId, name, link, skipExisting })
      sendJson(res, 200, result)
    } catch (err) {
      sendJson(res, 500, { error: err instanceof Error ? err.message : 'Import failed' })
    }
    return
  }

  sendJson(res, 404, { error: 'Not found' })
})

server.listen(PORT, () => {
  console.log(`\nImport API (local) → http://localhost:${PORT}`)
  console.log(`  GET  /api/bulk-import/health`)
  console.log(`  POST /api/import-tour`)
  if (!isImportConfigured()) {
    console.warn('\n  ⚠ SUPABASE_SERVICE_ROLE_KEY missing in .env.local\n')
  } else {
    console.log('\n  Ready — use npm run dev:all or deploy to Vercel for production\n')
  }
})
