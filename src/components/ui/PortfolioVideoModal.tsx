import { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PortfolioEntry } from '../../types/portfolio'
import { getPortfolioViewerSrc } from '../../lib/portfolioViewer'

interface PortfolioVideoModalProps {
  entry: PortfolioEntry | null
  onClose: () => void
}

export function PortfolioVideoModal({ entry, onClose }: PortfolioVideoModalProps) {
  const viewer = useMemo(
    () => (entry ? getPortfolioViewerSrc(entry) : null),
    [entry],
  )

  useEffect(() => {
    if (!entry) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [entry, onClose])

  const isVirtualTour = entry?.mediaType === 'virtual-tour'

  return (
    <AnimatePresence>
      {entry && viewer && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 bg-navy/90 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className={`relative w-full bg-navy rounded-xl overflow-hidden border border-white/10 flex flex-col ${
              isVirtualTour ? 'max-w-6xl h-[min(90vh,900px)]' : 'max-w-5xl'
            }`}
            data-lenis-prevent
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="portfolio-video-modal-title"
          >
            <div className="flex items-center justify-between gap-4 px-4 sm:px-5 py-3 border-b border-white/10 shrink-0">
              <h2
                id="portfolio-video-modal-title"
                className="font-display text-base sm:text-lg font-bold text-white truncate"
              >
                {entry.name}
              </h2>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white transition-colors shrink-0"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>

            {viewer.mode === 'native-video' ? (
              <video
                key={entry.id}
                src={viewer.src}
                controls
                playsInline
                autoPlay
                preload="metadata"
                className="w-full aspect-video bg-black object-contain"
              />
            ) : (
              <iframe
                key={entry.id}
                src={viewer.src}
                title={entry.name}
                className={`w-full bg-black border-0 ${
                  isVirtualTour ? 'flex-1 min-h-0' : 'aspect-video'
                }`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; xr-spatial-tracking"
                allowFullScreen
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
