import { motion } from 'framer-motion'
import { useScrollPosition } from '../../hooks/useMotion'
import { cn } from '../../lib/utils'
import { contact } from '../../data/contact'
import { Logo } from '../ui/Logo'

interface NavbarProps {
  onInquiryClick?: () => void
}

export function Navbar({ }: NavbarProps) {
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

        <div className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
          {/* <motion.button
            type="button"
            onClick={onInquiryClick}
            className="inline-flex items-center px-4 py-2.5 rounded-full border border-white/35 bg-white/5 text-white text-xs sm:text-sm font-bold tracking-wide hover:border-cyan hover:text-cyan transition-colors duration-300"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            data-cursor="pointer"
          >
            Start Your Work
          </motion.button> */}
          <motion.a
            href={contact.phoneTel}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-cyan px-3 py-2 text-[11px] font-bold text-white shadow-lg shadow-cyan/25 transition-colors duration-300 hover:bg-cyan-bright sm:px-5 sm:py-2.5 sm:text-sm"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            data-cursor="pointer"
          >
            {contact.phoneDisplay}
          </motion.a>
        </div>
      </nav>
    </motion.header>
  )
}
