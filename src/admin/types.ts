export interface CityRow {
  id: string
  name: string
  state: string | null
  sort_order: number
  is_active: boolean
}

export interface PortfolioItemRow {
  id: string
  name: string
  link: string
  thumbnail_path: string | null
  city_id: string | null
  media_type: 'video' | 'virtual-tour'
  category: string | null
  is_published: boolean
  sort_order: number
  created_at?: string
  updated_at?: string
  cities?: { name: string } | null
}

export interface TourFormValues {
  id: string
  name: string
  link: string
  city_id: string
  media_type: 'video' | 'virtual-tour'
  category: string
  is_published: boolean
  sort_order: number
}

export interface PortfolioStats {
  total: number
  videos: number
  virtualTours: number
  published: number
}

export interface CityWithCount extends CityRow {
  tour_count: number
}
