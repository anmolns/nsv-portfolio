import { getSupabase } from '../lib/supabase'
import type { PortfolioPage, PortfolioQuery } from '../types/portfolio'

export async function fetchPortfolioPageFromSupabase(
  query: PortfolioQuery,
): Promise<PortfolioPage> {
  const supabase = getSupabase()

  const { data, error } = await supabase.rpc('get_portfolio_page', {
    p_page: query.page,
    p_page_size: query.pageSize,
    p_city: query.city && query.city !== 'All' ? query.city : null,
    p_media_type: query.mediaType && query.mediaType !== 'all' ? query.mediaType : null,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data as PortfolioPage
}
