import { useState } from 'react'
import { motion } from 'framer-motion'
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
  const isVideo = entry.mediaType === 'video'

  const handleEnter = () => {
    if (canHover) setFlipped(true)
  }

  const handleLeave = () => {
    if (canHover) setFlipped(false)
  }

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
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="w-full" style={{ perspective: '1000px' }}>
        <motion.div
          className="relative w-full aspect-[4/3] cursor-pointer rounded-2xl"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleClick}
          data-cursor="pointer"
        >
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden bg-navy shadow-md shadow-navy/10"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <img
              src={thumbnailSrc}
              alt=""
              width={PORTFOLIO_THUMB_WIDTH}
              height={PORTFOLIO_THUMB_HEIGHT}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setThumbnailSrc(GENERIC_PORTFOLIO_THUMBNAIL)}
            />
          </div>

          <div
            className="absolute inset-0 overflow-hidden rounded-2xl"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-navy-deep via-navy to-navy-card" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_110%,rgba(41,171,226,0.28),transparent_62%)]" />

            <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 py-4 text-center sm:px-5 sm:py-5">
              {entry.category && (
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-bright/90 sm:text-sm">
                  {entry.category}
                </p>
              )}

              <h3 className="font-display line-clamp-3 max-w-[96%] text-2xl font-extrabold leading-[1.12] tracking-[-0.02em] text-balance sm:text-3xl lg:text-[2rem] xl:text-[2.15rem]">
                <span className="bg-gradient-to-b from-white via-white to-cyan-bright/90 bg-clip-text text-transparent">
                  {entry.name}
                </span>
              </h3>

              <p className="mt-4 text-sm font-medium uppercase tracking-[0.22em] text-white/50 sm:text-base">
                {isVideo ? 'Watch' : 'Virtual Tour'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
