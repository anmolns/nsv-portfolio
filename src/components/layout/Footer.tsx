import { useEffect, useRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MagneticButton } from '../ui/Motion'
import { usePrefersReducedMotion } from '../../hooks/useMotion'

gsap.registerPlugin(ScrollTrigger)

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Selected Work', href: '#offset-carousel' },
  { label: 'Services', href: '#what-we-offer' },
  { label: 'Portfolio', href: '#portfolio' },
]

const serviceLinks = [
  'Drone Cinematography',
  'Real Estate Photography',
  'Brand Films',
  'Social Media Content',
]

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.3 2.3.5.6.2 1 .5 1.5 1 .5.5.8 1 1 1.5.2.5.4 1.1.5 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.9-.5 2.3-.2.6-.5 1-.9 1.5-.5.5-1 .8-1.5 1-.5.2-1.1.4-2.3.5-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.3-2.3-.5-.6-.2-1-.5-1.5-1-.5-.5-.8-1-1-1.5-.2-.5-.4-1.1-.5-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.9.5-2.3.2-.6.5-1 .9-1.5.5-.5 1-.8 1.5-1 .5-.2 1.1-.4 2.3-.5C8.4 2.2 8.8 2.2 12 2.2m0-2.2C8.7 0 8.3 0 7 0.1 5.7.2 4.8.4 4.1.7c-.8.3-1.4.7-2 1.3-.6.6-1 1.3-1.3 2-.3.7-.5 1.6-.6 2.9C0.1 8.3 0 8.7 0 12s0 3.7.1 5c.1 1.3.3 2.2.6 2.9.3.8.7 1.4 1.3 2 .6.6 1.3 1 2 1.3.7.3 1.6.5 2.9.6 1.3.1 1.7.1 5 .1s3.7 0 5-.1c1.3-.1 2.2-.3 2.9-.6.8-.3 1.4-.7 2-1.3.6-.6 1-1.3 1.3-2 .3-.7.5-1.6.6-2.9.1-1.3.1-1.7.1-5s0-3.7-.1-5c-.1-1.3-.3-2.2-.6-2.9-.3-.8-.7-1.4-1.3-2-.6-.6-1.3-1-2-1.3-.7-.3-1.6-.5-2.9-.6C15.7 0 15.3 0 12 0z" />
        <path d="M12 5.8a6.2 6.2 0 100 12.4 6.2 6.2 0 000-12.4zm0 10.2a4 4 0 110-8 4 4 0 010 8z" />
        <circle cx="18.4" cy="5.6" r="1.4" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.6c0-1.1-.02-2.5-1.5-2.5-1.5 0-1.7 1.2-1.7 2.4V19h-3v-9h2.9v1.2h.04a3.2 3.2 0 012.9-1.6c3.1 0 3.7 2 3.7 4.6V19z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 00.5 6.2 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.8 3 3 0 002.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 002.1-2.1A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
      </svg>
    ),
  },
]

function LogoMark({ className }: { className?: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 8L22 11.5V18.5L16 22L10 18.5V11.5L16 8Z" fill="currentColor" opacity="0.5" />
      <path d="M16 12L19 13.75V17.25L16 19L13 17.25V13.75L16 12Z" fill="currentColor" />
    </svg>
  )
}

function FooterLink({
  href,
  children,
  external,
}: {
  href: string
  children: ReactNode
  external?: boolean
}) {
  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (external || !href.startsWith('#')) return
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <a
      href={href}
      onClick={scrollTo}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="footer-link group inline-flex items-center gap-2 text-white/55 hover:text-cyan transition-colors duration-300 text-xs font-light"
      data-cursor="pointer"
    >
      <span className="relative">
        {children}
        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-cyan group-hover:w-full transition-all duration-400 ease-out" />
      </span>
    </a>
  )
}

