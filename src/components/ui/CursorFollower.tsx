import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useMediaQuery, usePrefersReducedMotion } from '../../hooks/useMotion'

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
