import { useState } from 'react'
import {
  GENERIC_PORTFOLIO_THUMBNAIL,
  getPortfolioThumbnail,
  PORTFOLIO_THUMB_HEIGHT,
  PORTFOLIO_THUMB_WIDTH,
} from '../../lib/portfolioMedia'
import { useMediaQuery } from '../../hooks/useMotion'
import type { PortfolioEntry } from '../../types/portfolio'

export function PortfolioCard({
  entry,
  onOpen,
}: {
  entry: PortfolioEntry
  onOpen: (entry: PortfolioEntry) => void
}) {
  const [flipped, setFlipped] = useState(false)
  const [thumbnailSrc, setThumbnailSrc] = useState(() =>
    getPortfolioThumbnail(entry.thumbnail),
  )
  const canHover = useMediaQuery('(hover: hover)')

  const builder = entry.builderName?.trim()
  const project = (entry.projectName ?? entry.name).trim()
  const city = entry.city?.trim()

  const handleClick = () => {
    if (!canHover) {
      if (!flipped) {
        setFlipped(true)
        return
      }
    }
    onOpen(entry)
  }

  return (
    <div
      className="portfolio-card group w-full [content-visibility:auto]"
      onClick={handleClick}
      data-cursor="pointer"
    >
      <div className="portfolio-card-perspective w-full">
        <div
          className={`portfolio-card-flipper portfolio-card-shell relative w-full aspect-[3/2] cursor-pointer${
            !canHover && flipped ? ' portfolio-card-flipped' : ''
          }`}
        >
          {/* Front */}
          <div
            className="portfolio-card-face portfolio-card-front absolute inset-0 overflow-hidden"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <div className="portfolio-card-bottom-curve" aria-hidden />

            <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2.5 px-4 py-5 text-center sm:gap-3 sm:px-5">
              {builder && (
                <p className="line-clamp-2 text-[1.18rem] font-bold uppercase leading-tight tracking-[0.1em] text-white sm:text-[1.28rem] lg:text-[1.38rem]">
                  {builder}
                </p>
              )}

              <h3 className="font-display line-clamp-2 text-[0.98rem] font-medium leading-snug tracking-[-0.01em] text-white/90 sm:text-[1.06rem] lg:text-[1.12rem]">
                {project}
              </h3>

              {city && (
                <span className="portfolio-card-city-badge mt-1 line-clamp-1">
                  {city}
                </span>
              )}
            </div>
          </div>

          {/* Back — thumbnail only */}
          <div
            className="portfolio-card-face absolute inset-0 overflow-hidden bg-navy"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <img
              src={thumbnailSrc}
              alt=""
              width={PORTFOLIO_THUMB_WIDTH}
              height={PORTFOLIO_THUMB_HEIGHT}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => setThumbnailSrc(GENERIC_PORTFOLIO_THUMBNAIL)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
