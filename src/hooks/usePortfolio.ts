import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchPortfolioPage, PORTFOLIO_PAGE_SIZE } from '../api/portfolio'
import type { PortfolioEntry, PortfolioMediaType } from '../types/portfolio'

interface UsePortfolioOptions {
  city: string | null
  mediaType: PortfolioMediaType
  category: string | null
  /** When true, items load only after a city is selected (counts still load upfront). */
  requireCity?: boolean
}

export function usePortfolio({ city, mediaType, category, requireCity = false }: UsePortfolioOptions) {
  const [items, setItems] = useState<PortfolioEntry[]>([])
  const [cityCounts, setCityCounts] = useState<Record<string, number>>({})
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const applyCounts = useCallback(
    (result: Awaited<ReturnType<typeof fetchPortfolioPage>>) => {
      setCityCounts(result.cityCounts)
      setCategoryCounts(result.categoryCounts ?? {})
    },
    [],
  )

  const loadCountsOnly = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    setItems([])
    setPage(0)
    setHasMore(false)
    setTotal(0)

    try {
      const result = await fetchPortfolioPage({
        page: 1,
        pageSize: 1,
        mediaType,
      })

      if (id !== requestId.current) return
      applyCounts(result)
    } catch (err) {
      if (id !== requestId.current) return
      setError(err instanceof Error ? err.message : 'Failed to load portfolio')
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [applyCounts, mediaType])

  const loadPage = useCallback(
    async (nextPage: number, replace: boolean) => {
      if (requireCity && !city) return

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
        applyCounts(result)
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
    [applyCounts, category, city, mediaType, requireCity],
  )

  useEffect(() => {
    if (requireCity && !city) {
      loadCountsOnly()
      return
    }
    setItems([])
    setPage(0)
    setHasMore(true)
    loadPage(1, true)
  }, [city, loadCountsOnly, loadPage, requireCity])

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore || (requireCity && !city)) return
    loadPage(page + 1, false)
  }, [city, hasMore, loadPage, loading, loadingMore, page, requireCity])

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
    retry: () => (requireCity && !city ? loadCountsOnly() : loadPage(1, true)),
  }
}
