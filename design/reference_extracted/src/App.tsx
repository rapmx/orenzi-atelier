import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const handler = () => setY(window.scrollY)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
  return y
}

function useInView<T extends HTMLElement = HTMLDivElement>(threshold = 0.12) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView] as const
}

function useCounter(target: number, active: boolean, duration = 1600) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active) return
    let frame = 0
    const frames = Math.round(duration / 16)
    const id = setInterval(() => {
      frame++
      const ease = 1 - Math.pow(1 - frame / frames, 3)
      setN(Math.round(ease * target))
      if (frame >= frames) { setN(target); clearInterval(id) }
    }, 16)
    return () => clearInterval(id)
  }, [active, target, duration])
  return n
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const IMG = {
  hero:    'https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=1920&h=1080&fit=crop&auto=format&q=85',
  story:   'https://images.unsplash.com/photo-1721508490084-1b1de5b230d4?w=900&h=1100&fit=crop&auto=format&q=85',
  tools:   'https://images.unsplash.com/photo-1497218770144-3fea6dbc33fe?w=700&h=900&fit=crop&auto=format&q=80',
  p1:      'https://images.unsplash.com/photo-1628744876497-eb30460be9f6?w=1200&h=900&fit=crop&auto=format&q=80',
  p2:      'https://images.unsplash.com/photo-1731336478850-6bce7235e320?w=1200&h=900&fit=crop&auto=format&q=80',
  p3:      'https://images.unsplash.com/photo-1706820229870-f9a8c6dac193?w=1200&h=900&fit=crop&auto=format&q=80',
  p4:      'https://images.unsplash.com/photo-1776993298422-3e8c397d0235?w=1200&h=900&fit=crop&auto=format&q=80',
  p5:      'https://images.unsplash.com/photo-1724582586529-62622e50c0b3?w=1200&h=900&fit=crop&auto=format&q=80',
  p6:      'https://images.unsplash.com/photo-1605346434674-a440ca4dc4c0?w=1200&h=900&fit=crop&auto=format&q=80',
  marble:  'https://images.unsplash.com/photo-1566305977571-5666677c6e98?w=700&h=700&fit=crop&auto=format&q=80',
  stone:   'https://images.unsplash.com/photo-1558346648-9757f2fa4474?w=700&h=700&fit=crop&auto=format&q=80',
  woodcut: 'https://images.unsplash.com/photo-1660796334938-cf0b03be7e6d?w=700&h=700&fit=crop&auto=format&q=80',
  shop:    'https://images.unsplash.com/photo-1660796334912-8ce8e9c2cff0?w=700&h=700&fit=crop&auto=format&q=80',
  fabric:  'https://images.unsplash.com/photo-1551554781-c46200ea959d?w=700&h=700&fit=crop&auto=format&q=80',
  before:  'https://images.unsplash.com/photo-1628744876497-eb30460be9f6?w=1400&h=780&fit=crop&auto=format&q=85',
  after:   'https://images.unsplash.com/photo-1724582586529-62622e50c0b3?w=1400&h=780&fit=crop&auto=format&q=85',
}

const PROJECTS = [
  { id: 1, name: 'Villa Serena',        location: 'Tuscany, Italy',   cat: 'Residences',  year: '2024', area: '640 m²', img: IMG.p1, desc: 'A private villa nestled among Tuscan hills where centuries-old stone architecture meets contemporary restraint. Every room is an act of silence.' },
  { id: 2, name: 'Penthouse Blanc',     location: 'London, UK',       cat: 'Residences',  year: '2024', area: '420 m²', img: IMG.p2, desc: 'A sky-high sanctuary above the city, conceived in monochromatic precision. Bespoke millwork and hand-selected marbles define each moment.' },
  { id: 3, name: 'Osteria Imperiale',   location: 'Milano, Italy',    cat: 'Hospitality', year: '2023', area: '280 m²', img: IMG.p3, desc: 'A fine-dining institution where the interior becomes theatre — candlelight, aged brass and linen draped in perfect proportion.' },
  { id: 4, name: 'Thornton HQ',         location: 'New York, USA',    cat: 'Corporate',   year: '2023', area: '520 m²', img: IMG.p4, desc: 'Corporate headquarters conceived as a power statement. Material gravitas — blackened steel, Sahara Noir marble, smoked oak — commands without speaking.' },
  { id: 5, name: 'Residence Nakamura',  location: 'Tokyo, Japan',     cat: 'Residences',  year: '2022', area: '380 m²', img: IMG.p5, desc: 'Japanese minimalism in conversation with Italian craft. Negative space as architecture. Wabi-sabi philosophy through European hands.' },
  { id: 6, name: "Suite Lumière", location: 'Paris, France',    cat: 'Hospitality', year: '2022', area: '240 m²', img: IMG.p6, desc: 'The presidential suite of a boutique hotel in the 8th arrondissement — reborn in absolute silence, diffused daylight, and artisan plaster.' },
]

