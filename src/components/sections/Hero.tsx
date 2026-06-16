import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { HERO_VIDEO, HERO_POSTER } from '../../constants/hero'
import { MagneticButton } from '../ui/Motion'
import { scrollToPortfolioFilter } from '../../lib/portfolioNav'

gsap.registerPlugin(ScrollTrigger)

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

  const goToVideos = () => scrollToPortfolioFilter('video')
  const goToVirtualReality = () => scrollToPortfolioFilter('virtual-tour')

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
        <h1 className="font-display text-[clamp(2.75rem,7.5vw,5.5rem)] font-bold text-white leading-[1.06] max-w-5xl">
          <span className="block whitespace-nowrap">India´s Largest Real Estate</span>
          <span className="block text-cyan">Content Portfolio</span>
        </h1>

        {/* <motion.p
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-6 text-white/90 text-base lg:text-lg max-w-xl font-normal leading-relaxed"
        >
          Premium real estate marketing videos, aerial cinematography, and visual
          campaigns crafted for developers who demand excellence.
        </motion.p> */}

        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-10 flex flex-wrap gap-4"
        >
          <MagneticButton
            size="lg"
            className="text-base sm:text-lg"
            onClick={goToVideos}
            data-cursor="pointer"
          >
            Videos
          </MagneticButton>
          <MagneticButton
            size="lg"
            className="text-base sm:text-lg"
            variant="secondary"
            onClick={goToVirtualReality}
            data-cursor="pointer"
          >
            Virtual Reality
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  )
}
