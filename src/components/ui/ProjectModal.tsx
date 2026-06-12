import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMediaQuery, usePrefersReducedMotion } from '../../hooks/useMotion'
import type { Project } from '../../data/projects'

interface ProjectModalProps {
  project: Project | null
  onClose: () => void
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    if (!project) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [project, onClose])

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="absolute inset-0 bg-navy/90 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative w-full max-w-6xl max-h-[95vh] overflow-y-auto bg-white border border-border m-0 sm:m-6 rounded-none sm:rounded-xl"
            data-lenis-prevent
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-10 w-10 h-10 flex items-center justify-center text-slate hover:text-navy transition-colors"
              aria-label="Close project details"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>

            <div className="aspect-video w-full bg-navy-card overflow-hidden">
              <video
                src={project.videoUrl}
                poster={project.thumbnail}
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-8 sm:p-12 lg:p-16">
              <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
                <div>
                  <span className="text-[11px] tracking-[0.3em] uppercase text-cyan font-semibold">
                    {project.category} · {project.year}
                  </span>
                  <h2
                    id="modal-title"
                    className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mt-3 text-navy"
                  >
                    {project.title}
                  </h2>
                  <p className="text-slate mt-2 text-sm tracking-wide">
                    {project.location}
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
                <div className="lg:col-span-3">
                  <p className="text-slate text-lg leading-relaxed font-light">
                    {project.description}
                  </p>
                </div>
                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <h3 className="text-[11px] tracking-[0.3em] uppercase text-slate-light mb-3 font-semibold">
                      Client
                    </h3>
                    <p className="text-navy">{project.client}</p>
                  </div>
                  <div>
                    <h3 className="text-[11px] tracking-[0.3em] uppercase text-slate-light mb-3 font-semibold">
                      Services
                    </h3>
                    <ul className="space-y-2">
                      {project.services.map((s) => (
                        <li key={s} className="text-slate text-sm flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-cyan" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {project.images.length > 0 && (
                <div className="mt-16 grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {project.images.map((img, i) => (
                    <div
                      key={i}
                      className={`overflow-hidden bg-off-white ${
                        i === 0 ? 'col-span-2 lg:col-span-2 aspect-[16/9]' : 'aspect-square'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${project.title} visual ${i + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function CursorFollower() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const reducedMotion = usePrefersReducedMotion()
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    if (!isDesktop || reducedMotion) return

    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      setHovering(!!target.closest('a, button, [data-cursor="pointer"]'))
    }

    window.addEventListener('mousemove', move)
    document.addEventListener('mouseover', onOver)
    return () => {
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', onOver)
    }
  }, [isDesktop, reducedMotion])

  if (!isDesktop || reducedMotion) return null

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-cyan pointer-events-none z-[9999] mix-blend-difference"
        animate={{ x: pos.x - 4, y: pos.y - 4, scale: hovering ? 0.5 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-cyan/50 pointer-events-none z-[9998]"
        animate={{
          x: pos.x - 16,
          y: pos.y - 16,
          scale: hovering ? 1.8 : 1,
          opacity: hovering ? 0.6 : 0.3,
        }}
        transition={{ type: 'spring', stiffness: 150, damping: 20, mass: 0.8 }}
      />
    </>
  )
}
