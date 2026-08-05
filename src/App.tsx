import { useEffect, useRef, useState, useCallback } from 'react'

import lensRing from '@/imports/removedblackhalo.png'
import airisLogo from '@/imports/Screenshot_2026-08-05_132544.png'
import cityImg from '@/imports/Screenshot_2026-08-05_131101.png'
import factoryImg from '@/imports/Screenshot_2026-08-05_131030.png'
import parkNormalImg from '@/imports/Screenshot_2026-08-05_123437.png'
import parkDetectionImg from '@/imports/Screenshot_2026-08-05_122739.png'

const LENS_RADIUS = 150
const LENS_SIZE = LENS_RADIUS * 2

// ─────────────────────────────────────────────
// LENS SCENE COMPONENT
// ─────────────────────────────────────────────
interface LensSceneProps {
  id: string
  baseImg: string
  enhancedImg: string
  baseFilter?: string
  enhancedFilter?: string
  badge: string
  tagline: string
  accentColor: string
  showScanLine?: boolean
  showRadar?: boolean
  bgDark?: boolean
}

function LensScene({
  id,
  baseImg,
  enhancedImg,
  baseFilter = 'none',
  enhancedFilter = 'none',
  badge,
  tagline,
  accentColor,
  showScanLine = false,
  showRadar = false,
  bgDark = false,
}: LensSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const baseImgRef = useRef<HTMLImageElement>(null)
  const lensWrapRef = useRef<HTMLDivElement>(null)
  const scanRef = useRef<HTMLDivElement>(null)
  const radarRef = useRef<HTMLDivElement>(null)

  const cur = useRef({ x: -500, y: -500 })
  const target = useRef({ x: -500, y: -500 })
  const active = useRef(false)
  const rotating = useRef(0)
  const scale = useRef(1)
  const rafRef = useRef<number>()

  useEffect(() => {
    const animate = () => {
      const lerpRate = 0.13
      cur.current.x += (target.current.x - cur.current.x) * lerpRate
      cur.current.y += (target.current.y - cur.current.y) * lerpRate

      const { x, y } = cur.current

      // Smoothly interpolate scale and rotation toward targets
      const targetScale = active.current ? 1.02 : 1
      const targetRot = active.current ? 1.5 : 0
      scale.current += (targetScale - scale.current) * 0.08
      rotating.current += (targetRot - rotating.current) * 0.06

      if (lensWrapRef.current) {
        lensWrapRef.current.style.transform = `translate(${x - LENS_RADIUS}px, ${y - LENS_RADIUS}px) rotate(${rotating.current}deg) scale(${scale.current})`
        lensWrapRef.current.style.opacity = active.current ? '1' : '0'
      }

      const mask = `radial-gradient(circle at ${x}px ${y}px, transparent ${LENS_RADIUS - 8}px, black ${LENS_RADIUS + 12}px)`
      if (baseImgRef.current) {
        baseImgRef.current.style.maskImage = mask
        ;(baseImgRef.current.style as any).webkitMaskImage = mask
      }

      if (scanRef.current) {
        scanRef.current.style.clipPath = `circle(${LENS_RADIUS - 8}px at ${x}px ${y}px)`
      }

      if (radarRef.current) {
        radarRef.current.style.left = `${x}px`
        radarRef.current.style.top = `${y}px`
      }

      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current!.getBoundingClientRect()
    target.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    if (!active.current) active.current = true
  }, [])

  const handleMouseLeave = useCallback(() => {
    active.current = false
  }, [])

  return (
    <section
      id={id}
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ height: '100vh', cursor: 'none' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Enhanced layer — always visible underneath */}
      <img
        src={enhancedImg}
        alt=""
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          filter: enhancedFilter,
          userSelect: 'none', pointerEvents: 'none',
        }}
      />

      {/* Base layer — shown everywhere, masked away at lens position */}
      <img
        ref={baseImgRef}
        src={baseImg}
        alt=""
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          filter: baseFilter,
          userSelect: 'none', pointerEvents: 'none',
          transition: 'none',
        }}
      />

      {/* Dark overlay (UNDERSTAND scene) */}
      {bgDark && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          maskImage: baseImgRef.current ? undefined : 'none',
          pointerEvents: 'none',
        }} />
      )}

      {/* Scan line overlay (UNDERSTAND) */}
      {showScanLine && (
        <div
          ref={scanRef}
          style={{
            position: 'absolute', inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            clipPath: 'circle(0px at -500px -500px)',
          }}
        >
          <div style={{
            position: 'absolute',
            left: 0, right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, transparent, rgba(0,255,80,0.8), transparent)',
            animation: 'scan 1.8s linear infinite',
            boxShadow: '0 0 12px rgba(0,255,80,0.6)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,80,0.04) 4px)',
          }} />
        </div>
      )}

      {/* Radar pulse (SENSE) */}
      {showRadar && (
        <div
          ref={radarRef}
          style={{
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            opacity: 0.7,
          }}
        >
          {[0, 0.4, 0.8].map((delay) => (
            <div
              key={delay}
              style={{
                position: 'absolute',
                width: '80px', height: '80px',
                border: '2px solid #F97316',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                animation: `radar-pulse 2s ${delay}s ease-out infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Lens ring — positioned at cursor, always on top */}
      <div
        ref={lensWrapRef}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: LENS_SIZE,
          height: LENS_SIZE,
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.3s',
          willChange: 'transform',
          transformOrigin: 'center center',
          filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.6)) drop-shadow(0 2px 8px rgba(255,163,77,0.25))',
        }}
      >
        <img
          src={lensRing}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* Gradient vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,10,30,0.7) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Badge */}
      <div style={{
        position: 'absolute', bottom: '3rem', left: '3rem',
        zIndex: 20, pointerEvents: 'none',
      }}>
        <div style={{
          display: 'inline-block',
          background: accentColor,
          color: 'white',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.18em',
          padding: '5px 14px',
          borderRadius: '100px',
          marginBottom: '10px',
        }}>
          {badge}
        </div>
        <div style={{
          color: 'white',
          fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
          fontWeight: '700',
          lineHeight: 1.15,
          textShadow: '0 2px 24px rgba(0,0,0,0.8)',
        }}>
          {tagline}
        </div>
      </div>

      {/* Explore hint */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'rgba(255,255,255,0.45)',
        fontSize: '13px',
        fontWeight: '500',
        letterSpacing: '0.12em',
        pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
      }}>
        <div style={{
          width: '40px', height: '40px',
          border: '1.5px solid rgba(255,255,255,0.3)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pulse-ring 2.5s ease-in-out infinite',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
        Move cursor to explore
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const links = ['SEE', 'UNDERSTAND', 'SENSE', 'Technology', 'About']

  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'all 0.4s ease',
      backdropFilter: 'blur(20px)',
      background: 'rgba(255,255,255,0.97)',
      borderBottom: '1px solid rgba(0,27,72,0.08)',
      boxShadow: '0 1px 24px rgba(0,27,72,0.07)',
    }}>
      <div style={{
        maxWidth: '1400px', margin: '0 auto',
        padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '72px',
      }}>
        {/* Logo */}
        <a href="#" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{
            background: 'white',
            borderRadius: '10px',
            padding: '4px 12px',
            display: 'inline-block',
            lineHeight: 0,
          }}>
            <img
              src={airisLogo}
              alt="Airis"
              style={{ height: '36px', width: 'auto', display: 'block' }}
            />
          </div>
        </a>

        {/* Desktop Links */}
        <div style={{
          display: 'flex', gap: '2.5rem', alignItems: 'center',
        }} className="hidden md:flex">
          {links.map((link) => (
            <button
              key={link}
              onClick={() => scrollTo(link)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(0,27,72,0.65)',
                fontSize: '13px',
                fontWeight: '600',
                letterSpacing: '0.06em',
                fontFamily: 'Montserrat, sans-serif',
                padding: '4px 0',
                position: 'relative',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#001B48')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(0,27,72,0.65)')}
            >
              {link}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => scrollTo('waitlist')}
            style={{
              background: '#FFA34D',
              color: 'white',
              border: 'none',
              borderRadius: '100px',
              padding: '10px 22px',
              fontSize: '13px',
              fontWeight: '700',
              letterSpacing: '0.04em',
              fontFamily: 'Montserrat, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 20px rgba(255,163,77,0.35)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(255,163,77,0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,163,77,0.35)'
            }}
          >
            Join Waitlist
          </button>

          {/* Hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#001B48', padding: '4px',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen
                ? <path d="M18 6L6 18M6 6l12 12" />
                : <path d="M3 12h18M3 6h18M3 18h18" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,27,72,0.08)',
          padding: '1.5rem 2rem',
          display: 'flex', flexDirection: 'column', gap: '1rem',
        }}>
          {links.map((link) => (
            <button
              key={link}
              onClick={() => scrollTo(link)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#001B48', fontSize: '16px', fontWeight: '600',
                fontFamily: 'Montserrat, sans-serif',
                textAlign: 'left', padding: '8px 0',
              }}
            >
              {link}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}

// ─────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────
function Hero() {
  return (
    <section
      id="hero"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #001B48 0%, #08245C 50%, #0a3070 100%)',
        position: 'relative',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        width: '700px', height: '700px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,163,77,0.12) 0%, transparent 70%)',
        right: '-10%', top: '50%', transform: 'translateY(-50%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: '400px', height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(47,127,120,0.15) 0%, transparent 70%)',
        left: '5%', bottom: '10%',
        pointerEvents: 'none',
      }} />

      {/* Grid dots */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '1400px', margin: '0 auto', padding: '0 2rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
        gap: '4rem',
        width: '100%',
        paddingTop: '72px',
      }}
        className="grid-cols-1 md:grid-cols-2">
        {/* Text */}
        <div style={{ animation: 'fade-up 0.9s ease-out both' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,163,77,0.12)',
            border: '1px solid rgba(255,163,77,0.3)',
            borderRadius: '100px',
            padding: '6px 16px',
            marginBottom: '2rem',
          }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FFA34D', animation: 'pulse-ring 2s infinite' }} />
            <span style={{ color: '#FFA34D', fontSize: '12px', fontWeight: '700', letterSpacing: '0.12em' }}>
              COMING SOON
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
            fontWeight: '800',
            lineHeight: 1.08,
            color: 'white',
            marginBottom: '1.5rem',
            letterSpacing: '-0.02em',
          }}>
            See Clearly.<br />
            <span style={{
              background: 'linear-gradient(135deg, #FFA34D, #FFD4A0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Live Confidently.
            </span>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: 'clamp(1rem, 1.8vw, 1.125rem)',
            lineHeight: 1.75,
            maxWidth: '480px',
            marginBottom: '2.5rem',
            fontWeight: '400',
          }}>
            Move through the world with greater independence, understanding and confidence using Airis smart contact lenses.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: '#FFA34D',
                color: 'white',
                border: 'none',
                borderRadius: '100px',
                padding: '15px 32px',
                fontSize: '15px',
                fontWeight: '700',
                letterSpacing: '0.02em',
                fontFamily: 'Montserrat, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.25s',
                boxShadow: '0 4px 32px rgba(255,163,77,0.45)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 40px rgba(255,163,77,0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = '0 4px 32px rgba(255,163,77,0.45)'
              }}
            >
              Join Waitlist
            </button>

            <button
              onClick={() => document.getElementById('see')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '100px',
                padding: '15px 32px',
                fontSize: '15px',
                fontWeight: '600',
                letterSpacing: '0.02em',
                fontFamily: 'Montserrat, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.25s',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.14)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              }}
            >
              Experience Airis
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: '2.5rem', marginTop: '3.5rem', paddingTop: '2.5rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            {[
              { value: '3', label: 'Vision Modes' },
              { value: 'AI', label: 'Powered' },
              { value: '0.1s', label: 'Response Time' },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ color: '#FFA34D', fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                  {stat.value}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: '500', letterSpacing: '0.08em', marginTop: '2px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating lens */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="float-lens" style={{
            position: 'relative',
            width: 'clamp(280px, 40vw, 480px)',
            height: 'clamp(280px, 40vw, 480px)',
          }}>
            {/* Glow rings */}
            <div style={{
              position: 'absolute', inset: '-20px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,163,77,0.18) 0%, transparent 70%)',
              animation: 'pulse-ring 3s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', inset: '-40px',
              borderRadius: '50%',
              border: '1px solid rgba(255,163,77,0.12)',
              animation: 'pulse-ring 3s 1s ease-in-out infinite',
            }} />
            <img
              src={lensRing}
              alt="Airis smart contact lens"
              style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 20px 60px rgba(255,163,77,0.4)) drop-shadow(0 4px 20px rgba(0,0,0,0.6))' }}
            />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        color: 'rgba(255,255,255,0.3)',
        fontSize: '11px',
        letterSpacing: '0.15em',
        fontWeight: '500',
      }}>
        SCROLL
        <div style={{
          width: '1px', height: '40px',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)',
        }} />
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// TRANSITION LABEL BETWEEN SCENES
// ─────────────────────────────────────────────
function SceneTransition({ number, label }: { number: string; label: string }) {
  return (
    <div style={{
      background: '#001B48',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '3rem 2rem',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: 'rgba(255,163,77,0.4)', fontSize: '12px', fontWeight: '700', fontFamily: 'monospace' }}>
          {number}
        </span>
        <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.15)' }} />
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: '600', letterSpacing: '0.1em' }}>
          {label}
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// HOW IT WORKS
// ─────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { num: '01', icon: '👁', title: 'Wear Airis', desc: 'Comfortable, lightweight lenses that fit naturally into your daily routine.' },
    { num: '02', icon: '✦', title: 'Enhance Vision', desc: 'Advanced optics process your environment in real time.' },
    { num: '03', icon: '⬡', title: 'Understand Your World', desc: 'AI identifies objects, text, and potential hazards around you.' },
    { num: '04', icon: '◎', title: 'Move Confidently', desc: 'Live, work, and explore with enhanced independence every day.' },
  ]

  return (
    <section id="technology" style={{
      background: 'linear-gradient(180deg, #001B48 0%, #021d4a 100%)',
      padding: '7rem 2rem',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div style={{
            color: '#FFA34D', fontSize: '11px', fontWeight: '700',
            letterSpacing: '0.2em', marginBottom: '1rem',
          }}>
            HOW IT WORKS
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '800',
            color: 'white', letterSpacing: '-0.02em', lineHeight: 1.2,
          }}>
            From lens to lens — seamlessly
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px',
          overflow: 'hidden',
        }}>
          {steps.map((step, i) => (
            <div
              key={step.num}
              style={{
                background: '#001B48',
                padding: '2.5rem',
                transition: 'background 0.3s',
                position: 'relative',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,163,77,0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#001B48')}
            >
              <div style={{
                color: 'rgba(255,163,77,0.3)', fontSize: '11px',
                fontWeight: '700', letterSpacing: '0.12em', marginBottom: '1.5rem',
                fontFamily: 'monospace',
              }}>
                {step.num}
              </div>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{step.icon}</div>
              <div style={{
                color: 'white', fontSize: '1.125rem', fontWeight: '700',
                marginBottom: '0.75rem',
              }}>
                {step.title}
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem',
                lineHeight: 1.7,
              }}>
                {step.desc}
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  position: 'absolute', right: '-1px', top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.2)', fontSize: '18px',
                  zIndex: 1,
                }}>›</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// FEATURES
// ─────────────────────────────────────────────
function Features() {
  const cards = [
    {
      badge: 'SEE',
      title: 'Crystal-clear clarity',
      desc: 'Understand your surroundings with enhanced optical clarity. Street signs, faces, and environments become sharper than ever before.',
      color: '#2F7F78',
      accent: 'rgba(47,127,120,0.15)',
      border: 'rgba(47,127,120,0.3)',
      id: 'see',
    },
    {
      badge: 'UNDERSTAND',
      title: 'Beyond darkness',
      desc: 'Receive helpful contextual information when you need it most. Navigate low-light environments with intelligent night-vision assistance.',
      color: '#FFA34D',
      accent: 'rgba(255,163,77,0.12)',
      border: 'rgba(255,163,77,0.3)',
      id: 'understand',
    },
    {
      badge: 'SENSE',
      title: 'Intelligent awareness',
      desc: 'Improve situational awareness through intelligent environmental detection. Know what\'s happening around you before you see it.',
      color: '#8A7894',
      accent: 'rgba(138,120,148,0.12)',
      border: 'rgba(138,120,148,0.3)',
      id: 'sense',
    },
  ]

  return (
    <section id="about" style={{
      background: '#001B48',
      padding: '7rem 2rem',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div style={{
            color: '#FFA34D', fontSize: '11px', fontWeight: '700',
            letterSpacing: '0.2em', marginBottom: '1rem',
          }}>
            CAPABILITIES
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '800',
            color: 'white', letterSpacing: '-0.02em',
          }}>
            Three modes. One lens.
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
          {cards.map((card) => (
            <div
              key={card.badge}
              style={{
                background: card.accent,
                border: `1px solid ${card.border}`,
                borderRadius: '20px',
                padding: '2.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden',
              }}
              onClick={() => document.getElementById(card.id)?.scrollIntoView({ behavior: 'smooth' })}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${card.border}`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = ''
              }}
            >
              <div style={{
                position: 'absolute', top: 0, right: 0,
                width: '120px', height: '120px',
                background: `radial-gradient(circle at top right, ${card.color}22 0%, transparent 70%)`,
                borderRadius: '20px',
              }} />
              <div style={{
                display: 'inline-block',
                background: card.color,
                color: 'white',
                fontSize: '10px',
                fontWeight: '800',
                letterSpacing: '0.2em',
                padding: '4px 12px',
                borderRadius: '100px',
                marginBottom: '1.5rem',
              }}>
                {card.badge}
              </div>
              <h3 style={{
                color: 'white', fontSize: '1.5rem', fontWeight: '700',
                marginBottom: '1rem', lineHeight: 1.3,
              }}>
                {card.title}
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem',
                lineHeight: 1.75, marginBottom: '2rem',
              }}>
                {card.desc}
              </p>
              <div style={{
                color: card.color, fontSize: '13px', fontWeight: '700',
                letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                Experience it →
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────
function Testimonials() {
  const [active, setActive] = useState(0)

  const quotes = [
    {
      text: "Airis gave me back the confidence to walk through the city on my own. Seeing street signs clearly for the first time in years was emotional.",
      name: "Sarah Chen",
      role: "Early access tester, Auckland",
      initials: "SC",
      color: '#2F7F78',
    },
    {
      text: "Working night shifts in a warehouse felt dangerous before Airis. The UNDERSTAND mode is genuinely life-changing — I can see everything.",
      name: "Marcus Okafor",
      role: "Logistics supervisor, London",
      initials: "MO",
      color: '#FFA34D',
    },
    {
      text: "As someone who has always had peripheral vision challenges, the SENSE mode feels like a superpower. I notice things I've never noticed before.",
      name: "Priya Nair",
      role: "Designer & Airis advocate, Singapore",
      initials: "PN",
      color: '#8A7894',
    },
  ]

  return (
    <section style={{
      background: 'linear-gradient(180deg, #021d4a 0%, #001B48 100%)',
      padding: '7rem 2rem',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{
            color: '#FFA34D', fontSize: '11px', fontWeight: '700',
            letterSpacing: '0.2em', marginBottom: '1rem',
          }}>
            EARLY FEEDBACK
          </div>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: '800',
            color: 'white', letterSpacing: '-0.02em',
          }}>
            Real people. Real impact.
          </h2>
        </div>

        {/* Quote card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '3rem',
          backdropFilter: 'blur(20px)',
          marginBottom: '2rem',
          minHeight: '200px',
          transition: 'all 0.4s',
        }}>
          <div style={{
            fontSize: '3rem', color: `${quotes[active].color}40`,
            lineHeight: 1, marginBottom: '1.5rem',
            fontFamily: 'serif',
          }}>
            "
          </div>
          <p style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            lineHeight: 1.8, fontWeight: '400',
            fontStyle: 'italic',
            marginBottom: '2rem',
          }}>
            {quotes[active].text}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: quotes[active].color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '14px', fontWeight: '700',
            }}>
              {quotes[active].initials}
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>
                {quotes[active].name}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>
                {quotes[active].role}
              </div>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {quotes.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                width: i === active ? '24px' : '8px',
                height: '8px',
                borderRadius: '100px',
                background: i === active ? '#FFA34D' : 'rgba(255,255,255,0.2)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// WAITLIST
// ─────────────────────────────────────────────
function Waitlist() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', country: '', needs: '' })
  const [agreed, setAgreed] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) return
    setStatus('loading')
    setTimeout(() => setStatus('success'), 1800)
  }

  if (status === 'success') {
    return (
      <section id="waitlist" style={{
        background: '#001B48', padding: '7rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh',
      }}>
        <div style={{ textAlign: 'center', animation: 'fade-up 0.6s ease-out both' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(47,127,120,0.2)', border: '1px solid rgba(47,127,120,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2rem',
          }}>
            ✓
          </div>
          <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: '800', marginBottom: '0.75rem' }}>
            You're on the list.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: 1.7 }}>
            We'll reach out when Airis is ready for you.<br />Thank you for believing in clearer vision.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="waitlist" style={{
      background: '#001B48', padding: '7rem 2rem',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            color: '#FFA34D', fontSize: '11px', fontWeight: '700',
            letterSpacing: '0.2em', marginBottom: '1rem',
          }}>
            JOIN THE WAITLIST
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '800',
            color: 'white', letterSpacing: '-0.02em', marginBottom: '1rem',
          }}>
            Be first to see clearly.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            Join thousands waiting to experience the future of vision.
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          backdropFilter: 'blur(20px)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input
                type="text"
                placeholder="First name"
                value={form.firstName}
                onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                required
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Last name"
                value={form.lastName}
                onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                required
                style={inputStyle}
              />
            </div>
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              required
              style={inputStyle}
            />
            <select
              value={form.country}
              onChange={(e) => setForm(f => ({ ...f, country: e.target.value }))}
              required
              style={{ ...inputStyle, color: form.country ? 'white' : 'rgba(255,255,255,0.35)' }}
            >
              <option value="" disabled>Country</option>
              {['New Zealand', 'Australia', 'United Kingdom', 'United States', 'Canada', 'Singapore', 'Other'].map(c => (
                <option key={c} value={c} style={{ background: '#08245C', color: 'white' }}>{c}</option>
              ))}
            </select>
            <textarea
              placeholder="Accessibility needs or questions (optional)"
              value={form.needs}
              onChange={(e) => setForm(f => ({ ...f, needs: e.target.value }))}
              rows={3}
              style={{ ...inputStyle, resize: 'none' }}
            />
            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              color: 'rgba(255,255,255,0.55)', fontSize: '13px', cursor: 'pointer',
              lineHeight: 1.6,
            }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ marginTop: '2px', accentColor: '#FFA34D', flexShrink: 0 }}
              />
              I agree to the Privacy Policy and consent to Airis contacting me about their product.
            </label>
            <button
              type="submit"
              disabled={!agreed || status === 'loading'}
              style={{
                background: agreed ? '#FFA34D' : 'rgba(255,163,77,0.3)',
                color: 'white',
                border: 'none',
                borderRadius: '100px',
                padding: '15px',
                fontSize: '15px',
                fontWeight: '700',
                letterSpacing: '0.04em',
                fontFamily: 'Montserrat, sans-serif',
                cursor: agreed ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                boxShadow: agreed ? '0 4px 32px rgba(255,163,77,0.4)' : 'none',
              }}
            >
              {status === 'loading' ? 'Joining…' : 'Join Waitlist'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '12px',
  padding: '13px 16px',
  color: 'white',
  fontSize: '14px',
  fontFamily: 'Montserrat, sans-serif',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.2s',
}

// ─────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      background: '#000d24',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      padding: '4rem 2rem 2rem',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem',
        }}>
          <div>
            <div style={{
              background: 'white', borderRadius: '10px',
              padding: '4px 12px', display: 'inline-block', marginBottom: '1rem',
            }}>
              <img src={airisLogo} alt="Airis" style={{ height: '30px', display: 'block' }} />
            </div>
            <p style={{
              color: 'rgba(255,255,255,0.4)', fontSize: '13px',
              lineHeight: 1.7, maxWidth: '220px',
            }}>
              Smart contact lenses for a clearer, more confident world.
            </p>
          </div>

          {[
            { heading: 'Experience', links: ['SEE', 'UNDERSTAND', 'SENSE', 'Technology'] },
            { heading: 'Company', links: ['About', 'FAQ', 'Contact', 'Join Waitlist'] },
            { heading: 'Legal', links: ['Privacy Policy', 'Terms of Use'] },
          ].map((col) => (
            <div key={col.heading}>
              <div style={{
                color: 'rgba(255,255,255,0.3)', fontSize: '11px',
                fontWeight: '700', letterSpacing: '0.15em', marginBottom: '1rem',
              }}>
                {col.heading}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {col.links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    style={{
                      color: 'rgba(255,255,255,0.55)',
                      textDecoration: 'none', fontSize: '14px',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: '2rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '1rem',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
            © 2026 Airis. All rights reserved.
          </div>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', letterSpacing: '0.08em' }}>
            See Clearly. Live Confidently.
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <Nav />

      <Hero />

      {/* ── EXPERIENCE 1: SEE ── */}
      <SceneTransition number="01 /" label="SEE — Enhanced clarity" />
      <LensScene
        id="see"
        baseImg={cityImg}
        enhancedImg={cityImg}
        baseFilter="blur(7px) brightness(0.85)"
        enhancedFilter="none"
        badge="SEE"
        tagline="See Clearly."
        accentColor="#2F7F78"
      />

      {/* ── EXPERIENCE 2: UNDERSTAND ── */}
      <SceneTransition number="02 /" label="UNDERSTAND — Beyond darkness" />
      <LensScene
        id="understand"
        baseImg={factoryImg}
        enhancedImg={factoryImg}
        baseFilter="brightness(0.07) saturate(0)"
        enhancedFilter="none"
        badge="UNDERSTAND"
        tagline="See Beyond Darkness."
        accentColor="#FFA34D"
        showScanLine
      />

      {/* ── EXPERIENCE 3: SENSE ── */}
      <SceneTransition number="03 /" label="SENSE — Intelligent awareness" />
      <LensScene
        id="sense"
        baseImg={parkNormalImg}
        enhancedImg={parkDetectionImg}
        baseFilter="none"
        enhancedFilter="none"
        badge="SENSE"
        tagline="Detect What Matters."
        accentColor="#8A7894"
        showRadar
      />

      <HowItWorks />
      <Features />
      <Testimonials />
      <Waitlist />
      <Footer />
    </div>
  )
}
