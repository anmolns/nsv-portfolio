import { metroCities } from '../data/metroCities'
import { isSupabaseConfigured } from '../lib/supabase'
import { fetchPortfolioPageFromSupabase } from './portfolio.supabase'
import type { PortfolioPage, PortfolioQuery } from '../types/portfolio'

export const PORTFOLIO_PAGE_SIZE = 48

function emptyCityCounts(): Record<string, number> {
  return Object.fromEntries(metroCities.map((city) => [city, 0]))
}

/** Empty portfolio when Supabase is not configured yet */
async function fetchPortfolioPageEmpty(query: PortfolioQuery): Promise<PortfolioPage> {
  await new Promise((r) => setTimeout(r, 80))

  return {
    items: [],
    total: 0,
    page: query.page,
    pageSize: query.pageSize,
    hasMore: false,
    cityCounts: emptyCityCounts(),
    categoryCounts: {},
  }
}

export async function fetchPortfolioPage(query: PortfolioQuery): Promise<PortfolioPage> {
  if (isSupabaseConfigured()) {
    return fetchPortfolioPageFromSupabase(query)
  }

  return fetchPortfolioPageEmpty(query)
}
