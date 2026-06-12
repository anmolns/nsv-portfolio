import { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects, cities, type Project } from '../../data/projects'
import { ProjectModal } from '../ui/ProjectModal'

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
  const videoRef = useRef<HTMLVideoElement>(null)
  const cardRef = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 300, damping: 30 })

  const handleMouse = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const resetMouse = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={cardRef}
      className="portfolio-card group relative text-left bg-white rounded-2xl overflow-hidden border border-border hover:border-cyan/40 hover:shadow-2xl hover:shadow-cyan/10 transition-shadow duration-500"
      onClick={() => onOpen(project)}
      data-cursor="pointer"
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      onMouseMove={handleMouse}
      onMouseLeave={resetMouse}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-off-white">
        <img
          src={project.thumbnail}
          alt={project.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          src={project.videoUrl}
          muted
          loop
          playsInline
          preload="none"
          onMouseEnter={() => videoRef.current?.play().catch(() => {})}
          onMouseLeave={() => {
            if (videoRef.current) {
              videoRef.current.pause()
              videoRef.current.currentTime = 0
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-cyan text-navy text-[10px] tracking-[0.12em] uppercase font-bold shadow-sm">
          {project.city}
        </span>
        <span className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white text-navy text-xs font-bold flex items-center justify-center shadow-md">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <span className="text-white/80 text-[10px] tracking-[0.2em] uppercase font-semibold">
            {project.category}
          </span>
        </div>
      </div>

      <div className="p-6 lg:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-bold text-navy group-hover:text-cyan transition-colors duration-300">
              {project.title}
            </h3>
            <p className="text-slate text-xs mt-1.5">{project.location}</p>
          </div>
          <span className="text-slate-light text-xs font-semibold shrink-0">{project.year}</span>
        </div>
        <p className="text-slate text-sm mt-3 line-clamp-2 leading-relaxed font-light">
          {project.description}
        </p>
      </div>
    </motion.button>
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
        { opacity: 0, y: 48, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
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
      <section id="portfolio" className="relative z-0 py-24 lg:py-32 bg-off-white overflow-hidden" aria-label="Portfolio">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div ref={headerRef} className="mb-12 lg:mb-16">
            <span className="text-[11px] tracking-[0.35em] uppercase text-cyan font-bold">
              Portfolio
            </span>
            <h2 className="font-display text-4xl lg:text-6xl font-bold text-navy mt-3 leading-tight max-w-3xl">
              Work across{' '}
              <span className="text-cyan">{cities.length} cities</span>
            </h2>
            <p className="text-slate text-base mt-4 max-w-xl font-light leading-relaxed">
              Browse property marketing films and aerial showcases by city — from Mumbai skylines to Goa coastlines.
            </p>
          </div>

          <div ref={tabsRef} className="flex flex-wrap gap-2 mb-10 lg:mb-14" role="tablist" aria-label="Filter by city">
            {(['All', ...cities] as const).map((city) => {
              const isActive = activeCity === city
              const count = city === 'All' ? projects.length : projects.filter((p) => p.city === city).length

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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
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
