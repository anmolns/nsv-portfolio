import { useEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MagneticButton } from '../ui/Motion'
import { ProjectInquiryModal } from '../ui/ProjectInquiryModal'
import { usePrefersReducedMotion } from '../../hooks/useMotion'
import { contact } from '../../data/contact'
import { cn } from '../../lib/utils'
import { Logo } from '../ui/Logo'

gsap.registerPlugin(ScrollTrigger)

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Portfolio', href: '#portfolio' },
]

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/nsventures',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@nsventures',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: 'Vimeo',
    href: 'https://vimeo.com/nsventures',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.466 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.819 3.436-5.673 6.762-5.559 2.473.08 3.778 1.52 3.892 4.294z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/nsventures',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.6c0-1.1-.02-2.5-1.5-2.5-1.5 0-1.7 1.2-1.7 2.4V19h-3v-9h2.9v1.2h.04a3.2 3.2 0 012.9-1.6c3.1 0 3.7 2 3.7 4.6V19z" />
      </svg>
    ),
  },
  {
    label: 'Behance',
    href: 'https://behance.net/nsventures',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M22 7h-7V5h7v2zm1.726 10c-.442 2.391-2.777 4.004-5.726 4.004H0V4h12.837c2.855 0 5.15 1.66 5.15 4.855 0 2.22-1.214 3.942-3.066 4.66C20.94 14.408 22 16.156 22 18.5c0 .933-.274 1.85-.774 2.5zM7.5 11.5h5.5c.966 0 1.75-.784 1.75-1.75S13.966 8 13 8H7.5v3.5zm6 5.5H7.5V14H14c.966 0 1.75.784 1.75 1.75S14.966 17.5 14 17.5z" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/nsventures',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'X',
    href: 'https://x.com/nsventures',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Pinterest',
    href: 'https://pinterest.com/nsventures',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    label: 'Tumblr',
    href: 'https://tumblr.com/nsventures',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H3.506V6.648c3.63-1.313 4.512-4.596 4.71-6.469C8.242 0 9.85 0 9.85 0h3.131v5.337h4.969v3.823h-4.969v7.48c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.156 1.404h-.178l.011.043z" />
      </svg>
    ),
  },
  {
    label: 'Google',
    href: 'https://g.page/nsventures',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 10.36H12v-2.73h6.5c.09.55.14 1.12.14 1.72 0 2.01-.54 3.9-1.49 5.52L12 14.77v-2.73l4.64 2.68A6.96 6.96 0 0016.64 12.36z" />
      </svg>
    ),
  },
] as const

function SectionHeading({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <h3
      className={cn(
        'text-[11px] tracking-[0.28em] uppercase text-cyan font-bold mb-4',
        className,
      )}
    >
      {children}
    </h3>
  )
}

function ContactItem({
  icon,
  label,
  children,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-cyan shrink-0 mt-0.5" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] tracking-wider uppercase text-white/35 font-medium mb-0.5">
          {label}
        </p>
        <div className="text-sm text-white/75 font-light leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

function SocialLinks() {
  return (
    <div className="flex flex-wrap gap-2">
      {socialLinks.map((social) => (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
          title={social.label}
          className="group flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/[0.04] text-white/55 transition-all duration-300 hover:border-cyan/40 hover:bg-cyan/10 hover:text-cyan hover:shadow-md hover:shadow-cyan/10"
          data-cursor="pointer"
        >
          {social.icon}
        </a>
      ))}
    </div>
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
  const [inquiryOpen, setInquiryOpen] = useState(false)
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
          { opacity: 0, scale: 0.96 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: footer,
              start: 'top 85%',
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
        className="pointer-events-none absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 w-full px-5 sm:px-8 lg:px-10 xl:px-14 pt-12 lg:pt-14 pb-6">
        <div ref={ctaRef} className="mb-8 lg:mb-10">
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-cyan font-bold mb-3">
            Get in touch
          </span>
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 xl:gap-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 lg:gap-10 flex-1 min-w-0">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight max-w-xl shrink-0">
                Ready to elevate your{' '}
                <span className="text-cyan">next project?</span>
              </h2>
              {/* <p
                ref={wordmarkRef}
                className="font-display font-bold leading-none tracking-tight whitespace-nowrap select-none pointer-events-none shrink-0"
                style={{ fontSize: 'clamp(2.75rem, 9vw, 6rem)' }}
                aria-hidden
              >
                <span className="text-white/[0.07]">NS </span>
                <span className="text-cyan/[0.11]">VENTURES</span>
              </p> */}
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <MagneticButton
                variant="primary"
                size="md"
                onClick={() => setInquiryOpen(true)}
                data-cursor="pointer"
              >
                Start a Project
              </MagneticButton>
              <MagneticButton
                variant="secondary"
                size="md"
                onClick={() => window.open(contact.whatsapp, '_blank')}
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

        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-10 lg:gap-x-14 mb-8 lg:mb-10 items-start"
        >
          {/* Company */}
          <div>
            {/* <SectionHeading>Company</SectionHeading> */}
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="inline-flex items-center mb-4"
              data-cursor="pointer"
            >
              <Logo size="lg" className="h-12 sm:h-14" />
            </a>
            <p className="text-white/45 text-sm leading-relaxed font-light max-w-xs mb-5">
              Premium real estate cinematography, drone aerials, and brand films for developers across India.
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <SectionHeading>Contact</SectionHeading>
            <div className="space-y-4">
              <ContactItem
                label="Address"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                  </svg>
                }
              >
                <p>{contact.address.line1}</p>
                <p>{contact.address.line2}</p>
              </ContactItem>

              <ContactItem
                label="Email"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                }
              >
                <FooterLink href={contact.emailMailto} external>
                  {contact.email}
                </FooterLink>
              </ContactItem>

              <ContactItem
                label="Call"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.01l-2.2 2.21z" />
                  </svg>
                }
              >
                <FooterLink href={contact.phoneTel} external>
                  {contact.phoneDisplay}
                </FooterLink>
              </ContactItem>
            </div>
          </div>

          {/* Social */}
          <div>
            <SectionHeading>Follow us</SectionHeading>
            <p className="text-white/40 text-xs font-light leading-relaxed mb-4 max-w-[280px]">
              Catch our latest films, behind-the-scenes, and project drops across our channels.
            </p>
            <SocialLinks />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-5 border-t border-white/10">
          <p className="text-white/35 text-[11px] font-light">
            © {new Date().getFullYear()} NS Ventures. All rights reserved.
          </p>
        </div>
      </div>

      <ProjectInquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </footer>
  )
}
