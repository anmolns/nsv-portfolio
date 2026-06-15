import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects, cities, type Project } from '../../data/projects'
import { ProjectModal } from '../ui/ProjectModal'
import { useMediaQuery } from '../../hooks/useMotion'

gsap.registerPlugin(ScrollTrigger)

function PortfolioCard({
  project,
  index,
  onOpen,
}: {
  project: Project
  index: number
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

  const handleCardClick = () => {
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
      <div className="w-full" style={{ perspective: '1200px' }}>
        <motion.div
          className="relative w-full aspect-[5/6] cursor-pointer"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleCardClick}
          data-cursor="pointer"
        >
        {/* Front — image + minimal info */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden bg-navy shadow-lg shadow-navy/5"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <img
            src={project.thumbnail}
            alt={project.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-navy/70 via-navy/30 to-transparent" />

          <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-cyan text-navy text-[10px] tracking-[0.12em] uppercase font-bold shadow-sm">
            {project.city}
          </span>
          <span className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/95 text-navy text-xs font-bold flex items-center justify-center shadow-md">
            {String(index + 1).padStart(2, '0')}
          </span>

          <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
            <h3 className="font-display text-lg lg:text-xl font-bold text-white leading-tight line-clamp-2">
              {project.title}
            </h3>
            <p className="text-white/60 text-xs mt-1.5 font-light tracking-wide">
              {project.location}
            </p>
            <span className="inline-flex items-center gap-2 mt-3 text-cyan text-[10px] tracking-[0.2em] uppercase font-semibold opacity-80">
              <span className="w-6 h-px bg-cyan" />
              Hover to explore
            </span>
          </div>
        </div>

        {/* Back — full project details */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden border border-cyan/30 bg-navy flex flex-col p-5 lg:p-6"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <span className="text-[9px] tracking-[0.18em] uppercase text-cyan font-bold">
                {project.category}
              </span>
              <h3 className="font-display text-base lg:text-lg font-bold text-white mt-1 leading-tight line-clamp-2">
                {project.title}
              </h3>
            </div>
            <span className="text-cyan/80 text-[10px] font-bold shrink-0">{project.year}</span>
          </div>

          <div className="space-y-2.5 flex-1 min-h-0 overflow-hidden">
            <div className="flex items-center gap-1.5 text-white/50 text-[10px]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="shrink-0">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
              </svg>
              <span className="line-clamp-1">{project.location}</span>
            </div>

            <p className="text-white/70 text-sm leading-relaxed font-light line-clamp-4">
              {project.description}
            </p>

            <div>
              <p className="text-[9px] tracking-[0.12em] uppercase text-white/35 font-semibold mb-1">
                Client
              </p>
              <p className="text-white/80 text-xs font-medium line-clamp-1">{project.client}</p>
            </div>

            <div>
              <p className="text-[9px] tracking-[0.12em] uppercase text-white/35 font-semibold mb-1.5">
                Services
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.services.slice(0, 3).map((service) => (
                  <span
                    key={service}
                    className="px-2 py-0.5 rounded-full bg-cyan/15 border border-cyan/25 text-cyan text-[9px] font-medium"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpen(project)
            }}
            className="mt-4 w-full py-3 rounded-full bg-cyan text-navy text-xs font-bold tracking-[0.12em] uppercase hover:bg-cyan-bright transition-colors duration-300 flex items-center justify-center gap-2"
            data-cursor="pointer"
          >
            View Full Project
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
        </motion.div>
      </div>
    </div>
  )
}

export function Portfolio() {
  const [activeCity, setActiveCity] = useState<string>('All')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)

  const filtered =
    activeCity === 'All'
      ? projects
      : projects.filter((p) => p.city === activeCity)

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const ctx = gsap.context(() => {
      gsap.from(header.children, {
        y: 48,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: header,
          start: 'top 88%',
          once: true,
        },
      })

      if (tabsRef.current) {
        gsap.fromTo(
          tabsRef.current.children,
          { y: 16 },
          {
            y: 0,
            duration: 0.6,
            stagger: 0.04,
            delay: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: tabsRef.current,
              start: 'top 92%',
              once: true,
            },
          },
        )
      }
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
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: {
            each: 0.08,
            from: 'start',
          },
          ease: 'power3.out',
          overwrite: true,
        },
      )
    }, grid)

    return () => ctx.revert()
  }, [activeCity])

  return (
    <>
      <section
        id="portfolio"
        className="relative z-0 py-20 lg:py-28 bg-off-white overflow-hidden"
        aria-label="Portfolio"
      >
        <div className="w-full px-5 sm:px-8 lg:px-10 xl:px-14">
          <div ref={headerRef} className="mb-10 lg:mb-14">
            <span className="text-[11px] tracking-[0.35em] uppercase text-cyan font-bold">
              Portfolio
            </span>
            <h2 className="font-display text-4xl lg:text-6xl font-bold text-navy mt-3 leading-tight max-w-3xl">
              Work across{' '}
              <span className="text-cyan">{cities.length} cities</span>
            </h2>
            <p className="text-slate text-base mt-4 max-w-xl font-light leading-relaxed">
              Hover a card to reveal project details — click to open the full showcase.
            </p>
          </div>

          <div
            ref={tabsRef}
            className="flex flex-wrap gap-2 mb-10 lg:mb-12"
            role="tablist"
            aria-label="Filter by city"
          >
            {(['All', ...cities] as const).map((city) => {
              const isActive = activeCity === city
              const count =
                city === 'All'
                  ? projects.length
                  : projects.filter((p) => p.city === city).length

              return (
                <button
                  key={city}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCity(city)}
                  className={`px-4 py-2.5 rounded-full text-[11px] tracking-[0.1em] uppercase font-semibold transition-all duration-300 border ${
                    isActive
                      ? 'bg-navy text-white border-navy shadow-md shadow-navy/20'
                      : 'bg-white text-slate border-border hover:border-cyan hover:text-cyan'
                  }`}
                  data-cursor="pointer"
                >
                  {city}
                  <span className={`ml-1.5 ${isActive ? 'text-cyan' : 'opacity-50'}`}>
                    ({count})
                  </span>
                </button>
              )
            })}
          </div>

          <div
            ref={gridRef}
            key={activeCity}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
          >
            {filtered.map((project, i) => (
              <PortfolioCard
                key={project.id}
                project={project}
                index={i}
                onOpen={setSelectedProject}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-slate py-16">No projects in this city yet.</p>
          )}
        </div>
      </section>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  )
}
