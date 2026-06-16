export type PortfolioMediaType = 'video' | 'virtual-tour'

/** Slim shape expected from your backend API */
export interface PortfolioEntry {
  id: string
  name: string
  link: string
  thumbnail?: string | null
  city?: string | null
  mediaType: PortfolioMediaType
}

export interface PortfolioPage {
  items: PortfolioEntry[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  /** City slug/name → count for filter pills (computed server-side at scale) */
  cityCounts: Record<string, number>
}

export interface PortfolioQuery {
  page: number
  pageSize: number
  city?: string
  mediaType?: PortfolioMediaType | 'all'
}
