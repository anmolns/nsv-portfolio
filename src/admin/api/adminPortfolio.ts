import { slugify } from '../../lib/utils'
import { getSupabase } from '../../lib/supabase'
import type {
  CityRow,
  CityWithCount,
  PortfolioItemRow,
  PortfolioStats,
} from '../types'

export async function fetchAdminCities(): Promise<CityRow[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('cities')
    .select('id, name, sort_order, is_active')
    .eq('is_active', true)
    .order('name')

  if (error) throw new Error(error.message)
  return (data ?? []) as CityRow[]
}

export async function createCity(name: string): Promise<CityRow> {
  const supabase = getSupabase()
  const trimmed = name.trim()
  if (!trimmed) throw new Error('City name is required')

  const { data: existing, error: findError } = await supabase
    .from('cities')
    .select('id, name, sort_order, is_active')
    .ilike('name', trimmed)
    .maybeSingle()

  if (findError) throw new Error(findError.message)
  if (existing) return existing as CityRow

  const { data: lastCity, error: sortError } = await supabase
    .from('cities')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (sortError) throw new Error(sortError.message)

  const { data, error } = await supabase
    .from('cities')
    .insert({
      name: trimmed,
      sort_order: (lastCity?.sort_order ?? 0) + 1,
      is_active: true,
    })
    .select('id, name, sort_order, is_active')
    .single()

  if (error) throw new Error(error.message)
  return data as CityRow
}

export async function fetchAdminTours(): Promise<PortfolioItemRow[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*, cities(name)')
    .order('sort_order')
    .order('name')

  if (error) throw new Error(error.message)
  return (data ?? []) as PortfolioItemRow[]
}

export async function fetchAdminTour(id: string): Promise<PortfolioItemRow | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*, cities(name)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as PortfolioItemRow | null
}

export async function fetchPortfolioStats(): Promise<PortfolioStats> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('media_type, is_published')

  if (error) throw new Error(error.message)

  const rows = (data ?? []) as Pick<PortfolioItemRow, 'media_type' | 'is_published'>[]
  return {
    total: rows.length,
    videos: rows.filter((r) => r.media_type === 'video').length,
    virtualTours: rows.filter((r) => r.media_type === 'virtual-tour').length,
    published: rows.filter((r) => r.is_published).length,
  }
}

export async function createTour(
  item: Omit<PortfolioItemRow, 'created_at' | 'updated_at' | 'cities'>,
): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.from('portfolio_items').insert(item)
  if (error) throw new Error(error.message)
}

export async function updateTour(
  id: string,
  item: Partial<Omit<PortfolioItemRow, 'id' | 'created_at' | 'updated_at' | 'cities'>>,
): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.from('portfolio_items').update(item).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteTour(id: string): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.from('portfolio_items').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function uploadTourThumbnail(id: string, file: File): Promise<string> {
  const supabase = getSupabase()
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${id}.${ext}`

  const { error } = await supabase.storage.from('tour-thumbs').upload(path, file, {
    upsert: true,
    contentType: file.type,
  })

  if (error) throw new Error(error.message)
  return path
}

export async function deleteTourThumbnail(path: string): Promise<void> {
  const supabase = getSupabase()
  const normalized = path.replace(/^\/+/, '').replace(/^tour-thumbs\//, '')
  if (!normalized) return
  await supabase.storage.from('tour-thumbs').remove([normalized])
}

export async function fetchAllAdminCities(): Promise<CityWithCount[]> {
  const supabase = getSupabase()
  const [{ data: cities, error: citiesError }, { data: tours, error: toursError }] =
    await Promise.all([
      supabase
        .from('cities')
        .select('id, name, sort_order, is_active')
        .order('sort_order')
        .order('name'),
      supabase.from('portfolio_items').select('city_id'),
    ])

  if (citiesError) throw new Error(citiesError.message)
  if (toursError) throw new Error(toursError.message)

  const counts: Record<string, number> = {}
  for (const row of tours ?? []) {
    if (row.city_id) counts[row.city_id] = (counts[row.city_id] ?? 0) + 1
  }

  return ((cities ?? []) as CityRow[]).map((city) => ({
    ...city,
    tour_count: counts[city.id] ?? 0,
  }))
}

export async function setCityActive(id: string, isActive: boolean): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.from('cities').update({ is_active: isActive }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function reorderTours(orderedIds: string[]): Promise<void> {
  const supabase = getSupabase()
  const updates = orderedIds.map((id, index) =>
    supabase.from('portfolio_items').update({ sort_order: index }).eq('id', id),
  )
  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) throw new Error(failed.error.message)
}

async function uniqueTourId(base: string): Promise<string> {
  let candidate = base
  let n = 2
  while (await fetchAdminTour(candidate)) {
    candidate = `${base}-${n}`
    n++
  }
  return candidate
}

export async function duplicateTour(id: string): Promise<string> {
  const tour = await fetchAdminTour(id)
  if (!tour) throw new Error('Tour not found')

  const baseId = slugify(`${tour.id}-copy`)
  const newId = await uniqueTourId(baseId)
  const supabase = getSupabase()

  let thumbnailPath: string | null = null
  if (tour.thumbnail_path) {
    const normalized = tour.thumbnail_path.replace(/^\/+/, '').replace(/^tour-thumbs\//, '')
    const ext = normalized.split('.').pop() || 'jpg'
    const newPath = `${newId}.${ext}`
    const { data: blob, error: dlError } = await supabase.storage
      .from('tour-thumbs')
      .download(normalized)

    if (blob && !dlError) {
      const { error: upError } = await supabase.storage
        .from('tour-thumbs')
        .upload(newPath, blob, { upsert: true })
      if (!upError) thumbnailPath = newPath
    }
  }

  const { data: last } = await supabase
    .from('portfolio_items')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  await createTour({
    id: newId,
    name: `${tour.name} (Copy)`,
    link: tour.link,
    thumbnail_path: thumbnailPath,
    city_id: tour.city_id,
    media_type: tour.media_type,
    is_published: false,
    sort_order: (last?.sort_order ?? 0) + 1,
  })

  return newId
}
