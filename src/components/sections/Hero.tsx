import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { MagneticButton } from '../ui/Motion'

gsap.registerPlugin(ScrollTrigger)

const HERO_VIDEO =
  'https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.3 + i * 0.12, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const video = section.querySelector('video')

    gsap.to(video, {
      scale: 1.08,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })

    video?.play().catch(() => {})

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === section) t.kill()
      })
    }
  }, [])

  const scrollToCarousel = () => {
    document.getElementById('offset-carousel')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative h-screen min-h-[700px] overflow-hidden bg-navy"
      aria-label="Hero"
    >
      <video
        className="absolute inset-0 w-full h-full object-cover brightness-[0.55]"
        src={HERO_VIDEO}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />

      <div className="absolute inset-0 bg-gradient-to-r from-navy from-0% via-navy/85 via-45% to-navy/30 to-100% pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-navy/20 pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col justify-center max-w-[1400px] mx-auto px-6 lg:px-12 pt-24">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-3 text-[11px] tracking-[0.3em] uppercase text-cyan font-bold">
            <span className="w-8 h-px bg-cyan" />
            Property Marketing Portfolio
          </span>
        </motion.div>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="font-display text-[clamp(2.2rem,6vw,4.5rem)] font-bold text-white leading-[1.08] max-w-4xl text-balance"
        >
          Transforming Properties Into{' '}
          <span className="text-cyan">Stories That Sell</span>
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-6 text-white/90 text-base lg:text-lg max-w-xl font-normal leading-relaxed"
        >
          Premium real estate marketing videos, aerial cinematography, and visual
          campaigns crafted for developers who demand excellence.
        </motion.p>

        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-10 flex flex-wrap gap-4"
        >
          <MagneticButton onClick={scrollToCarousel} data-cursor="pointer">
            View Our Work
          </MagneticButton>
          <MagneticButton
            variant="secondary"
            onClick={() => window.open('tel:+919876543210')}
            data-cursor="pointer"
          >
            +91 98765 43210
          </MagneticButton>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span className="text-[10px] tracking-[0.3em] uppercase text-white/80 font-semibold">
          Scroll to explore
        </span>
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-1.5"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-1.5 h-2.5 rounded-full bg-cyan" />
        </motion.div>
      </motion.div>
    </section>
  )
}
