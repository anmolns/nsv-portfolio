import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects, metroCities, type Project, type ProjectMediaType } from '../../data/projects'
import { parseMediaFilter } from '../../lib/portfolioNav'
import { ProjectModal, VirtualTourModal } from '../ui/ProjectModal'
import { useMediaQuery } from '../../hooks/useMotion'

gsap.registerPlugin(ScrollTrigger)

function PortfolioCard({
  project,
  onOpen,
}: {
  project: Project
  onOpen: (p: Project) => void
}) {
  const [flipped, setFlipped] = useState(false)
  const canHover = useMediaQuery('(hover: hover)')

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
    onOpen(project)
  }

  return (
    <div
      className="portfolio-card group w-full"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="w-full" style={{ perspective: '1000px' }}>
        <motion.div
          className="relative w-full aspect-[4/3] cursor-pointer rounded-xl"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleClick}
          data-cursor="pointer"
        >
          <div
            className="absolute inset-0 rounded-xl overflow-hidden bg-navy shadow-sm shadow-navy/5"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <img
              src={project.thumbnail}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <div
            className="absolute inset-0 rounded-xl overflow-hidden bg-navy border border-cyan/25 flex items-center justify-center p-4"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <h3 className="font-display text-xs sm:text-sm font-bold text-white text-center leading-snug line-clamp-3">
              {project.title}
            </h3>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export function Portfolio() {
  const [activeCity, setActiveCity] = useState<string>('All')
  const [mediaFilter, setMediaFilter] = useState<ProjectMediaType | 'all'>(() =>
    parseMediaFilter(window.location.hash),
  )
  const [selectedVideo, setSelectedVideo] = useState<Project | null>(null)
  const [selectedTour, setSelectedTour] = useState<Project | null>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onHashChange = () => setMediaFilter(parseMediaFilter(window.location.hash))
    const onFilter = (e: Event) => {
      const filter = (e as CustomEvent<ProjectMediaType>).detail
      setMediaFilter(filter)
    }
    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('portfolio-filter', onFilter)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('portfolio-filter', onFilter)
    }
  }, [])

  const filteredByMedia =
    mediaFilter === 'all'
      ? projects
      : projects.filter((p) => p.mediaType === mediaFilter)

  const filtered =
    activeCity === 'All'
      ? filteredByMedia
      : filteredByMedia.filter((p) => p.city === activeCity)

  const handleOpen = (project: Project) => {
    if (project.mediaType === 'virtual-tour') {
      setSelectedTour(project)
      return
    }
    setSelectedVideo(project)
  }

  useEffect(() => {
    const tabs = tabsRef.current
    if (!tabs) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        tabs.children,
        { y: 16 },
        {
          y: 0,
          duration: 0.6,
          stagger: 0.04,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: tabs,
            start: 'top 92%',
            once: true,
          },
        },
      )
    })

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const cards = grid.querySelectorAll('.portfolio-card')

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: { each: 0.05, from: 'start' },
          ease: 'power3.out',
          overwrite: true,
        },
      )
    }, grid)

    return () => ctx.revert()
  }, [activeCity, mediaFilter])

  return (
    <>
      <section
        id="portfolio"
        className="relative z-0 pt-10 pb-12 lg:pt-12 lg:pb-16 bg-off-white overflow-hidden scroll-mt-24"
        aria-label="Portfolio"
      >
        <div className="w-full px-5 sm:px-8 lg:px-10 xl:px-14">
          <div
            ref={tabsRef}
            className="flex flex-wrap gap-1.5 mb-6 lg:mb-8"
            role="tablist"
            aria-label="Filter by city"
          >
            {(['All', ...metroCities] as const).map((city) => {
              const isActive = activeCity === city
              const count =
                city === 'All'
                  ? filteredByMedia.length
                  : filteredByMedia.filter((p) => p.city === city).length

              return (
                <button
                  key={city}
                  role="tab"
                  aria-selected={isActive}
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

          <div
            ref={gridRef}
            key={`${activeCity}-${mediaFilter}`}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4"
          >
            {filtered.map((project) => (
              <PortfolioCard key={project.id} project={project} onOpen={handleOpen} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-slate py-12 text-sm">No projects in this city yet.</p>
          )}
        </div>
      </section>

      <ProjectModal project={selectedVideo} onClose={() => setSelectedVideo(null)} />
      <VirtualTourModal project={selectedTour} onClose={() => setSelectedTour(null)} />
    </>
  )
}
