/**
 * Local bulk-import API — Playwright screenshots + Supabase writes.
 *
 * Requires in .env.local:
 *   VITE_SUPABASE_URL (or SUPABASE_URL)
 *   VITE_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   npm run dev:import        # this server only
 *   npm run dev:all           # Vite + import server
 *
 * Admin UI: /admin/bulk-upload (proxied via Vite in dev)
 */

import http from 'node:http'
import { createClient } from '@supabase/supabase-js'
import { slugFromUrl } from '../scripts/lib/tour-import-utils.mjs'
import { launchTourBrowser, screenshotTourToBuffer } from '../scripts/lib/tour-screenshot.mjs'

const PORT = Number(process.env.IMPORT_PORT ?? 3001)

const supabaseUrl = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '')
const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

function sendSse(res, event, data) {
  res.write(`event: ${event}\n`)
  res.write(`data: ${JSON.stringify(data)}\n\n`)
}

async function readJsonBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return null
  return JSON.parse(raw)
}

async function verifyAdmin(token) {
  if (!token) return { ok: false, status: 401, message: 'Missing authorization token' }

  const authClient = createClient(supabaseUrl, anonKey)
  const { data, error } = await authClient.auth.getUser(token)
  if (error || !data.user) {
    return { ok: false, status: 401, message: 'Invalid or expired session' }
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey)
  const { data: adminRow, error: adminError } = await adminClient
    .from('admin_users')
    .select('user_id')
    .eq('user_id', data.user.id)
    .maybeSingle()

  if (adminError || !adminRow) {
    return { ok: false, status: 403, message: 'Not authorized for admin bulk import' }
  }

  return { ok: true, userId: data.user.id }
}

async function uniqueTourId(adminClient, base) {
  let candidate = base
  let n = 2
  while (true) {
    const { data } = await adminClient.from('portfolio_items').select('id').eq('id', candidate).maybeSingle()
    if (!data) return candidate
    candidate = `${base}-${n}`
    n++
  }
}

async function getNextSortOrder(adminClient) {
  const { data } = await adminClient
    .from('portfolio_items')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data?.sort_order ?? 0) + 1
}

async function processBulkImport(req, res) {
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    sendJson(res, 503, {
      error:
        'Import server not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart npm run dev:import.',
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

  const { cityId, rows, skipExisting = true } = body ?? {}
  if (!cityId || !Array.isArray(rows) || rows.length === 0) {
    sendJson(res, 400, { error: 'cityId and rows[] are required' })
    return
  }

  if (rows.length > 500) {
    sendJson(res, 400, { error: 'Maximum 500 rows per import' })
    return
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  })

  const adminClient = createClient(supabaseUrl, serviceRoleKey)
  let sortOrder = await getNextSortOrder(adminClient)
  let success = 0
  let failed = 0
  let skipped = 0

  sendSse(res, 'start', { total: rows.length })

  let browser
  let page
  try {
    ;({ browser, page } = await launchTourBrowser())
  } catch (err) {
    sendSse(res, 'fatal', {
      message: `Could not launch browser. Run: npx playwright install chromium — ${err.message}`,
    })
    res.end()
    return
  }

  try {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const link = row.link?.trim()
      const name = row.name?.trim()

      if (!link?.startsWith('http')) {
        failed++
        sendSse(res, 'item', {
          index: i + 1,
          total: rows.length,
          name: name || `Row ${i + 1}`,
          status: 'error',
          message: 'Invalid link',
        })
        continue
      }

      const baseId = slugFromUrl(link)
      const displayName = name || baseId

      sendSse(res, 'item', {
        index: i + 1,
        total: rows.length,
        name: displayName,
        status: 'checking',
      })

      const { data: existingByLink } = await adminClient
        .from('portfolio_items')
        .select('id, name')
        .eq('link', link)
        .maybeSingle()

      if (existingByLink && skipExisting) {
        skipped++
        sendSse(res, 'item', {
          index: i + 1,
          total: rows.length,
          name: displayName,
          status: 'skipped',
          message: `Already exists as "${existingByLink.name}"`,
          id: existingByLink.id,
        })
        continue
      }

      const tourId = existingByLink?.id ?? (await uniqueTourId(adminClient, baseId))

      sendSse(res, 'item', {
        index: i + 1,
        total: rows.length,
        name: displayName,
        status: 'screenshot',
        id: tourId,
      })

      let thumbnailPath = null
      try {
        const buffer = await screenshotTourToBuffer(page, link)
        thumbnailPath = `${tourId}.jpg`
        const { error: uploadError } = await adminClient.storage
          .from('tour-thumbs')
          .upload(thumbnailPath, buffer, {
            upsert: true,
            contentType: 'image/jpeg',
          })
        if (uploadError) throw new Error(uploadError.message)
      } catch (err) {
        failed++
        sendSse(res, 'item', {
          index: i + 1,
          total: rows.length,
          name: displayName,
          status: 'error',
          message: `Screenshot failed: ${err.message}`,
          id: tourId,
        })
        continue
      }

      sendSse(res, 'item', {
        index: i + 1,
        total: rows.length,
        name: displayName,
        status: 'saving',
        id: tourId,
      })

      try {
        if (existingByLink) {
          const { error } = await adminClient
            .from('portfolio_items')
            .update({
              name: displayName,
              thumbnail_path: thumbnailPath,
              city_id: cityId,
            })
            .eq('id', tourId)
          if (error) throw new Error(error.message)
        } else {
          const { error } = await adminClient.from('portfolio_items').insert({
            id: tourId,
            name: displayName,
            link,
            thumbnail_path: thumbnailPath,
            city_id: cityId,
            media_type: 'virtual-tour',
            is_published: true,
            sort_order: sortOrder++,
          })
          if (error) throw new Error(error.message)
        }

        success++
        sendSse(res, 'item', {
          index: i + 1,
          total: rows.length,
          name: displayName,
          status: 'done',
          id: tourId,
        })
      } catch (err) {
        failed++
        sendSse(res, 'item', {
          index: i + 1,
          total: rows.length,
          name: displayName,
          status: 'error',
          message: `Save failed: ${err.message}`,
          id: tourId,
        })
      }
    }
  } finally {
    await browser.close()
  }

  sendSse(res, 'complete', { success, failed, skipped, total: rows.length })
  res.end()
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

  if (req.url === '/api/bulk-import/health' && req.method === 'GET') {
    sendJson(res, 200, {
      ok: Boolean(supabaseUrl && serviceRoleKey),
      configured: Boolean(supabaseUrl && serviceRoleKey),
    })
    return
  }

  if (req.url === '/api/bulk-import' && req.method === 'POST') {
    await processBulkImport(req, res)
    return
  }

  sendJson(res, 404, { error: 'Not found' })
})

server.listen(PORT, () => {
  console.log(`\nBulk import server → http://localhost:${PORT}`)
  console.log(`  Health:  GET  /api/bulk-import/health`)
  console.log(`  Import:  POST /api/bulk-import`)
  if (!serviceRoleKey) {
    console.warn('\n  ⚠ SUPABASE_SERVICE_ROLE_KEY missing — add it to .env.local\n')
  } else {
    console.log('\n  Ready. Run npm run dev and open /admin/bulk-upload\n')
  }
})