const SERVICES = [
  {
    title: 'Interior Design',
    desc: 'Complete spatial transformation from concept to completion, guided by a singular aesthetic vision and uncompromising attention to detail.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="0.8">
        <rect x="4" y="8" width="24" height="18" rx="0.5"/>
        <path d="M4 13h24"/>
        <path d="M10 13v13"/>
        <circle cx="7" cy="10.5" r="0.8" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    title: 'Custom Furniture',
    desc: 'Bespoke pieces designed and hand-crafted exclusively for each project — furniture conceived as sculpture, built for generations.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="0.8">
        <rect x="6" y="14" width="20" height="5" rx="0.5"/>
        <rect x="8" y="10" width="16" height="4" rx="0.5"/>
        <path d="M9 19v5M23 19v5"/>
      </svg>
    ),
  },
  {
    title: 'Architecture',
    desc: 'Structural and architectural interventions that reshape spaces from the inside out — walls, volumes, and light reimagined.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="0.8">
        <path d="M16 5L4 14h24L16 5z"/>
        <rect x="10" y="14" width="12" height="13"/>
        <rect x="14" y="20" width="4" height="7"/>
      </svg>
    ),
  },
  {
    title: 'Renovation',
    desc: 'Historic restoration and contemporary renovation with deep sensitivity to heritage, patina, and the memory of materials.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="0.8">
        <path d="M8 24l4-4 10-10-4-4L8 16l4 4"/>
        <path d="M20 6l6 6-2 2-6-6z"/>
        <path d="M8 24l-4 4"/>
      </svg>
    ),
  },
  {
    title: 'Project Management',
    desc: 'Full-service coordination from concept to completion — every contractor, timeline, and budget orchestrated with precision.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="0.8">
        <rect x="8" y="4" width="16" height="24" rx="0.5"/>
        <path d="M12 10h8M12 14h8M12 18h5"/>
        <path d="M11 6h10"/>
      </svg>
    ),
  },
  {
    title: '3D Visualization',
    desc: 'Photorealistic renderings and immersive virtual walkthroughs that bring your space to life before construction begins.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="0.8">
        <path d="M16 5l11 6v11l-11 6-11-6V11z"/>
        <path d="M16 5v22M5 11l11 6 11-6"/>
      </svg>
    ),
  },
]

const STATS = [
  { value: 16,  suffix: '',  label: 'Years of Excellence' },
  { value: 340, suffix: '+', label: 'Projects Completed' },
  { value: 28,  suffix: '',  label: 'Cities Served' },
  { value: 98,  suffix: '%', label: 'Client Satisfaction' },
]

const PROCESS = [
  { n: '01', name: 'Discovery',    desc: 'We immerse ourselves in your world — lifestyle, aspirations, and the stories your space will one day tell.' },
  { n: '02', name: 'Concept',      desc: 'A singular vision emerges: editorial mood boards, spatial narratives, curated material palettes.' },
  { n: '03', name: 'Design',       desc: 'Architectural drawings, photorealistic renders, and bespoke furniture designs refined to the millimeter.' },
  { n: '04', name: 'Production',   desc: 'Our workshop and partner artisans hand-craft every element — furniture, fixtures, architectural details.' },
  { n: '05', name: 'Installation', desc: 'A dedicated team oversees every installation, ensuring perfection in every joint, surface, and shadow.' },
  { n: '06', name: 'Aftercare',    desc: 'Our relationship continues — maintenance, seasonal refreshes, and curatorial updates for years to come.' },
]

const TESTIMONIALS = [
  {
    quote: "Orenzi Atelier transformed our Tuscan estate into something beyond imagination. Every detail speaks of mastery. It is not design — it is poetry written in space.",
    name: 'Isabella Contini',
    role: 'Private Client — Villa Serena, Tuscany',
    initials: 'IC',
  },
  {
    quote: "Our headquarters needed to embody both power and refinement. Orenzi delivered exactly that — a space that commands respect without a word spoken.",
    name: 'James Thornton',
    role: 'CEO, Thornton Capital Group',
    initials: 'JT',
  },
  {
    quote: "The team spent months in Japan studying our culture before proposing a single concept. That dedication is rare. The result feels as though it has always been there.",
    name: 'Aiko Nakamura',
    role: 'Private Client — Residence Nakamura, Tokyo',
    initials: 'AN',
  },
]

const MATERIALS = [
  {
    name: 'Wood',
    title: 'Reclaimed & Exotic Hardwoods',
    desc: 'From centuries-old reclaimed oak to sustainably sourced American walnut, our wood selections bear the marks of time and craftsmanship. Each plank is hand-selected, kiln-dried, and finished by our master artisans in the traditional manner.',
    imgs: [IMG.woodcut, IMG.shop, IMG.tools],
  },
  {
    name: 'Stone',
    title: 'Rare Marbles & Natural Stone',
    desc: 'We source directly from Italian and Turkish quarries — Calacatta Viola, Nero Marquina, Sahara Noir. Each slab is singular, chosen for its unique veining, tonal depth, and geological narrative. Stone is not a surface; it is a landscape.',
    imgs: [IMG.marble, IMG.stone, IMG.fabric],
  },
  {
    name: 'Metal',
    title: 'Burnished Metals & Artisan Alloys',
    desc: 'Brushed brass, blackened steel, patinated bronze — our metal finishes are achieved through traditional oxidation and burnishing techniques. They develop character over time, never fade, and tell the story of light through every hour of the day.',
    imgs: [IMG.shop, IMG.tools, IMG.woodcut],
  },
  {
    name: 'Leather',
    title: 'Full-Grain & Heritage Leathers',
    desc: "Sourced from the finest tanneries in Ponte a Egola, Tuscany, our leather collection includes full-grain vegetable-tanned hides aged over weeks. The result is a material that breathes, softens, and grows more beautiful with every year of use.",
    imgs: [IMG.stone, IMG.fabric, IMG.marble],
  },
  {
    name: 'Fabric',
    title: 'Bespoke Textiles & Haute Couture Weaves',
    desc: 'We collaborate with artisan weavers in Lyon and Umbria to create exclusive fabrics unavailable in any catalog — jacquards, velvets, raw linens, and silk-wool blends that carry the warmth and irregularity only handcraft can produce.',
    imgs: [IMG.fabric, IMG.marble, IMG.stone],
  },
]

// ─── Navigation ───────────────────────────────────────────────────────────────

