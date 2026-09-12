'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { FiMenu, FiMoon, FiSun, FiX } from 'react-icons/fi'

// Warm the CV on hover so the viewer tab opens from cache instead of waiting on the upstream fetch.
let resumeWarmed = false
export const warmResume = () => {
  if (resumeWarmed) return
  resumeWarmed = true
  fetch('/api/resume', { priority: 'low' } as RequestInit).catch(() => { resumeWarmed = false })
}

// Survives remounts within the SPA so the pill always animates from where it last was.
let rememberedPill: { left: number; right: number } | null = null

export const NAV_LINKS = [
  { href: '/', label: 'about' },
  { href: '/publications', label: 'publications' },
  { href: '/projects', label: 'projects' },
  { href: '/experience', label: 'work' },
  { href: '/blogs', label: 'writing' },
]

export default function Navigation({ hasResume, name }: { hasResume?: boolean; name: string }) {
  const pathname = usePathname()
  const [theme, setTheme] = useState('light')
  const [open, setOpen] = useState(false)
  const listRef = useRef<HTMLUListElement>(null)
  const [indicator, setIndicator] = useState<{ left: number; right: number; dir?: 'left' | 'right' } | null>(null)

  // Sections switch instantly on the client: push the URL (the App Router syncs usePathname) and
  // let SitePage re-render from data it already has. Modified clicks keep default browser behaviour.
  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    setOpen(false)
    if (href !== pathname) { window.history.pushState(null, '', href); window.scrollTo({ top: 0 }) }
  }

  useEffect(() => {
    const syncTheme = () => setTheme(document.documentElement.getAttribute('data-theme') || 'light')
    syncTheme()
    const observer = new MutationObserver(syncTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  // The pill is positioned by its left/right insets; CSS gives the leading edge a faster
  // transition than the trailing one, so it stretches toward the new link and settles.
  const lastRef = useRef<{ left: number; right: number } | null>(null)
  const rafRef = useRef(0)
  // Move the pill onto `target`. Called optimistically on pointer-down (before the route loads)
  // and again once the pathname settles, which is a no-op if the pill is already there.
  const moveTo = (target: HTMLElement | null, animate: boolean) => {
    if (!target || !listRef.current) { lastRef.current = null; return setIndicator(null) }
    const list = listRef.current.getBoundingClientRect()
    const rect = target.getBoundingClientRect()
    const next = { left: rect.left - list.left, right: list.right - rect.right }
    const mounted = lastRef.current !== null
    const last = lastRef.current ?? rememberedPill
    if (last && Math.abs(last.left - next.left) < 1 && Math.abs(last.right - next.right) < 1 && mounted) return
    lastRef.current = next
    rememberedPill = next
    if (!animate || !last || Math.abs(last.left - next.left) < 1) return setIndicator(next)
    const dir = next.left > last.left ? 'right' : 'left'
    if (mounted) return setIndicator({ ...next, dir })
    // Fresh mount: paint at the previous position first, then let the transition carry it over.
    setIndicator(last)
    rafRef.current = requestAnimationFrame(() => { rafRef.current = requestAnimationFrame(() => setIndicator({ ...next, dir })) })
  }
  useLayoutEffect(() => {
    moveTo(listRef.current?.querySelector<HTMLAnchorElement>('a[aria-current="page"]') ?? null, true)
    const onResize = () => moveTo(listRef.current?.querySelector<HTMLAnchorElement>('a[aria-current="page"]') ?? null, false)
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(rafRef.current) }
  }, [pathname])

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = theme === 'light' ? 'dark' : 'light'
    const apply = () => {
      document.documentElement.setAttribute('data-theme', next)
      try { localStorage.setItem('theme', next) } catch { /* Theme still works without storage. */ }
    }
    const root = document.documentElement
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
    if (!doc.startViewTransition) return apply()
    // Circular wipe centred on the switch, large enough to reach the farthest viewport corner.
    const r = e.currentTarget.getBoundingClientRect()
    const x = r.left + r.width / 2, y = r.top + r.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    root.style.setProperty('--vt-x', `${x}px`)
    root.style.setProperty('--vt-y', `${y}px`)
    root.style.setProperty('--vt-r', `${radius}px`)
    doc.startViewTransition(apply)
  }

  return (
    <header className="site-nav glass" data-open={open}>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="nav-inner">
        <Link href="/" className="brand" aria-label={`${name} — home`}>ss<span>.</span></Link>
        <div className="nav-right">
          <nav aria-label="Site">
            <ul className="nav-links" ref={listRef} id="site-menu">
              {indicator && <li aria-hidden="true" className="nav-indicator" data-dir={indicator.dir} style={{ left: indicator.left, right: indicator.right }} />}
              {NAV_LINKS.map(link => (
                <li key={link.href}><Link href={link.href} prefetch={false} aria-current={pathname === link.href ? 'page' : undefined} onPointerDown={e => moveTo(e.currentTarget, true)} onClick={e => go(e, link.href)}>{link.label}</Link></li>
              ))}
              {hasResume && <li><a href="/api/resume" target="_blank" rel="noopener noreferrer" onPointerEnter={warmResume} onFocus={warmResume}>cv</a></li>}
            </ul>
          </nav>
          <button type="button" className="theme-switch" data-on={theme === 'dark'} role="switch" aria-checked={theme === 'dark'} aria-label="Dark mode" onClick={toggleTheme}>
            <span className="knob">{theme === 'dark' ? <FiMoon size={11} /> : <FiSun size={11} />}</span>
          </button>
          <button type="button" className="btn nav-burger" aria-expanded={open} aria-controls="site-menu" aria-label="Toggle navigation" onClick={() => setOpen(o => !o)}>
            {open ? <FiX size={16} /> : <FiMenu size={16} />}
          </button>
        </div>
      </div>
    </header>
  )
}
