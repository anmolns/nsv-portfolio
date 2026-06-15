import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { contact } from '../../data/contact'
import { MagneticButton } from '../ui/Motion'

gsap.registerPlugin(ScrollTrigger)

const HERO_VIDEO =
  'https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4'

const HERO_POSTER =
  'https://images.pexels.com/videos/3209828/pictures/preview-0.jpg?auto=compress&cs=tinysrgb&w=1280'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    const video = videoRef.current
    if (!section || !video) return

    const loadVideo = () => {
      if (video.src) return
      video.src = HERO_VIDEO
      video.load()
      video.play().catch(() => {})
    }

    const idleId =
      typeof requestIdleCallback !== 'undefined'
        ? requestIdleCallback(loadVideo, { timeout: 2500 })
        : window.setTimeout(loadVideo, 800)

    const setupScroll = () => {
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
    }

    const scrollId =
      typeof requestIdleCallback !== 'undefined'
        ? requestIdleCallback(setupScroll, { timeout: 3000 })
        : window.setTimeout(setupScroll, 1200)

    return () => {
      if (typeof cancelIdleCallback !== 'undefined' && typeof idleId === 'number') {
        cancelIdleCallback(idleId)
      } else {
        clearTimeout(idleId as number)
      }
      if (typeof cancelIdleCallback !== 'undefined' && typeof scrollId === 'number') {
        cancelIdleCallback(scrollId)
      } else {
        clearTimeout(scrollId as number)
      }
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === section) t.kill()
      })
    }
  }, [])

  const scrollToPortfolio = () => {
    document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative h-screen min-h-[700px] overflow-hidden bg-navy"
      aria-label="Hero"
    >
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover brightness-[0.55] transition-opacity duration-700 ${
          videoReady ? 'opacity-100' : 'opacity-0'
        }`}
        poster={HERO_POSTER}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        onCanPlay={() => setVideoReady(true)}
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

        <h1 className="font-display text-[clamp(2.2rem,6vw,4.5rem)] font-bold text-white leading-[1.08] max-w-4xl text-balance">
          Transforming Properties Into{' '}
          <span className="text-cyan">Stories That Sell</span>
        </h1>

        <motion.p
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-6 text-white/90 text-base lg:text-lg max-w-xl font-normal leading-relaxed"
        >
          Premium real estate marketing videos, aerial cinematography, and visual
          campaigns crafted for developers who demand excellence.
        </motion.p>

        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-10 flex flex-wrap gap-4"
        >
          <MagneticButton onClick={scrollToPortfolio} data-cursor="pointer">
            View Our Work
          </MagneticButton>
          <MagneticButton
            variant="secondary"
            onClick={() => window.open(contact.phoneTel)}
            data-cursor="pointer"
          >
            {contact.phoneDisplay}
          </MagneticButton>
        </motion.div>
      </div>

      {/* <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
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
      </motion.div> */}
    </section>
  )
}
