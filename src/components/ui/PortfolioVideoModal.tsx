import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { fetchPortfolioViewer } from '../../api/portfolio'
import type { PortfolioEntry } from '../../types/portfolio'
import { pauseSmoothScroll, resumeSmoothScroll } from '../../lib/lenisControl'
import { getPortfolioViewerSrc } from '../../lib/portfolioViewer'

interface PortfolioVideoModalProps {
  entry: PortfolioEntry
  onClose: () => void
}

export function PortfolioVideoModal({ entry, onClose }: PortfolioVideoModalProps) {
  const [mediaReady, setMediaReady] = useState(false)
  const [viewer, setViewer] = useState<ReturnType<typeof getPortfolioViewerSrc>>(null)
  const [viewerError, setViewerError] = useState(false)

  const project = (entry.projectName ?? entry.name).trim()
  const builder = entry.builderName?.trim()
  const city = entry.city?.trim()
  const meta = [builder, city].filter(Boolean).join(' · ')
  const isVirtualTour = entry.mediaType === 'virtual-tour'

  useEffect(() => {
    let cancelled = false

    setMediaReady(false)
    setViewer(null)
    setViewerError(false)

    fetchPortfolioViewer(entry.id)
      .then((payload) => {
        if (cancelled) return
        if (!payload) {
          setViewerError(true)
          return
        }
        setViewer(getPortfolioViewerSrc(payload))
      })
      .catch(() => {
        if (!cancelled) setViewerError(true)
      })

    return () => {
      cancelled = true
    }
  }, [entry.id])

  useEffect(() => {
    pauseSmoothScroll()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      resumeSmoothScroll()
    }
  }, [onClose])

  return createPortal(
    <div
      className="portfolio-modal fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="portfolio-modal-backdrop absolute inset-0"
        aria-label="Close viewer"
        onClick={onClose}
      />

      <div
        className={`portfolio-modal-panel relative z-10 flex w-full flex-col overflow-hidden ${
          isVirtualTour ? 'max-w-6xl h-[min(90vh,900px)]' : 'max-w-5xl'
        }`}
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-labelledby="portfolio-video-modal-title"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border/60 bg-white px-4 py-4 sm:px-5">
          <div className="min-w-0 pr-2">
            <h2
              id="portfolio-video-modal-title"
              className="truncate font-display text-lg font-bold text-navy sm:text-xl"
            >
              {project}
            </h2>
            {meta && <p className="mt-1 truncate text-sm text-slate">{meta}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-off-white text-slate transition-colors hover:border-cyan/40 hover:text-navy"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        <div className={`relative w-full bg-[#0a0a0a] ${isVirtualTour ? 'min-h-0 flex-1' : ''}`}>
          {viewerError ? (
            <div
              className={`flex items-center justify-center px-6 text-center text-sm text-white/70 ${
                isVirtualTour ? 'min-h-[50vh] h-full' : 'aspect-video'
              }`}
            >
              Unable to load this project. Please try again later.
            </div>
          ) : (
            <>
              {(!viewer || !mediaReady) && (
                <div
                  className={`absolute inset-0 z-10 flex items-center justify-center bg-[#0a0a0a] ${
                    isVirtualTour ? '' : 'aspect-video'
                  }`}
                  aria-hidden
                >
                  <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-cyan" />
                </div>
              )}

              {viewer?.mode === 'native-video' ? (
                <video
                  key={entry.id}
                  src={viewer.src}
                  controls
                  playsInline
                  autoPlay
                  preload="metadata"
                  onLoadedData={() => setMediaReady(true)}
                  className={`w-full bg-black object-contain transition-opacity duration-200 ${
                    isVirtualTour ? 'h-full min-h-[50vh]' : 'aspect-video'
                  } ${mediaReady ? 'opacity-100' : 'opacity-0'}`}
                />
              ) : viewer ? (
                <iframe
                  key={entry.id}
                  src={viewer.src}
                  title={project}
                  onLoad={() => setMediaReady(true)}
                  className={`w-full border-0 bg-black transition-opacity duration-200 ${
                    isVirtualTour ? 'h-full min-h-[50vh]' : 'aspect-video'
                  } ${mediaReady ? 'opacity-100' : 'opacity-0'}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; xr-spatial-tracking"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
