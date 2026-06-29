import { getSupabase } from '../lib/supabase'
import type { PortfolioPage, PortfolioQuery, PortfolioViewerPayload } from '../types/portfolio'

export async function fetchPortfolioPageFromSupabase(
  query: PortfolioQuery,
): Promise<PortfolioPage> {
  const supabase = getSupabase()

  const { data, error } = await supabase.rpc('get_portfolio_page', {
    p_page: query.page,
    p_page_size: query.pageSize,
    p_city: query.city || null,
    p_state: query.state || null,
    p_media_type: query.mediaType && query.mediaType !== 'all' ? query.mediaType : null,
    p_category: query.category || null,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data as PortfolioPage
}

export async function fetchPortfolioViewerFromSupabase(
  itemId: string,
): Promise<PortfolioViewerPayload | null> {
  const supabase = getSupabase()

  const { data, error } = await supabase.rpc('get_portfolio_viewer', {
    p_item_id: itemId,
  })

  if (error) {
    throw new Error(error.message)
  }

  return (data as PortfolioViewerPayload | null) ?? null
}
