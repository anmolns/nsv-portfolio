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
          className={`portfolio-card-flipper portfolio-card-shell relative w-full aspect-[4/3] cursor-pointer lg:aspect-video${
            !canHover && flipped ? ' portfolio-card-flipped' : ''
          }`}
        >
          {/* Front */}
          <div
            className="portfolio-card-face portfolio-card-front absolute inset-0"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <div className="relative z-10 flex h-full min-h-0 flex-col items-center justify-center gap-4 px-4 py-5 text-center sm:gap-5 sm:px-5 max-lg:gap-1.5 max-lg:px-3 max-lg:py-4 max-lg:sm:gap-2">
              {builder && (
                <p className="line-clamp-2 text-[1.15rem] font-semibold uppercase leading-tight tracking-[0.14em] text-white/75 sm:text-[1.22rem] lg:text-[1.3rem] max-lg:text-[0.7rem] max-lg:leading-snug max-lg:tracking-[0.12em] max-lg:sm:text-xs max-lg:md:text-sm">
                  {builder}
                </p>
              )}

              <h3 className="font-display line-clamp-2 break-words text-[1.48rem] font-extrabold leading-[1.1] tracking-[-0.02em] text-white sm:text-[1.62rem] lg:text-[1.75rem] max-lg:text-base max-lg:leading-snug max-lg:tracking-tight max-lg:sm:text-lg max-lg:md:text-xl">
                {project}
              </h3>

              {city && (
                <p className="line-clamp-1 text-[1.18rem] font-normal tracking-wide text-white/70 sm:text-[1.26rem] lg:text-[1.32rem] max-lg:text-xs max-lg:sm:text-sm max-lg:md:text-base">
                  {city}
                </p>
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
              className="absolute inset-0 h-full w-full object-contain object-center"
              onError={() => setThumbnailSrc(GENERIC_PORTFOLIO_THUMBNAIL)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
