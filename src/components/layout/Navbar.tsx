import { motion } from 'framer-motion'
import { useScrollPosition } from '../../hooks/useMotion'
import { cn } from '../../lib/utils'
import { contact } from '../../data/contact'
import { Logo } from '../ui/Logo'

interface NavbarProps {
  onCallbackClick?: () => void
}

export function Navbar({ onCallbackClick }: NavbarProps) {
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
              scrolled ? 'h-11 sm:h-12' : 'h-12 sm:h-14 lg:h-16',
            )}
          />
        </a>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <motion.a
            href={contact.phoneTel}
            className="inline-flex items-center justify-center rounded-full bg-cyan px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan/25 transition-colors hover:bg-cyan-bright sm:px-6 sm:py-3 sm:text-base"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            data-cursor="pointer"
          >
            {contact.phoneDisplay}
          </motion.a>
          <motion.button
            type="button"
            onClick={onCallbackClick}
            className="inline-flex items-center justify-center rounded-full bg-cyan px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan/25 transition-colors hover:bg-cyan-bright sm:px-6 sm:py-3 sm:text-base"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            data-cursor="pointer"
          >
            <span className="sm:hidden">Callback</span>
            <span className="hidden sm:inline">Get a callback</span>
          </motion.button>
        </div>
      </nav>
    </motion.header>
  )
}
