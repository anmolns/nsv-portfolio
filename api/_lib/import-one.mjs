import { createClient } from '@supabase/supabase-js'

import { slugFromUrl } from '../../scripts/lib/tour-import-utils.mjs'
import { isImportConfigured, serviceRoleKey, supabaseUrl } from './config.mjs'
import { screenshotTourToBuffer } from './screenshot.mjs'

async function uniqueTourId(adminClient, base) {
  let candidate = base
  let n = 2
  while (true) {
    const { data } = await adminClient
      .from('portfolio_items')
      .select('id')
      .eq('id', candidate)
      .maybeSingle()
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

/**
 * Import a single tour: screenshot + Supabase storage + DB row.
 * @returns {{ status: 'done'|'skipped'|'error', id?: string, message?: string, name: string }}
 */
export async function importOneTour({ cityId, name, link, skipExisting = true }) {
  if (!isImportConfigured()) {
    throw new Error(
      'Import API not configured. Set SUPABASE_SERVICE_ROLE_KEY on the server (Vercel env vars).',
    )
  }

  const trimmedLink = link?.trim()
  const displayName = name?.trim()

  if (!trimmedLink?.startsWith('http')) {
    return { status: 'error', name: displayName || 'Unknown', message: 'Invalid link' }
  }

  const baseId = slugFromUrl(trimmedLink)
  const tourName = displayName || baseId
  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  const { data: existingByLink } = await adminClient
    .from('portfolio_items')
    .select('id, name')
    .eq('link', trimmedLink)
    .maybeSingle()

  if (existingByLink && skipExisting) {
    return {
      status: 'skipped',
      id: existingByLink.id,
      name: tourName,
      message: `Already exists as "${existingByLink.name}"`,
    }
  }

  const tourId = existingByLink?.id ?? (await uniqueTourId(adminClient, baseId))

  let thumbnailPath = null
  try {
    const buffer = await screenshotTourToBuffer(trimmedLink)
    thumbnailPath = `${tourId}.jpg`
    const { error: uploadError } = await adminClient.storage
      .from('tour-thumbs')
      .upload(thumbnailPath, buffer, {
        upsert: true,
        contentType: 'image/jpeg',
      })
    if (uploadError) throw new Error(uploadError.message)
  } catch (err) {
    return {
      status: 'error',
      id: tourId,
      name: tourName,
      message: `Screenshot failed: ${err.message}`,
    }
  }

  try {
    if (existingByLink) {
      const { error } = await adminClient
        .from('portfolio_items')
        .update({
          name: tourName,
          thumbnail_path: thumbnailPath,
          city_id: cityId,
        })
        .eq('id', tourId)
      if (error) throw new Error(error.message)
    } else {
      const sortOrder = await getNextSortOrder(adminClient)
      const { error } = await adminClient.from('portfolio_items').insert({
        id: tourId,
        name: tourName,
        link: trimmedLink,
        thumbnail_path: thumbnailPath,
        city_id: cityId,
        media_type: 'virtual-tour',
        is_published: true,
        sort_order: sortOrder,
      })
      if (error) throw new Error(error.message)
    }

    return { status: 'done', id: tourId, name: tourName }
  } catch (err) {
    return {
      status: 'error',
      id: tourId,
      name: tourName,
      message: `Save failed: ${err.message}`,
    }
  }
}