export function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const wordmarkRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const footer = footerRef.current
    if (!footer || reducedMotion) return

    const ctx = gsap.context(() => {
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current.children,
          { y: 48 },
          {
            y: 0,
            duration: 1,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 88%',
              once: true,
            },
          },
        )
      }

      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current.children,
          { y: 36 },
          {
            y: 0,
            duration: 0.85,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 90%',
              once: true,
            },
          },
        )
      }

      if (wordmarkRef.current) {
        gsap.fromTo(
          wordmarkRef.current,
          { yPercent: 16 },
          {
            yPercent: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: wordmarkRef.current,
              start: 'top 94%',
              once: true,
            },
          },
        )
      }

      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.4,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: lineRef.current,
              start: 'top 95%',
              once: true,
            },
          },
        )
      }

      gsap.to('.footer-glow', {
        y: -30,
        x: 20,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to('.footer-glow-2', {
        y: 25,
        x: -15,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1,
      })
    }, footer)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <footer
      id="contact"
      ref={footerRef}
      className="relative bg-navy overflow-hidden"
      aria-label="Site footer"
    >
      <div className="footer-glow pointer-events-none absolute -top-20 -left-16 w-[280px] h-[280px] rounded-full bg-cyan/10 blur-[80px]" />
      <div className="footer-glow-2 pointer-events-none absolute top-1/2 -right-20 w-[240px] h-[240px] rounded-full bg-cyan/8 blur-[70px]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative w-full px-5 sm:px-8 lg:px-10 xl:px-14 pt-14 lg:pt-16 pb-6">
        <div ref={ctaRef} className="mb-10 lg:mb-12">
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-cyan font-bold mb-3">
            Get in touch
          </span>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-8">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight max-w-2xl">
              Ready to elevate your{' '}
              <span className="text-cyan">next project?</span>
            </h2>
            <div className="flex flex-wrap gap-3 shrink-0">
              <MagneticButton
                variant="primary"
                size="md"
                onClick={() => window.open('mailto:hello@nsventures.in', '_self')}
                data-cursor="pointer"
              >
                Start a Project
              </MagneticButton>
              <MagneticButton
                variant="secondary"
                size="md"
                onClick={() => window.open('https://wa.me/919876543210', '_blank')}
                data-cursor="pointer"
              >
                WhatsApp Us
              </MagneticButton>
            </div>
          </div>
        </div>

        <div
          ref={lineRef}
          className="h-px w-full bg-gradient-to-r from-cyan/30 via-cyan/20 to-transparent origin-left mb-8 lg:mb-10"
        />

        <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8 lg:mb-10">
          <div className="col-span-2 lg:col-span-1">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="inline-flex items-center gap-2 text-cyan mb-4"
              data-cursor="pointer"
            >
              <LogoMark />
              <span className="font-display text-base font-bold text-white">
                NS <span className="text-cyan">VENTURES</span>
              </span>
            </a>
            <p className="text-white/45 text-xs leading-relaxed font-light max-w-sm">
              Premium real estate cinematography, drone aerials, and brand films for developers across India.
            </p>
          </div>

          <div>
            <h3 className="text-[10px] tracking-[0.25em] uppercase text-cyan font-bold mb-4">
              Explore
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] tracking-[0.25em] uppercase text-cyan font-bold mb-4">
              Services
            </h3>
            <ul className="space-y-2">
              {serviceLinks.map((label) => (
                <li key={label}>
                  <FooterLink href="#what-we-offer">{label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] tracking-[0.25em] uppercase text-cyan font-bold mb-4">
              Contact
            </h3>
            <ul className="space-y-2.5">
              <li>
                <FooterLink href="mailto:hello@nsventures.in" external>
                  hello@nsventures.in
                </FooterLink>
              </li>
              <li>
                <FooterLink href="tel:+919876543210" external>
                  +91 98765 43210
                </FooterLink>
              </li>
              <li>
                <span className="text-white/45 text-xs font-light">Mumbai · Pan-India</span>
              </li>
            </ul>

            <div className="flex gap-2.5 mt-5">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-cyan hover:border-cyan/50 hover:bg-cyan/10 transition-colors duration-300"
                  whileHover={{ scale: 1.06, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  data-cursor="pointer"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div ref={wordmarkRef} className="overflow-hidden mb-6">
          <p
            className="font-display font-bold text-white/[0.05] leading-none select-none pointer-events-none whitespace-nowrap"
            style={{ fontSize: 'clamp(2rem, 8vw, 5rem)' }}
            aria-hidden
          >
            NS VENTURES
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-5 border-t border-white/10">
          <p className="text-white/35 text-[11px] font-light">
            © {new Date().getFullYear()} NS Ventures. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-5">
            <FooterLink href="#">Privacy</FooterLink>
            <FooterLink href="#">Terms</FooterLink>
            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-[11px] tracking-[0.2em] uppercase text-cyan font-semibold flex items-center gap-2"
              whileHover={{ y: -2 }}
              data-cursor="pointer"
            >
              Back to top
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 4l-8 8h5v8h6v-8h5z" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  )
}
