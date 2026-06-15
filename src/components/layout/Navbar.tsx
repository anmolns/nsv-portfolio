import { motion } from 'framer-motion'
import { useScrollPosition } from '../../hooks/useMotion'
import { cn } from '../../lib/utils'
import { contact } from '../../data/contact'
import { scrollToPortfolioFilter } from '../../lib/portfolioNav'
import { Logo } from '../ui/Logo'

export function Navbar() {
  const scrolled = useScrollPosition()

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 overflow-visible transition-all duration-500',
        scrolled
          ? 'bg-navy/40 backdrop-blur-xl border-b border-white/20 py-3.5 shadow-sm shadow-navy/5'
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
          className="flex shrink-0 items-center group"
          data-cursor="pointer"
        >
          <Logo
            size="md"
            className={cn(
              'transition-[height] duration-300',
              scrolled ? 'h-9 sm:h-10' : 'h-10 sm:h-11 lg:h-12',
            )}
          />
        </a>

        <div className="flex items-center gap-3">
          <a
            href="#video"
            onClick={(e) => {
              e.preventDefault()
              scrollToPortfolioFilter('video')
            }}
            className="hidden sm:inline-flex text-xs font-semibold tracking-wide uppercase text-white/70 hover:text-cyan transition-colors duration-300"
            data-cursor="pointer"
          >
            Video
          </a>
          <a
            href="#virtual-tours"
            onClick={(e) => {
              e.preventDefault()
              scrollToPortfolioFilter('virtual-tour')
            }}
            className="hidden md:inline-flex text-xs font-semibold tracking-wide uppercase text-white/70 hover:text-cyan transition-colors duration-300"
            data-cursor="pointer"
          >
            Virtual Tours
          </a>
          <motion.a
            href={contact.phoneTel}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan text-navy text-sm font-bold shadow-lg shadow-cyan/25 hover:bg-cyan-bright transition-colors duration-300"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            data-cursor="pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.3 0 .7-.2 1L6.6 10.8z" />
            </svg>
            {contact.phoneDisplay}
          </motion.a>
        </div>
      </nav>
    </motion.header>
  )
}
