import { useEffect, useMemo, useRef, useState } from 'react'

import { usePortfolio } from '../../hooks/usePortfolio'
import { parseMediaFilter } from '../../lib/portfolioNav'
import type { PortfolioEntry, PortfolioMediaType } from '../../types/portfolio'
import { PortfolioCard } from '../ui/PortfolioCard'
import { openPortfolioEntry } from '../../lib/openPortfolioLink'

const CARD_GRID = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6'

const selectClass =
  'w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-navy focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 disabled:opacity-60'

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
      className={`px-4 py-2 rounded-full text-[11px] sm:text-xs tracking-[0.08em] uppercase font-semibold transition-all duration-300 border ${
        isActive
          ? 'bg-navy text-white border-navy shadow-sm shadow-navy/20'
          : 'bg-white text-slate border-border hover:border-cyan hover:text-cyan'
      }`}
      data-cursor="pointer"
    >
      {label}
      {count !== undefined && (
        <span className={`ml-1 ${isActive ? 'text-cyan' : 'opacity-50'}`}>({count})</span>
      )}
    </button>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
}) {
  return (
    <div className="min-w-0 flex-1 sm:flex-none sm:w-[min(100%,280px)]">
      <label className="block text-[10px] uppercase tracking-[0.2em] text-slate font-semibold mb-2">
        {label}
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={selectClass}
      >
        {options.map((opt) => (
          <option key={opt.value || '__all__'} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
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

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'All categories' },
      ...filterCategories.map((category) => ({
        value: category,
        label: `${category} (${categoryCounts[category] ?? 0})`,
      })),
    ],
    [categoryCounts, filterCategories],
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
            <div className="mb-6 lg:mb-8 space-y-4">
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
                <FilterSelect
                  label="Category"
                  value={activeCategory ?? ''}
                  disabled={loading}
                  onChange={(value) => setActiveCategory(value || null)}
                  options={categoryOptions}
                />
              )}
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
