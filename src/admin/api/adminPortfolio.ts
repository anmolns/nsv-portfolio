import { getSupabase } from '../../lib/supabase'
import type { CityRow, PortfolioItemRow, PortfolioStats } from '../types'

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