function Nav({ scrolled }: { scrolled: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const dark = scrolled
  const fg = dark ? '#0C0B0A' : '#FEFCF9'
  const bgStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
    padding: `${dark ? 14 : 22}px 48px`,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
    backgroundColor: dark ? 'rgba(248,245,240,0.94)' : 'transparent',
    backdropFilter: dark ? 'blur(16px)' : 'none',
    borderBottom: dark ? '1px solid rgba(12,11,10,0.07)' : 'none',
  }

  return (
    <header style={bgStyle}>
      <a href="#home" style={{ textDecoration: 'none' }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '20px', fontWeight: 600,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: fg, transition: 'color 0.5s ease',
        }}>
          Orenzi{' '}
          <span style={{ fontWeight: 300, fontStyle: 'italic', letterSpacing: '0.06em' }}>Atelier</span>
        </div>
      </a>

      <nav className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {(['About', 'Projects', 'Services', 'Process', 'Contact'] as const).map(link => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className="nav-link"
            style={{ color: fg, transition: 'color 0.5s ease, opacity 0.3s ease' }}
          >
            {link}
          </a>
        ))}
        <a
          href="#contact"
          style={{
            display: 'inline-block', padding: '11px 26px',
            border: `1px solid ${dark ? 'rgba(12,11,10,0.35)' : 'rgba(254,252,249,0.45)'}`,
            color: fg,
            fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
            textDecoration: 'none', fontFamily: "'Inter', sans-serif", fontWeight: 400,
            transition: 'all 0.4s ease',
          }}
        >
          Book Consultation
        </a>
      </nav>

      <button
        className="show-mobile"
        onClick={() => setMenuOpen(v => !v)}
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', gap: '5px', padding: '4px',
        }}
      >
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '22px', height: '1px',
            background: fg,
            transition: 'all 0.3s ease',
            transform: menuOpen
              ? i === 0 ? 'rotate(45deg) translateY(6px)' : i === 2 ? 'rotate(-45deg) translateY(-6px)' : 'scaleX(0)'
              : 'none',
          }} />
        ))}
      </button>

      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 199,
          background: '#0C0B0A',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '40px',
        }}>
          {['About', 'Projects', 'Services', 'Process', 'Contact'].map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '48px', fontWeight: 300,
                color: '#FEFCF9', textDecoration: 'none',
                letterSpacing: '0.04em',
                transition: 'opacity 0.2s ease',
              }}
            >
              {link}
            </a>
          ))}
        </div>
      )}
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const scrollY = useScrollY()

  return (
    <section id="home" style={{
      position: 'relative', height: '100vh', overflow: 'hidden',
      display: 'flex', alignItems: 'flex-end',
      background: '#0C0B0A',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        transform: `translateY(${scrollY * 0.38}px)`,
        willChange: 'transform',
      }}>
        <img
          src={IMG.hero}
          alt="Luxury interior crafted by Orenzi Atelier"
          style={{ width: '100%', height: '115%', objectFit: 'cover', objectPosition: 'center 30%' }}
        />
      </div>

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(12,11,10,0.88) 0%, rgba(12,11,10,0.42) 45%, rgba(12,11,10,0.12) 100%)',
      }} />

      <div style={{ position: 'relative', zIndex: 10, padding: '0 80px 96px', maxWidth: '960px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          marginBottom: '32px',
        }}>
          <div style={{ width: '36px', height: '1px', background: 'rgba(200,184,154,0.7)' }} />
          <span className="section-label" style={{ color: 'rgba(200,184,154,0.85)' }}>
            Est. 2008 &nbsp;·&nbsp; Milano &nbsp;·&nbsp; London &nbsp;·&nbsp; New York
          </span>
        </div>

        <h1 className="display-heading" style={{
          fontSize: 'clamp(64px, 9vw, 128px)',
          color: '#FEFCF9',
          marginBottom: '28px',
        }}>
          Crafting<br />
          <em className="display-italic" style={{ color: '#C8B89A' }}>Timeless</em><br />
          Spaces.
        </h1>

        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '15px', lineHeight: 1.75,
          color: 'rgba(254,252,249,0.68)',
          maxWidth: '460px',
          fontWeight: 300,
          letterSpacing: '0.01em',
          marginBottom: '52px',
        }}>
          Bespoke interiors designed for those who value elegance,
          craftsmanship and exclusivity.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
          <a href="#contact" className="btn-primary">
            Book a Consultation
          </a>
          <a href="#projects" className="btn-ghost" style={{ color: '#FEFCF9' }}>
            View Portfolio
            <div style={{ width: '28px', height: '1px', background: 'rgba(254,252,249,0.6)' }} />
          </a>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 48, right: 56, zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase',
          color: 'rgba(254,252,249,0.4)',
          writingMode: 'vertical-rl', transform: 'rotate(180deg)',
        }}>Scroll</span>
        <div className="scroll-pulse" style={{
          width: '1px', height: '56px',
          background: 'linear-gradient(to bottom, rgba(200,184,154,0.7), transparent)',
        }} />
      </div>

      <div style={{
        position: 'absolute', top: '50%', right: 56, transform: 'translateY(-50%)',
        zIndex: 10, textAlign: 'right',
      }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '80px', fontWeight: 300,
          color: 'rgba(254,252,249,0.06)',
          lineHeight: 1, letterSpacing: '-0.02em',
        }}>340+</div>
        <div className="section-label" style={{ color: 'rgba(254,252,249,0.25)' }}>
          Projects
        </div>
      </div>
    </section>
  )
}

// ─── Marquee Band ──────────────────────────────────────────────────────────────

