export type PortfolioMediaType = 'video' | 'virtual-tour'

/** Slim shape expected from your backend API */
export interface PortfolioEntry {
  id: string
  name: string
  link: string
  thumbnail?: string | null
  city?: string | null
  state?: string | null
  mediaType: PortfolioMediaType
  category?: string | null
}

export interface PortfolioPage {
  items: PortfolioEntry[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  /** City name → count for filter dropdowns */
  cityCounts: Record<string, number>
  /** Video category → count (videos only) */
  categoryCounts: Record<string, number>
  /** State name → count for filter dropdowns */
  stateCounts: Record<string, number>
  /** City name → state name for cascading filters */
  cityStates: Record<string, string>
}

export interface PortfolioQuery {
  page: number
  pageSize: number
  city?: string
  state?: string
  mediaType?: PortfolioMediaType | 'all'
  category?: string
}
