'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaLightbulb, FaRegLightbulb } from 'react-icons/fa6'

const NAV = [
  { label: 'Profile', path: '/' },
  { label: 'Publications', path: '/publications' },
  { label: 'Projects', path: '/projects' },
  { label: 'Blogs', path: '/blogs' },
]

const SECTION_MAP: Record<string, string> = {
  '/': 'section-profile',
  '/publications': 'section-publications',
  '/projects': 'section-projects',
  '/blogs': 'section-blogs',
}

// Custom rAF smooth scroll — always animates, ignores prefers-reduced-motion
// short-circuiting and any stale native scroll behaviour.
let scrollRAF: number | null = null
function smoothScrollTo(targetY: number, duration = 650) {
  if (scrollRAF) cancelAnimationFrame(scrollRAF)
  const startY = window.scrollY
  const dist = targetY - startY
  if (Math.abs(dist) < 2) return
  const start = performance.now()
  // easeInOutCubic
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

  const step = (now: number) => {
    const elapsed = now - start
    const t = Math.min(elapsed / duration, 1)
    window.scrollTo(0, startY + dist * ease(t))
    if (t < 1) {
      scrollRAF = requestAnimationFrame(step)
    } else {
      scrollRAF = null
    }
  }
  scrollRAF = requestAnimationFrame(step)
}

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [theme, setTheme] = useState<'dark' | 'light'>('light')
  const [menuOpen, setMenuOpen] = useState(false)
  const [activePath, setActivePath] = useState(pathname)

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    const t = saved || 'light'
    setTheme(t)
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  // Listen for scroll-based section changes from ScrollPage
  useEffect(() => {
    const handler = (e: Event) => setActivePath((e as CustomEvent<string>).detail)
    window.addEventListener('sectionchange', handler)
    return () => window.removeEventListener('sectionchange', handler)
  }, [])

  useEffect(() => { setActivePath(pathname) }, [pathname])
  useEffect(() => { setMenuOpen(false) }, [pathname])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  // Scroll to section if present on the current page, else route
  const navigate = (path: string) => {
    const el = document.getElementById(SECTION_MAP[path])
    if (el) {
      const targetY = Math.max(el.getBoundingClientRect().top + window.scrollY - 48, 0)
      smoothScrollTo(targetY)
    } else {
      router.push(path)
    }
    setMenuOpen(false)
  }

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-12"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--nav-bg)', backdropFilter: 'blur(8px)' }}
      >
        <Link href="/" className="mono text-xs tracking-widest uppercase" style={{ color: 'var(--fg)', letterSpacing: '0.2em', fontWeight: 500 }}>
          S·S
        </Link>

        <div className="hidden sm:flex items-center gap-6 md:gap-8">
          {NAV.map((item) => {
            const active = activePath === item.path
            return (
              <button key={item.path}
                onClick={() => navigate(item.path)}
                className="mono tracking-widest uppercase transition-opacity duration-150"
                style={{ fontSize: '0.82rem', color: active ? 'var(--accent)' : 'var(--fg)', letterSpacing: '0.14em', fontWeight: active ? 700 : 500, opacity: active ? 1 : 0.65, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.opacity = '1' }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.opacity = '0.65' }}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 0,
              color: theme === 'light' ? 'var(--accent)' : 'var(--fg)',
              transition: 'color 0.15s, transform 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none' }}
          >
            {theme === 'light' ? <FaLightbulb size={18} /> : <FaRegLightbulb size={18} />}
          </button>

          <button
            className="sm:hidden flex flex-col gap-[5px] p-1"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span style={{ display: 'block', width: '18px', height: '1px', background: menuOpen ? 'var(--accent)' : 'var(--fg)', transition: 'background 0.15s, transform 0.2s', transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none' }} />
            <span style={{ display: 'block', width: '18px', height: '1px', background: menuOpen ? 'transparent' : 'var(--fg)', transition: 'background 0.15s' }} />
            <span style={{ display: 'block', width: '18px', height: '1px', background: menuOpen ? 'var(--accent)' : 'var(--fg)', transition: 'background 0.15s, transform 0.2s', transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none' }} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          className="fixed top-12 left-0 right-0 z-40 sm:hidden"
          style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border)' }}
        >
          {NAV.map((item) => {
            const active = activePath === item.path
            return (
              <button key={item.path}
                onClick={() => navigate(item.path)}
                className="mono flex items-center px-6 py-4 w-full text-left"
                style={{
                  color: active ? 'var(--accent)' : 'var(--fg)',
                  fontSize: '0.75rem', fontWeight: active ? 700 : 500,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  borderBottom: '1px solid var(--border)', background: 'none', border: 'none',
                  cursor: 'pointer',
                }}
              >
                {active && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', marginRight: '0.75rem', flexShrink: 0, display: 'inline-block' }} />}
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
