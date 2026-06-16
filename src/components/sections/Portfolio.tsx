import { useEffect, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { metroCities } from '../../data/projects'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useGridColumns } from '../../hooks/useGridColumns'
import { parseMediaFilter } from '../../lib/portfolioNav'
import type { PortfolioEntry, PortfolioMediaType } from '../../types/portfolio'
import { PortfolioCard } from '../ui/PortfolioCard'
import { PortfolioVideoModal } from '../ui/PortfolioVideoModal'
import { openPortfolioEntry } from '../../lib/openPortfolioLink'

const ROW_GAP = 16
const ROW_HEIGHT_ESTIMATE = 168

export function Portfolio() {
  const [activeCity, setActiveCity] = useState<string>('All')
  const [mediaFilter, setMediaFilter] = useState<PortfolioMediaType | 'all'>(() =>
    parseMediaFilter(window.location.hash),
  )
  const [videoEntry, setVideoEntry] = useState<PortfolioEntry | null>(null)
  const [scrollMargin, setScrollMargin] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const columns = useGridColumns()

  useEffect(() => {
    const update = () => setScrollMargin(sectionRef.current?.offsetTop ?? 0)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const { items, cityCounts, total, hasMore, loading, loadingMore, error, loadMore, retry } =
    usePortfolio({ city: activeCity, mediaType: mediaFilter })

  useEffect(() => {
    const onHashChange = () => setMediaFilter(parseMediaFilter(window.location.hash))
    const onFilter = (e: Event) => {
      const filter = (e as CustomEvent<PortfolioMediaType>).detail
      setMediaFilter(filter)
    }
    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('portfolio-filter', onFilter)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('portfolio-filter', onFilter)
    }
  }, [])

  const handleOpen = (entry: PortfolioEntry) => {
    const result = openPortfolioEntry(entry)
    if (result === 'video-modal') setVideoEntry(entry)
  }

  const rowCount = Math.ceil(items.length / columns) || 0

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => document.documentElement,
    estimateSize: () => ROW_HEIGHT_ESTIMATE + ROW_GAP,
    overscan: 4,
    scrollMargin,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()

  useEffect(() => {
    const lastRow = virtualRows[virtualRows.length - 1]
    if (lastRow && lastRow.index >= rowCount - 2 && hasMore && !loading && !loadingMore) {
      loadMore()
    }
  }, [virtualRows, rowCount, hasMore, loading, loadingMore, loadMore])

  const getCityCount = (city: string) => {
    if (city === 'All') return total
    return cityCounts[city] ?? 0
  }

  return (
    <>
      <section
        id="portfolio"
        ref={sectionRef}
        className="relative z-0 pt-10 pb-12 lg:pt-12 lg:pb-16 bg-off-white overflow-hidden scroll-mt-24"
        aria-label="Portfolio"
      >
        <div className="w-full px-5 sm:px-8 lg:px-10 xl:px-14">
          <div
            className="flex flex-wrap gap-1.5 mb-6 lg:mb-8"
            role="tablist"
            aria-label="Filter by city"
          >
            {(['All', ...metroCities] as const).map((city) => {
              const isActive = activeCity === city
              const count = getCityCount(city)

              return (
                <button
                  key={city}
                  role="tab"
                  aria-selected={isActive}
                  disabled={loading && isActive}
                  onClick={() => setActiveCity(city)}
                  className={`px-3 py-1.5 rounded-full text-[10px] tracking-[0.08em] uppercase font-semibold transition-all duration-300 border ${
                    isActive
                      ? 'bg-navy text-white border-navy shadow-sm shadow-navy/20'
                      : 'bg-white text-slate border-border hover:border-cyan hover:text-cyan'
                  }`}
                  data-cursor="pointer"
                >
                  {city}
                  <span className={`ml-1 ${isActive ? 'text-cyan' : 'opacity-50'}`}>
                    ({count})
                  </span>
                </button>
              )
            })}
          </div>

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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
              {Array.from({ length: columns * 2 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] rounded-xl bg-navy/5 animate-pulse"
                  aria-hidden
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-slate py-12 text-sm">No projects in this city yet.</p>
          ) : (
            <div
              className="relative w-full"
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const rowIndex = virtualRow.index
                const start = rowIndex * columns

                return (
                  <div
                    key={virtualRow.key}
                    className="absolute left-0 w-full grid gap-3 lg:gap-4"
                    style={{
                      top: virtualRow.start - rowVirtualizer.options.scrollMargin,
                      height: virtualRow.size,
                      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: columns }).map((_, columnIndex) => {
                      const entry = items[start + columnIndex]
                      if (!entry) return <div key={columnIndex} aria-hidden />

                      return (
                        <PortfolioCard
                          key={entry.id}
                          entry={entry}
                          onOpen={handleOpen}
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}

          {loadingMore && (
            <p className="text-center text-slate/60 text-xs py-6">Loading more…</p>
          )}
        </div>
      </section>

      <PortfolioVideoModal entry={videoEntry} onClose={() => setVideoEntry(null)} />
    </>
  )
}