function Marquee() {
  const items = Array(8).fill('Craftsmanship · Elegance · Exclusivity · Timeless Design · Bespoke Interiors · ')
  return (
    <div style={{
      overflow: 'hidden',
      background: '#0C0B0A',
      padding: '18px 0',
      borderTop: '1px solid rgba(254,252,249,0.06)',
      borderBottom: '1px solid rgba(254,252,249,0.06)',
    }}>
      <div className="marquee-track" style={{ display: 'inline-block' }}>
        {items.map((text, i) => (
          <span key={i} style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '14px', fontStyle: 'italic',
            color: 'rgba(200,184,154,0.5)',
            marginRight: '4px',
            letterSpacing: '0.04em',
          }}>{text}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Brand Story ──────────────────────────────────────────────────────────────

function BrandStory() {
  const [ref, inView] = useInView<HTMLElement>()

  return (
    <section id="about" ref={ref} style={{ padding: '140px 0', background: '#FEFCF9', overflow: 'hidden' }}>
      <div style={{
        maxWidth: '1400px', margin: '0 auto', padding: '0 80px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px', alignItems: 'center',
      }}>
        <div style={{
          opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateX(-40px)',
          transition: 'all 1s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '56px' }}>
            <div style={{ width: '36px', height: '1px', background: '#C8B89A' }} />
            <span className="section-label">Our Story</span>
          </div>

          <h2 className="display-heading" style={{ fontSize: 'clamp(48px, 5vw, 72px)', color: '#0C0B0A', marginBottom: '40px' }}>
            Born from a passion<br />
            for <em className="display-italic" style={{ color: '#8A7A6A' }}>Italian craft.</em>
          </h2>

          <p className="body-text" style={{ marginBottom: '28px', maxWidth: '480px' }}>
            Founded in 2008 in the heart of Milano, Orenzi Atelier began as a dialogue between
            two disciplines — architecture and furniture-making. Our founders believed that truly
            great spaces cannot be separated from the objects that inhabit them.
          </p>
          <p className="body-text" style={{ marginBottom: '56px', maxWidth: '480px' }}>
            Today, we operate across three continents with a singular philosophy: every project
            is a collaboration between client, space, and material — an act of listening as much
            as designing.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              { year: '2008', event: 'Atelier founded in Milano' },
              { year: '2012', event: 'First international commission, London' },
              { year: '2017', event: 'Expansion to New York and Tokyo' },
              { year: '2021', event: 'Launch of the Custom Furniture studio' },
              { year: '2024', event: '340 projects across 28 cities' },
            ].map(({ year, event }, i) => (
              <div key={year} style={{
                display: 'flex', alignItems: 'flex-start', gap: '28px',
                padding: '20px 0',
                borderBottom: i < 4 ? '1px solid rgba(12,11,10,0.08)' : 'none',
                opacity: inView ? 1 : 0,
                transform: inView ? 'none' : 'translateY(16px)',
                transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.08}s`,
              }}>
                <span style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '13px', fontWeight: 400, color: '#C8B89A',
                  letterSpacing: '0.06em', minWidth: '44px',
                }}>{year}</span>
                <span style={{ fontSize: '13px', color: '#6B5F55', fontWeight: 300, letterSpacing: '0.01em' }}>
                  {event}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          position: 'relative',
          opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateX(40px)',
          transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.2s',
        }}>
          <div style={{
            position: 'absolute', top: '-40px', left: '-40px',
            width: '220px', height: '260px', background: '#EDE5D8',
            zIndex: 0,
          }} />
          <div style={{ position: 'relative', zIndex: 1, overflow: 'hidden' }}>
            <img
              src={IMG.story}
              alt="Artisan craftsmanship at Orenzi Atelier"
              style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div style={{
            position: 'absolute', bottom: '-32px', right: '-32px',
            background: '#0C0B0A', padding: '28px 36px',
            zIndex: 2,
          }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '36px', fontWeight: 300, color: '#FEFCF9',
              lineHeight: 1.1,
            }}>16</div>
            <div className="section-label" style={{ color: 'rgba(254,252,249,0.5)', marginTop: '4px' }}>
              Years of craft
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Projects ─────────────────────────────────────────────────────────────────

type Project = typeof PROJECTS[0]

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handler) }
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(12,11,10,0.96)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{ maxWidth: '1100px', margin: '0 auto', padding: '100px 48px 80px', width: '100%' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'fixed', top: 28, right: 48,
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(254,252,249,0.5)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}
        >
          Close &nbsp;✕
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '80px', alignItems: 'start' }}>
          <div>
            <img
              src={project.img}
              alt={project.name}
              style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block', marginBottom: '32px' }}
            />
            <p className="body-text" style={{ color: 'rgba(254,252,249,0.6)', fontSize: '15px', lineHeight: 1.8 }}>
              {project.desc}
            </p>
          </div>

          <div style={{ paddingTop: '16px' }}>
            <span className="section-label" style={{ color: 'rgba(200,184,154,0.7)' }}>{project.cat}</span>
            <h2 className="display-heading" style={{
              fontSize: '52px', color: '#FEFCF9',
              marginTop: '16px', marginBottom: '40px',
            }}>{project.name}</h2>

            {[
              { label: 'Location', value: project.location },
              { label: 'Year', value: project.year },
              { label: 'Area', value: project.area },
              { label: 'Category', value: project.cat },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '16px 0',
                borderBottom: '1px solid rgba(254,252,249,0.08)',
              }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(254,252,249,0.3)', fontFamily: "'Inter', sans-serif" }}>
                  {label}
                </span>
                <span style={{ fontSize: '13px', color: 'rgba(254,252,249,0.75)', fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '0.04em' }}>
                  {value}
                </span>
              </div>
            ))}

            <div style={{ marginTop: '48px' }}>
              <a href="#contact" className="btn-primary" style={{ display: 'inline-block' }} onClick={onClose}>
                Enquire About This Project
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Projects() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [selected, setSelected] = useState<Project | null>(null)
  const [ref, inView] = useInView<HTMLElement>()

  const filters = ['All', 'Residences', 'Commercial', 'Corporate', 'Hospitality']
  const filtered = activeFilter === 'All' ? PROJECTS : PROJECTS.filter(p => p.cat === activeFilter)

  return (
    <section id="projects" ref={ref} style={{ padding: '140px 0', background: '#F8F5F0' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 80px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: '72px', flexWrap: 'wrap', gap: '32px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '1px', background: '#C8B89A' }} />
              <span className="section-label">Signature Projects</span>
            </div>
            <h2 className="display-heading" style={{
              fontSize: 'clamp(48px, 5vw, 72px)', color: '#0C0B0A',
              opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(24px)',
              transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s',
            }}>
              Selected Works
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`filter-btn${activeFilter === f ? ' active' : ''}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '2px',
        }}>
          {filtered.map((project, i) => (
            <div
              key={project.id}
              className="project-card"
              onClick={() => setSelected(project)}
              style={{
                cursor: 'pointer', aspectRatio: '4/3',
                opacity: inView ? 1 : 0,
                transform: inView ? 'none' : 'translateY(32px)',
                transition: `opacity 0.7s ease ${0.1 + i * 0.08}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.08}s`,
              }}
            >
              <img
                src={project.img}
                alt={project.name}
                className="cover-img"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div className="overlay" />
              <div className="info">
                <span style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(200,184,154,0.8)', fontFamily: "'Inter', sans-serif" }}>
                  {project.cat} — {project.location}
                </span>
                <div style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '28px', fontWeight: 300, color: '#FEFCF9',
                  marginTop: '6px', lineHeight: 1.1,
                }}>
                  {project.name}
                </div>
                <div style={{
                  marginTop: '14px',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: 'rgba(254,252,249,0.55)', fontFamily: "'Inter', sans-serif",
                }}>
                  View Case Study
                  <div style={{ width: '20px', height: '1px', background: 'rgba(254,252,249,0.4)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}

// ─── Services ─────────────────────────────────────────────────────────────────

function Services() {
  const [ref, inView] = useInView<HTMLElement>()

  return (
    <section id="services" ref={ref} style={{ padding: '140px 0', background: '#FEFCF9' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '88px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '1px', background: '#C8B89A' }} />
            <span className="section-label">What We Do</span>
            <div style={{ width: '36px', height: '1px', background: '#C8B89A' }} />
          </div>
          <h2 className="display-heading" style={{
            fontSize: 'clamp(48px, 5vw, 68px)', color: '#0C0B0A',
            opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(24px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}>
            Our Services
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1px',
          background: 'rgba(12,11,10,0.08)',
        }}>
          {SERVICES.map((s, i) => (
            <div
              key={s.title}
              className="service-card"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'none' : 'translateY(32px)',
                transition: `opacity 0.7s ease ${0.1 + i * 0.08}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.08}s`,
              }}
            >
              <div style={{ color: '#8A7A6A', marginBottom: '28px' }}>{s.icon}</div>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '24px', fontWeight: 400, color: '#0C0B0A',
                marginBottom: '16px', letterSpacing: '0.02em',
              }}>{s.title}</h3>
              <p className="body-text" style={{ fontSize: '13px' }}>{s.desc}</p>
              <div style={{
                marginTop: '32px',
                fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase',
                color: '#C8B89A', fontFamily: "'Inter', sans-serif",
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                Learn More <div style={{ width: '16px', height: '1px', background: '#C8B89A' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function Stats() {
  const [ref, inView] = useInView<HTMLElement>()
  const v0 = useCounter(STATS[0].value, inView)
  const v1 = useCounter(STATS[1].value, inView)
  const v2 = useCounter(STATS[2].value, inView)
  const v3 = useCounter(STATS[3].value, inView)
  const vals = [v0, v1, v2, v3]

  return (
    <section ref={ref} style={{
      padding: '120px 0',
      background: '#0C0B0A',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(200,184,154,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(200,184,154,0.04) 0%, transparent 60%)',
      }} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 80px', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '1px', background: 'rgba(200,184,154,0.4)' }} />
            <span className="section-label" style={{ color: 'rgba(200,184,154,0.6)' }}>By the Numbers</span>
            <div style={{ width: '36px', height: '1px', background: 'rgba(200,184,154,0.4)' }} />
          </div>
          <h2 className="display-heading" style={{
            fontSize: 'clamp(40px, 4vw, 60px)', color: '#FEFCF9',
            opacity: inView ? 1 : 0,
            transition: 'opacity 0.8s ease',
          }}>
            Why Choose <em className="display-italic" style={{ color: '#C8B89A' }}>Orenzi</em>
          </h2>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0', borderTop: '1px solid rgba(254,252,249,0.06)',
        }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              padding: '56px 40px',
              borderRight: i < 3 ? '1px solid rgba(254,252,249,0.06)' : 'none',
              textAlign: 'center',
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateY(24px)',
              transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s`,
            }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(52px, 6vw, 80px)',
                fontWeight: 300, color: '#FEFCF9',
                lineHeight: 1, letterSpacing: '-0.02em',
              }}>
                {vals[i]}{s.suffix}
              </div>
              <div className="section-label" style={{
                color: 'rgba(200,184,154,0.55)', marginTop: '12px',
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Design Process ───────────────────────────────────────────────────────────

function Process() {
  const [ref, inView] = useInView<HTMLElement>()
  const [active, setActive] = useState(0)

  return (
    <section id="process" ref={ref} style={{ padding: '140px 0', background: '#F8F5F0', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 80px' }}>
        <div style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '1px', background: '#C8B89A' }} />
            <span className="section-label">How We Work</span>
          </div>
          <h2 className="display-heading" style={{
            fontSize: 'clamp(48px, 5vw, 72px)', color: '#0C0B0A',
            opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(24px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}>
            The Design Process
          </h2>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '100px', alignItems: 'start',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {PROCESS.map((step, i) => (
              <div
                key={step.n}
                onClick={() => setActive(i)}
                style={{
                  padding: '28px 0',
                  borderBottom: i < 5 ? '1px solid rgba(12,11,10,0.08)' : 'none',
                  cursor: 'pointer',
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'none' : 'translateX(-24px)',
                  transition: `opacity 0.6s ease ${0.1 + i * 0.08}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.08}s`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '13px', color: active === i ? '#C8B89A' : 'rgba(12,11,10,0.25)',
                    letterSpacing: '0.08em', transition: 'color 0.3s ease',
                    minWidth: '28px',
                  }}>{step.n}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '22px', fontWeight: active === i ? 400 : 300,
                      color: active === i ? '#0C0B0A' : '#8A7A6A',
                      letterSpacing: '0.02em',
                      transition: 'all 0.3s ease',
                    }}>{step.name}</div>
                    {active === i && (
                      <p className="body-text" style={{ marginTop: '10px', fontSize: '13px', maxWidth: '400px' }}>
                        {step.desc}
                      </p>
                    )}
                  </div>
                  <div style={{
                    width: '20px', height: '1px',
                    background: active === i ? '#C8B89A' : 'rgba(12,11,10,0.15)',
                    transition: 'all 0.3s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{
            position: 'sticky', top: '100px',
            opacity: inView ? 1 : 0,
            transform: inView ? 'none' : 'translateX(40px)',
            transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.3s',
          }}>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <img
                src={IMG.tools}
                alt="Orenzi Atelier design process"
                style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to top, rgba(12,11,10,0.7) 0%, transparent 100%)',
                padding: '40px 36px',
              }}>
                <div style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '42px', fontWeight: 300, color: '#FEFCF9',
                  lineHeight: 1.1,
                }}>
                  {PROCESS[active].name}
                </div>
                <div style={{
                  width: '36px', height: '1px', background: '#C8B89A', marginTop: '12px',
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function Testimonials() {
  const [ref, inView] = useInView<HTMLElement>()
  const [active, setActive] = useState(0)

  return (
    <section id="about" ref={ref} style={{ padding: '140px 0', background: '#0C0B0A' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '1px', background: 'rgba(200,184,154,0.4)' }} />
            <span className="section-label" style={{ color: 'rgba(200,184,154,0.6)' }}>Client Voices</span>
            <div style={{ width: '36px', height: '1px', background: 'rgba(200,184,154,0.4)' }} />
          </div>
          <h2 className="display-heading" style={{
            fontSize: 'clamp(40px, 5vw, 64px)', color: '#FEFCF9',
            opacity: inView ? 1 : 0, transition: 'opacity 0.8s ease',
          }}>
            What Our Clients Say
          </h2>
        </div>

        <div style={{
          position: 'relative', overflow: 'hidden',
          opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(32px)',
          transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s',
        }}>
          <div style={{ padding: '64px 72px', background: 'rgba(254,252,249,0.03)', border: '1px solid rgba(254,252,249,0.06)' }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '120px', lineHeight: 0.7, color: 'rgba(200,184,154,0.15)',
              marginBottom: '32px',
            }}>"</div>

            <blockquote style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 300,
              color: 'rgba(254,252,249,0.88)', lineHeight: 1.5,
              fontStyle: 'italic', letterSpacing: '0.01em',
              maxWidth: '800px', marginBottom: '48px',
              transition: 'opacity 0.4s ease',
            }}>
              {TESTIMONIALS[active].quote}
            </blockquote>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: '#C8B89A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '16px', color: '#0C0B0A', fontWeight: 600,
                letterSpacing: '0.05em',
              }}>
                {TESTIMONIALS[active].initials}
              </div>
              <div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '18px', color: '#FEFCF9', letterSpacing: '0.04em',
                }}>
                  {TESTIMONIALS[active].name}
                </div>
                <div className="section-label" style={{ color: 'rgba(254,252,249,0.35)', marginTop: '2px' }}>
                  {TESTIMONIALS[active].role}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex', gap: '8px', marginTop: '24px', justifyContent: 'center',
          }}>
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  width: active === i ? '32px' : '8px', height: '2px',
                  background: active === i ? '#C8B89A' : 'rgba(254,252,249,0.2)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'all 0.4s ease', borderRadius: '1px',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Materials ────────────────────────────────────────────────────────────────

function Materials() {
  const [ref, inView] = useInView<HTMLElement>()
  const [active, setActive] = useState(0)
  const mat = MATERIALS[active]

  return (
    <section ref={ref} style={{ padding: '140px 0', background: '#FEFCF9' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 80px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: '80px', flexWrap: 'wrap', gap: '32px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '1px', background: '#C8B89A' }} />
              <span className="section-label">Craftsmanship</span>
            </div>
            <h2 className="display-heading" style={{
              fontSize: 'clamp(48px, 5vw, 72px)', color: '#0C0B0A',
              opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(24px)',
              transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
            }}>
              The Materials
            </h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '80px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {MATERIALS.map((m, i) => (
              <button
                key={m.name}
                onClick={() => setActive(i)}
                className={`material-tab${active === i ? ' active' : ''}`}
                style={{
                  opacity: inView ? 1 : 0,
                  transition: `opacity 0.5s ease ${i * 0.06}s, all 0.3s ease`,
                }}
              >
                {m.name}
              </button>
            ))}
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start',
            opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateX(32px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s',
          }}>
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '4px', height: '520px' }}>
              <div style={{ overflow: 'hidden', background: '#EDE5D8' }}>
                <img
                  key={mat.imgs[0]}
                  src={mat.imgs[0]}
                  alt={mat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.5s ease' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                {mat.imgs.slice(1).map((img, i) => (
                  <div key={i} style={{ overflow: 'hidden', background: '#EDE5D8' }}>
                    <img
                      src={img}
                      alt={mat.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ paddingTop: '8px' }}>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '36px', fontWeight: 300, color: '#0C0B0A',
                letterSpacing: '0.02em', lineHeight: 1.15,
                marginBottom: '24px',
              }}>
                {mat.title}
              </h3>
              <div style={{ width: '36px', height: '1px', background: '#C8B89A', marginBottom: '24px' }} />
              <p className="body-text" style={{ lineHeight: 1.9 }}>{mat.desc}</p>

              <div style={{ marginTop: '40px', padding: '28px', background: '#F8F5F0', borderLeft: '2px solid #C8B89A' }}>
                <p style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '18px', fontStyle: 'italic', color: '#6B5F55',
                  lineHeight: 1.6,
                }}>
                  "Every material we select has a story. Our role is to let that story
                  speak through the architecture."
                </p>
                <div className="section-label" style={{ marginTop: '12px' }}>Marco Orenzi, Founder</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Before & After ───────────────────────────────────────────────────────────

function BeforeAfter() {
  const [pos, setPos] = useState(50)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [ref, inView] = useInView<HTMLElement>()

  const updatePos = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const p = Math.max(4, Math.min(96, ((clientX - rect.left) / rect.width) * 100))
    setPos(p)
  }, [])

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    updatePos(e.clientX)
  }
  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragging) updatePos(e.clientX)
  }
  const handlePointerUp = () => setDragging(false)

  return (
    <section ref={ref} style={{ padding: '140px 0', background: '#F8F5F0' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '1px', background: '#C8B89A' }} />
            <span className="section-label">Transformation</span>
            <div style={{ width: '36px', height: '1px', background: '#C8B89A' }} />
          </div>
          <h2 className="display-heading" style={{
            fontSize: 'clamp(40px, 5vw, 64px)', color: '#0C0B0A',
            opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(24px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}>
            Before &amp; After
          </h2>
          <p className="body-text" style={{ maxWidth: '460px', margin: '16px auto 0', textAlign: 'center' }}>
            Drag the handle to reveal the transformation of Villa Serena, Tuscany — 2024.
          </p>
        </div>

        <div
          ref={containerRef}
          style={{
            position: 'relative', height: '640px', overflow: 'hidden',
            cursor: dragging ? 'ew-resize' : 'col-resize',
            background: '#EDE5D8',
            opacity: inView ? 1 : 0, transform: inView ? 'none' : 'scale(0.97)',
            transition: 'opacity 0.8s ease 0.2s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s',
            userSelect: 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <img
            src={IMG.before}
            alt="Before renovation"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
          />
          <img
            src={IMG.after}
            alt="After renovation by Orenzi Atelier"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              clipPath: `inset(0 ${100 - pos}% 0 0)`,
              transition: dragging ? 'none' : 'clip-path 0.1s ease',
              pointerEvents: 'none',
            }}
          />

          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${pos}%`, transform: 'translateX(-50%)',
            width: '2px', background: 'white',
            pointerEvents: 'none',
          }} />

          <div style={{
            position: 'absolute', top: '50%', left: `${pos}%`,
            transform: 'translate(-50%, -50%)',
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'white',
            boxShadow: '0 4px 24px rgba(12,11,10,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
              <path d="M1 5h16M5 1L1 5l4 4M13 1l4 4-4 4" stroke="#0C0B0A" strokeWidth="1" strokeLinecap="round"/>
            </svg>
          </div>

          <div style={{
            position: 'absolute', top: '20px', left: '20px',
            background: 'rgba(12,11,10,0.55)', backdropFilter: 'blur(8px)',
            padding: '6px 14px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'rgba(254,252,249,0.75)',
          }}>Before</div>

          <div style={{
            position: 'absolute', top: '20px', right: '20px',
            background: 'rgba(12,11,10,0.55)', backdropFilter: 'blur(8px)',
            padding: '6px 14px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'rgba(254,252,249,0.75)',
          }}>After</div>
        </div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTASection() {
  const [ref, inView] = useInView<HTMLElement>()

  return (
    <section id="contact" ref={ref} style={{
      padding: '160px 0',
      background: '#0C0B0A',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(ellipse at 50% 100%, rgba(200,184,154,0.08) 0%, transparent 60%)',
      }} />

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div className="display-heading" style={{
          fontSize: 'clamp(120px, 18vw, 280px)',
          color: 'rgba(254,252,249,0.025)',
          whiteSpace: 'nowrap', letterSpacing: '-0.02em',
          lineHeight: 1,
        }}>
          Orenzi
        </div>
      </div>

      <div style={{
        maxWidth: '900px', margin: '0 auto', padding: '0 80px',
        textAlign: 'center', position: 'relative', zIndex: 10,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '40px',
          opacity: inView ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}>
          <div style={{ width: '36px', height: '1px', background: 'rgba(200,184,154,0.4)' }} />
          <span className="section-label" style={{ color: 'rgba(200,184,154,0.6)' }}>Begin the Journey</span>
          <div style={{ width: '36px', height: '1px', background: 'rgba(200,184,154,0.4)' }} />
        </div>

        <h2 className="display-heading" style={{
          fontSize: 'clamp(52px, 7vw, 96px)', color: '#FEFCF9',
          marginBottom: '28px',
          opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(32px)',
          transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s',
        }}>
          {"Let’s Build Something"}<br />
          <em className="display-italic" style={{ color: '#C8B89A' }}>Extraordinary.</em>
        </h2>

        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '15px', lineHeight: 1.75, color: 'rgba(254,252,249,0.5)',
          maxWidth: '520px', margin: '0 auto 56px',
          fontWeight: 300,
          opacity: inView ? 1 : 0,
          transition: 'opacity 0.8s ease 0.3s',
        }}>
          We accept a limited number of commissions each year to ensure every project
          receives our full attention. Contact us to begin the conversation.
        </p>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px',
          flexWrap: 'wrap',
          opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(16px)',
          transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s',
        }}>
          <a href="mailto:studio@orenziatelier.com" className="btn-primary">
            Book a Consultation
          </a>
          <a
            href="tel:+12125550142"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '18px', color: 'rgba(254,252,249,0.45)',
              textDecoration: 'none', letterSpacing: '0.04em',
              transition: 'color 0.3s ease',
            }}
          >
            +1 212 555 0142
          </a>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) { setSubscribed(true); setEmail('') }
  }

  return (
    <footer style={{ background: '#1D1B19', padding: '80px 0 40px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 80px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '64px', marginBottom: '80px',
          borderBottom: '1px solid rgba(254,252,249,0.06)',
          paddingBottom: '64px',
        }}>
          <div>
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '24px', fontWeight: 600,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: '#FEFCF9', marginBottom: '20px',
            }}>
              Orenzi <span style={{ fontWeight: 300, fontStyle: 'italic' }}>Atelier</span>
            </div>
            <p style={{
              fontSize: '13px', lineHeight: 1.75, color: 'rgba(254,252,249,0.35)',
              fontWeight: 300, maxWidth: '280px', fontFamily: "'Inter', sans-serif",
              marginBottom: '36px',
            }}>
              Bespoke interiors and custom furniture for those who value elegance
              above all else. Milano · London · New York.
            </p>

            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                style={{
                  flex: 1, padding: '12px 16px',
                  background: 'rgba(254,252,249,0.05)',
                  border: '1px solid rgba(254,252,249,0.1)',
                  borderRight: 'none',
                  color: '#FEFCF9', fontSize: '12px',
                  fontFamily: "'Inter', sans-serif",
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '12px 20px',
                  background: '#C8B89A', color: '#0C0B0A',
                  border: 'none', cursor: 'pointer',
                  fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase',
                  fontFamily: "'Inter', sans-serif", fontWeight: 500,
                  transition: 'background 0.3s ease',
                }}
              >
                {subscribed ? '✓' : 'Subscribe'}
              </button>
            </form>
          </div>

          <div>
            <div className="section-label" style={{ color: 'rgba(254,252,249,0.3)', marginBottom: '24px' }}>Navigate</div>
            {['About', 'Projects', 'Services', 'Process', 'Contact'].map(link => (
              <div key={link} style={{ marginBottom: '12px' }}>
                <a href={`#${link.toLowerCase()}`} style={{
                  fontSize: '13px', color: 'rgba(254,252,249,0.5)',
                  textDecoration: 'none', fontFamily: "'Inter', sans-serif",
                  fontWeight: 300, letterSpacing: '0.01em',
                  transition: 'color 0.3s ease',
                }}>
                  {link}
                </a>
              </div>
            ))}
          </div>

          <div>
            <div className="section-label" style={{ color: 'rgba(254,252,249,0.3)', marginBottom: '24px' }}>Connect</div>
            {[
              { label: 'Instagram', href: '#' },
              { label: 'Pinterest', href: '#' },
              { label: 'WhatsApp', href: '#' },
              { label: 'LinkedIn', href: '#' },
            ].map(({ label, href }) => (
              <div key={label} style={{ marginBottom: '12px' }}>
                <a href={href} style={{
                  fontSize: '13px', color: 'rgba(254,252,249,0.5)',
                  textDecoration: 'none', fontFamily: "'Inter', sans-serif",
                  fontWeight: 300, transition: 'color 0.3s ease',
                }}>
                  {label}
                </a>
              </div>
            ))}
          </div>

          <div>
            <div className="section-label" style={{ color: 'rgba(254,252,249,0.3)', marginBottom: '24px' }}>Contact</div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(254,252,249,0.25)', fontFamily: "'Inter', sans-serif", marginBottom: '6px' }}>Studio</div>
              <div style={{ fontSize: '13px', color: 'rgba(254,252,249,0.5)', fontFamily: "'Inter', sans-serif", fontWeight: 300, lineHeight: 1.6 }}>
                Via della Spiga 14<br />20121 Milano, Italy
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(254,252,249,0.25)', fontFamily: "'Inter', sans-serif", marginBottom: '6px' }}>Email</div>
              <a href="mailto:studio@orenziatelier.com" style={{
                fontSize: '13px', color: 'rgba(254,252,249,0.5)',
                textDecoration: 'none', fontFamily: "'Inter', sans-serif",
                transition: 'color 0.3s ease',
              }}>
                studio@orenziatelier.com
              </a>
            </div>
            <div>
              <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(254,252,249,0.25)', fontFamily: "'Inter', sans-serif", marginBottom: '6px' }}>Phone</div>
              <a href="tel:+390287150120" style={{
                fontSize: '13px', color: 'rgba(254,252,249,0.5)',
                textDecoration: 'none', fontFamily: "'Inter', sans-serif",
              }}>
                +39 02 8715 0120
              </a>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(254,252,249,0.2)', fontFamily: "'Inter', sans-serif", letterSpacing: '0.06em' }}>
            &copy; 2024 Orenzi Atelier S.r.l. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '32px' }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(t => (
              <a key={t} href="#" style={{
                fontSize: '10px', color: 'rgba(254,252,249,0.2)',
                textDecoration: 'none', fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.1em',
              }}>{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const scrollY = useScrollY()
  const scrolled = scrollY > 60

  return (
    <div style={{ background: '#F8F5F0' }}>
      <Nav scrolled={scrolled} />
      <Hero />
      <Marquee />
      <BrandStory />
      <Projects />
      <Services />
      <Stats />
      <Process />
      <Testimonials />
      <Materials />
      <BeforeAfter />
      <CTASection />
      <Footer />
    </div>
  )
}
