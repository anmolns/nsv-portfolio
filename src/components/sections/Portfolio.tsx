import { useEffect, useMemo, useRef, useState } from 'react'

import { usePortfolio } from '../../hooks/usePortfolio'
import { parseMediaFilter } from '../../lib/portfolioNav'
import type { PortfolioEntry, PortfolioMediaType } from '../../types/portfolio'
import { PortfolioCard } from '../ui/PortfolioCard'
import { openPortfolioEntry } from '../../lib/openPortfolioLink'

const CARD_GRID = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6'

function FilterPill({
  label,
  count,
  isActive,
  disabled,
  onClick,
}: {
  label: string
  count?: number
  isActive: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.05em] transition-colors sm:px-4 sm:py-2 sm:text-sm ${
        isActive
          ? 'border-navy bg-navy text-white shadow-sm shadow-navy/20'
          : 'border-border bg-white text-slate hover:border-cyan hover:text-cyan'
      }`}
      data-cursor="pointer"
    >
      {label}
      {count !== undefined && (
        <span className={`ml-1 tabular-nums ${isActive ? 'text-cyan' : 'opacity-50'}`}>({count})</span>
      )}
    </button>
  )
}

export function Portfolio() {
  const [mediaFilter, setMediaFilter] = useState<PortfolioMediaType>(() =>
    parseMediaFilter(window.location.hash),
  )
  const [activeCity, setActiveCity] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const { items, cityCounts, categoryCounts, hasMore, loading, loadingMore, error, loadMore, retry } =
    usePortfolio({
      city: activeCity,
      mediaType: mediaFilter,
      category: activeCategory,
      requireCity: true,
    })

  useEffect(() => {
    const onHashChange = () => setMediaFilter(parseMediaFilter(window.location.hash))
    const onFilter = (e: Event) => {
      setMediaFilter((e as CustomEvent<PortfolioMediaType>).detail)
    }
    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('portfolio-filter', onFilter)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('portfolio-filter', onFilter)
    }
  }, [])

  useEffect(() => {
    setActiveCategory(null)
    setActiveCity(null)
  }, [mediaFilter])

  useEffect(() => {
    setActiveCategory(null)
  }, [activeCity])

  const filterCities = useMemo(
    () => Object.keys(cityCounts).sort((a, b) => a.localeCompare(b)),
    [cityCounts],
  )

  useEffect(() => {
    if (filterCities.length > 0 && !activeCity) {
      setActiveCity(filterCities[0])
    }
  }, [activeCity, filterCities])

  useEffect(() => {
    const sentinel = loadMoreRef.current
    if (!sentinel || !activeCity || !hasMore || loading || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: '400px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [activeCity, hasMore, loading, loadingMore, loadMore, items.length])

  const handleOpen = (entry: PortfolioEntry) => {
    openPortfolioEntry(entry)
  }

  const filterCategories = useMemo(
    () =>
      Object.keys(categoryCounts)
        .filter((c) => (categoryCounts[c] ?? 0) > 0)
        .sort((a, b) => a.localeCompare(b)),
    [categoryCounts],
  )

  const showCategoryFilter =
    activeCity && mediaFilter === 'video' && filterCategories.length > 0

  const emptyMessage = activeCategory
    ? 'No videos match this category.'
    : mediaFilter === 'video'
      ? 'No videos in this city yet.'
      : 'No virtual tours in this city yet.'

  return (
    <>
      <section
        id="portfolio"
        className="relative z-0 pt-10 pb-12 lg:pt-12 lg:pb-16 bg-off-white overflow-hidden scroll-mt-24"
        aria-label="Portfolio"
      >
        <div className="w-full px-5 sm:px-8 lg:px-10 xl:px-14">
          {filterCities.length > 0 && (
            <div className="mb-6 rounded-xl border border-border bg-white px-4 py-3.5 sm:px-5 sm:py-4">
              <div className="flex flex-col gap-3.5">
                <div
                  className="flex flex-wrap gap-2"
                  role="tablist"
                  aria-label="Filter by city"
                >
                  {filterCities.map((city) => (
                    <FilterPill
                      key={city}
                      label={city}
                      count={cityCounts[city] ?? 0}
                      isActive={activeCity === city}
                      disabled={loading && activeCity === city}
                      onClick={() => setActiveCity(city)}
                    />
                  ))}
                </div>

                {showCategoryFilter && (
                  <div
                    className="flex flex-wrap gap-2 border-t border-border/70 pt-3.5"
                    role="tablist"
                    aria-label="Filter by category"
                  >
                    <FilterPill
                      label="All"
                      count={activeCity ? (cityCounts[activeCity] ?? 0) : undefined}
                      isActive={!activeCategory}
                      disabled={loading}
                      onClick={() => setActiveCategory(null)}
                    />
                    {filterCategories.map((category) => (
                      <FilterPill
                        key={category}
                        label={category}
                        count={categoryCounts[category] ?? 0}
                        isActive={activeCategory === category}
                        disabled={loading && activeCategory === category}
                        onClick={() => setActiveCategory(category)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-slate">
              <span>{error}</span>
              <button
                type="button"
                onClick={retry}
                className="text-cyan font-semibold hover:underline"
                data-cursor="pointer"
              >
                Retry
              </button>
            </div>
          )}

          {loading && items.length === 0 ? (
            <div className={CARD_GRID}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] rounded-xl bg-navy/5 animate-pulse"
                  aria-hidden
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-slate py-12 text-sm">{emptyMessage}</p>
          ) : (
            <div className={CARD_GRID}>
              {items.map((entry) => (
                <PortfolioCard key={entry.id} entry={entry} onOpen={handleOpen} />
              ))}
            </div>
          )}

          <div ref={loadMoreRef} className="h-px" aria-hidden />

          {loadingMore && (
            <p className="text-center text-slate/60 text-xs py-6">Loading more…</p>
          )}
        </div>
      </section>
    </>
  )
}
