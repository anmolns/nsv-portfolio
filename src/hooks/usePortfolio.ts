import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchPortfolioPage, PORTFOLIO_PAGE_SIZE } from '../api/portfolio'
import type { PortfolioEntry, PortfolioMediaType } from '../types/portfolio'

interface UsePortfolioOptions {
  city: string | null
  mediaType: PortfolioMediaType
  category: string | null
}

export function usePortfolio({ city, mediaType, category }: UsePortfolioOptions) {
  const [items, setItems] = useState<PortfolioEntry[]>([])
  const [cityCounts, setCityCounts] = useState<Record<string, number>>({})
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const loadPage = useCallback(
    async (nextPage: number, replace: boolean) => {
      const id = ++requestId.current
      replace ? setLoading(true) : setLoadingMore(true)
      setError(null)

      try {
        const result = await fetchPortfolioPage({
          page: nextPage,
          pageSize: PORTFOLIO_PAGE_SIZE,
          city: city ?? undefined,
          mediaType,
          category: category ?? undefined,
        })

        if (id !== requestId.current) return

        setItems((prev) => (replace ? result.items : [...prev, ...result.items]))
        setCityCounts(result.cityCounts)
        setCategoryCounts(result.categoryCounts ?? {})
        setTotal(result.total)
        setPage(result.page)
        setHasMore(result.hasMore)
      } catch (err) {
        if (id !== requestId.current) return
        setError(err instanceof Error ? err.message : 'Failed to load portfolio')
      } finally {
        if (id === requestId.current) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    },
    [category, city, mediaType],
  )

  useEffect(() => {
    setItems([])
    setPage(0)
    setHasMore(true)
    loadPage(1, true)
  }, [loadPage])

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return
    loadPage(page + 1, false)
  }, [hasMore, loadPage, loading, loadingMore, page])

  return {
    items,
    cityCounts,
    categoryCounts,
    total,
    hasMore,
    loading,
    loadingMore,
    error,
    loadMore,
    retry: () => loadPage(1, true),
  }
}
