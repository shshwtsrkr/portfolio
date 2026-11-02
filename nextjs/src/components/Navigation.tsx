'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { chooseTheme } from '@/lib/theme'
import type { IconType } from 'react-icons'
import {
  MdArticle, MdDarkMode, MdDescription, MdEditNote, MdLightMode, MdOutlineArticle, MdOutlineDescription,
  MdOutlineEditNote, MdOutlinePerson, MdOutlineScience, MdOutlineWorkOutline, MdPerson, MdScience, MdWork,
} from 'react-icons/md'

// Warm the CV on hover so the viewer tab opens from cache instead of waiting on the upstream fetch.
let resumeWarmed = ''
export const warmResume = (href: string) => {
  if (resumeWarmed === href) return
  resumeWarmed = href
  fetch(href, { priority: 'low' } as RequestInit).catch(() => { resumeWarmed = '' })
}

// Material Symbols-style pairs: outlined when idle, filled when active (the M3 navigation bar convention).
export const NAV_LINKS: Array<{ href: string; label: string; short: string; icon: IconType; active: IconType }> = [
  { href: '/', label: 'About', short: 'About', icon: MdOutlinePerson, active: MdPerson },
  { href: '/publications', label: 'Publications', short: 'Papers', icon: MdOutlineArticle, active: MdArticle },
  { href: '/projects', label: 'Projects', short: 'Projects', icon: MdOutlineScience, active: MdScience },
  { href: '/experience', label: 'Experience', short: 'Work', icon: MdOutlineWorkOutline, active: MdWork },
  { href: '/blogs', label: 'Writing', short: 'Writing', icon: MdOutlineEditNote, active: MdEditNote },
]

/* Sections switch on the client: every route already carries the full dataset, so a click only pushes
   the URL (the App Router syncs usePathname) and SitePage re-renders. Modified clicks keep browser defaults. */
export function navigate(e: React.MouseEvent<HTMLAnchorElement>, href: string, pathname: string) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  if (href === pathname) return
  window.history.pushState(null, '', href)
  window.scrollTo({ top: 0 })
}

/* Google-style icon motion: the icon of the tab you pick plays a short animation of its own (see .nav-item[data-play]
   in portfolio.css). Only on a click, never on page load, and the attribute clears itself when the animation ends. */
function playIcon(el: HTMLElement) {
  el.removeAttribute('data-play')
  void el.offsetWidth
  el.setAttribute('data-play', '')
  // Listen on the link, not the svg: selecting swaps the outlined icon for the filled one mid-animation.
  el.addEventListener('animationend', () => el.removeAttribute('data-play'), { once: true })
}

export default function Navigation({ resumeHref, name, showWriting }: { resumeHref?: string | null; name: string; showWriting: boolean }) {
  const pathname = usePathname()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [scrolled, setScrolled] = useState(false)
  // M3 top app bar: flat at rest, tonal "on scroll" container once content passes under it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  /* M3 "large title collapses into the bar": on the home page the big hero name is the title, so the
     bar shows no name until that heading has scrolled up under it; then the name slides into the bar.
     Every other page has no hero name, so the bar always shows it there. */
  const [heroGone, setHeroGone] = useState(false)
  const nameIn = pathname !== '/' || heroGone
  useEffect(() => {
    if (pathname !== '/') return
    let io: IntersectionObserver | undefined
    const raf = requestAnimationFrame(() => {
      const hero = document.querySelector('.hero-name')
      if (!hero) return setHeroGone(true)
      io = new IntersectionObserver(([e]) => setHeroGone(!e.isIntersecting), { rootMargin: '-64px 0px 0px 0px' })
      io.observe(hero)
    })
    return () => { cancelAnimationFrame(raf); io?.disconnect() }
  }, [pathname])
  const links = NAV_LINKS.filter(l => showWriting || l.href !== '/blogs')
  useEffect(() => {
    const sync = () => setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    const apply = () => {
      chooseTheme(next)
      setTheme(next)
    }
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
    if (!doc.startViewTransition) return apply()
    doc.startViewTransition(apply)
  }

  return (
    <header className="site-nav" data-scrolled={scrolled}>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="nav-inner">
        <Link href="/" className="wordmark" data-show={nameIn} aria-hidden={!nameIn} tabIndex={nameIn ? undefined : -1} onClick={e => navigate(e, '/', pathname)}><span>{name}</span></Link>
        <nav aria-label="Site" className="nav-links">
          {links.map(link => {
            const on = pathname === link.href
            const Icon = on ? link.active : link.icon
            return (
              <Link key={link.href} href={link.href} prefetch={false} className="nav-item ripple" data-icon={link.short.toLowerCase()} aria-current={on ? 'page' : undefined} onClick={e => { if (!on) playIcon(e.currentTarget); navigate(e, link.href, pathname) }}>
                <span className="nav-pill" aria-hidden="true"><Icon size={24} /></span>
                <span className="nav-label"><span className="full">{link.label}</span><span className="short" aria-hidden="true">{link.short}</span></span>
              </Link>
            )
          })}
          {resumeHref && (
            <a href={resumeHref} target="_blank" rel="noopener noreferrer" className="nav-item ripple" data-icon="cv" onClick={e => playIcon(e.currentTarget)} onPointerEnter={() => warmResume(resumeHref)} onFocus={() => warmResume(resumeHref)}>
              <span className="nav-pill" aria-hidden="true"><MdOutlineDescription size={24} className="idle" /><MdDescription size={24} className="hot" /></span>
              <span className="nav-label">CV</span>
            </a>
          )}
        </nav>
        {/* M3 switch with icons: the handle grows when selected and squeezes wider while pressed. */}
        <button type="button" className="md-switch" role="switch" aria-checked={theme === 'dark'} data-on={theme === 'dark'} onClick={toggleTheme} aria-label="Dark theme" title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}>
          <span className="md-switch-handle" aria-hidden="true">
            <MdLightMode className="icon-sun" size={16} />
            <MdDarkMode className="icon-moon" size={16} />
          </span>
        </button>
      </div>
    </header>
  )
}
