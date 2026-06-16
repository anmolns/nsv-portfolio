import { metroCities } from '../data/metroCities'
import importedTours from '../data/imported-tours.json'
import type { PortfolioEntry, PortfolioMediaType, PortfolioPage, PortfolioQuery } from '../types/portfolio'

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''
export const PORTFOLIO_PAGE_SIZE = 48

/** Local data until VITE_API_URL is set */
async function fetchPortfolioPageMock(query: PortfolioQuery): Promise<PortfolioPage> {
  await new Promise((r) => setTimeout(r, 120))

  let pool = (importedTours as PortfolioEntry[]).map((item) => ({
    ...item,
    mediaType: (item.mediaType ?? 'virtual-tour') as PortfolioMediaType,
  }))

  if (query.mediaType && query.mediaType !== 'all') {
    pool = pool.filter((item) => item.mediaType === query.mediaType)
  }

  const cityCounts: Record<string, number> = {}
  for (const city of metroCities) {
    cityCounts[city] = pool.filter((item) => item.city === city).length
  }

  if (query.city && query.city !== 'All') {
    pool = pool.filter((item) => item.city === query.city)
  }

  const start = (query.page - 1) * query.pageSize
  const items = pool.slice(start, start + query.pageSize)

  return {
    items,
    total: pool.length,
    page: query.page,
    pageSize: query.pageSize,
    hasMore: start + items.length < pool.length,
    cityCounts,
  }
}

/**
 * Paginated portfolio fetch.
 *
 * Backend contract (GET /portfolio):
 *   ?page=1&pageSize=48&city=Mumbai&mediaType=video
 *
 * Response JSON: PortfolioPage
 */
export async function fetchPortfolioPage(query: PortfolioQuery): Promise<PortfolioPage> {
  if (!API_BASE) {
    return fetchPortfolioPageMock(query)
  }

  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  })

  if (query.city && query.city !== 'All') {
    params.set('city', query.city)
  }

  if (query.mediaType && query.mediaType !== 'all') {
    params.set('mediaType', query.mediaType)
  }

  const response = await fetch(`${API_BASE}/portfolio?${params}`)

  if (!response.ok) {
    throw new Error(`Portfolio request failed (${response.status})`)
  }

  return response.json() as Promise<PortfolioPage>
}
