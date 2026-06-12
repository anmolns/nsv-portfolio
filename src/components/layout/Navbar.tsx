import { motion } from 'framer-motion'
import { useScrollPosition } from '../../hooks/useMotion'
import { cn } from '../../lib/utils'

function LogoMark({ className }: { className?: string }) {
  return (
    <svg width="36" height="36" viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M16 8L22 11.5V18.5L16 22L10 18.5V11.5L16 8Z" fill="currentColor" opacity="0.5" />
      <path d="M16 12L19 13.75V17.25L16 19L13 17.25V13.75L16 12Z" fill="currentColor" />
    </svg>
  )
}

export function Navbar() {
  const scrolled = useScrollPosition()
  const onLightBg = scrolled

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        onLightBg
          ? 'bg-white/90 backdrop-blur-xl border-b border-border py-3 shadow-sm'
          : 'bg-transparent py-5 lg:py-6',
      )}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <nav
        className="w-full px-5 sm:px-8 lg:px-10 xl:px-14 flex items-center justify-between"
        aria-label="Main navigation"
      >
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault()
            document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })
          }}
          className={cn(
            'flex items-center gap-2.5 group',
            onLightBg ? 'text-cyan' : 'text-cyan',
          )}
          data-cursor="pointer"
        >
          <LogoMark />
          <span
            className={cn(
              'font-display text-lg lg:text-xl font-bold tracking-wide',
              onLightBg ? 'text-navy' : 'text-white',
            )}
          >
            NS <span className="text-cyan">VENTURES</span>
          </span>
        </a>

        <div className="flex items-center gap-3">
          <a
            href="#offset-carousel"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('offset-carousel')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className={cn(
              'hidden sm:inline-flex text-xs font-semibold tracking-wide uppercase transition-colors duration-300',
              onLightBg ? 'text-navy/60 hover:text-cyan' : 'text-white/70 hover:text-cyan',
            )}
            data-cursor="pointer"
          >
            View Work
          </a>
          <a
            href="#portfolio"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className={cn(
              'hidden md:inline-flex text-xs font-semibold tracking-wide uppercase transition-colors duration-300',
              onLightBg ? 'text-navy/60 hover:text-cyan' : 'text-white/70 hover:text-cyan',
            )}
            data-cursor="pointer"
          >
            Portfolio
          </a>
          <motion.a
            href="tel:+919876543210"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan text-navy text-sm font-bold shadow-lg shadow-cyan/25 hover:bg-cyan-bright transition-colors duration-300"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            data-cursor="pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.3 0 .7-.2 1L6.6 10.8z" />
            </svg>
            +91 98765 43210
          </motion.a>
        </div>
      </nav>
    </motion.header>
  )
}
