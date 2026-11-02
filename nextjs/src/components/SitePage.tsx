'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MdArrowForward, MdChevronRight, MdSearch } from 'react-icons/md'
import AboutHeader from '@/components/AboutHeader'
import ExperienceList from '@/components/ExperienceList'
import ProjectList from '@/components/ProjectList'
import PublicationList from '@/components/PublicationList'
import WritingList from '@/components/WritingList'
import ResearchMap, { toWorkPoints } from '@/components/ResearchMap'
import { Md, MdInline } from '@/components/Markdown'
import { navigate } from '@/components/Navigation'
import { isFinalStatus, matches, parseEmptyMessages, parseSectionLabels, shortDate, venueAbbr, venueName } from '@/lib/format'
import type { PublicPageData } from '@/lib/public-page-data'

export type Section = 'about' | 'publications' | 'projects' | 'experience' | 'blogs'

export const SECTION_BY_PATH: Record<string, Section> = { '/': 'about', '/publications': 'publications', '/projects': 'projects', '/experience': 'experience', '/blogs': 'blogs' }

const SELECTED = 3
const NEWS = 5
// Search only earns its space once a list is long enough to need it.
const SEARCH_FROM = 7
const TITLES: Record<Section, string> = { about: 'About', publications: 'Publications', projects: 'Projects', experience: 'Experience', blogs: 'Writing' }

/* A short log built from the content itself — papers and roles — so "Recently" never goes stale.
   Entries are grouped under their year, with the month (Jan, Feb…) beside each one: roles take it from their
   start date, papers from their optional month field; a paper without one leaves the month blank. */
type NewsKind = 'Paper' | 'New role' | 'Certification'
type NewsItem = { key: string; kind?: NewsKind; work?: string; sort: string; year: string; month: string; text: string }
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const monthName = (m?: number | null) => (m && m >= 1 && m <= 12 ? MONTHS[m - 1] : '')
// Papers read as events ("Accepted at MICCAI: …") rather than bare titles, so the list says what happened.
function paperEvent(status?: string | null, venue?: string | null) {
  const at = venue ? venueAbbr(venue) : ''
  if (!isFinalStatus(status)) return status!.trim()
  if (/^accepted$/i.test(status?.trim() || '')) return at ? `Accepted at ${at}` : 'Accepted'
  return at ? `Published in ${at}` : 'Published'
}
function useNews({ publications, experiences, certifications }: Pick<PublicPageData, 'publications' | 'experiences' | 'certifications'>) {
  return useMemo(() => {
    const items: NewsItem[] = []
    for (const p of publications) {
      if (!p.publication_year) continue
      const m = p.publication_month
      items.push({ key: `p${p.id}`, kind: 'Paper', work: `pub-${p.id}`, sort: `${p.publication_year}-${String(m || 12).padStart(2, '0')}`, year: `${p.publication_year}`, month: monthName(m), text: `${paperEvent(p.status, p.venue)}: ${p.title}` })
    }
    // A role at a company you'd already worked at is a promotion: shown untagged as "Role @ Company". Anything else is a new job.
    const byStart = experiences.filter(e => e.start_date).sort((a, b) => a.start_date.localeCompare(b.start_date))
    const company = (c: string) => c.trim().toLowerCase()
    for (const [i, e] of byStart.entries()) {
      const promoted = byStart.slice(0, i).some(prev => company(prev.company) === company(e.company))
      items.push({ key: `e${e.id}`, kind: promoted ? undefined : 'New role', sort: e.start_date.slice(0, 7), year: e.start_date.slice(0, 4), month: monthName(Number(e.start_date.slice(5, 7))), text: promoted ? `${e.role} @ ${e.company}` : `Joined ${e.company} as ${e.role}` })
    }
    for (const c of certifications) {
      if (!c.issued_date) continue
      items.push({ key: `c${c.id}`, kind: 'Certification', sort: c.issued_date.slice(0, 7), year: c.issued_date.slice(0, 4), month: monthName(Number(c.issued_date.slice(5, 7))), text: `Earned ${c.issuer} ${c.name} certification` })
    }
    return items.sort((a, b) => b.sort.localeCompare(a.sort)).slice(0, NEWS)
  }, [publications, experiences, certifications])
}

// Resolves once the new section has rendered the element (React commits after the URL changes).
function waitForId(id: string, tries = 60): Promise<HTMLElement | null> {
  return new Promise(resolve => {
    const look = (n: number) => {
      const el = document.getElementById(id)
      if (el || n <= 0) return resolve(el)
      setTimeout(() => look(n - 1), 16)
    }
    look(tries)
  })
}

export default function SitePage({ section: initialSection, profile, experiences, publications, projects, blogs, certifications = [] }: PublicPageData & { section: Section }) {
  const pathname = usePathname()
  const section = SECTION_BY_PATH[pathname] ?? initialSection
  const [query, setQuery] = useState('')
  const news = useNews({ publications, experiences, certifications })
  const points = useMemo(() => toWorkPoints(publications, projects), [publications, projects])
  const [activeWork, setActiveWork] = useState<string | null>(null)
  const mainRef = useRef<HTMLElement>(null)
  const morphing = useRef(false)

  // Two-way link: hovering a dot marks its row below, hovering a row lights its dot.
  useEffect(() => {
    const rows = mainRef.current?.querySelectorAll<HTMLElement>('[data-work]') ?? []
    rows.forEach(r => r.classList.toggle('is-linked', r.dataset.work === activeWork))
  }, [activeWork, section])
  /* Hover highlight follows real mouse movement only. Browsers send a zero-distance pointermove when the page
     scrolls under a resting cursor; acting on it lit whatever row the cursor ended over, and the map kept
     showing that paper's tip after scrolling back up. Moving off a row clears it, and so does scrolling. */
  const fromRow = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || (!e.movementX && !e.movementY)) return
    const target = e.target as HTMLElement
    if (target.closest('.rmap')) return
    setActiveWork(target.closest<HTMLElement>('[data-work]')?.dataset.work || null)
  }
  useEffect(() => {
    if (section !== 'about') return
    const clear = () => setActiveWork(null)
    window.addEventListener('scroll', clear, { passive: true })
    return () => window.removeEventListener('scroll', clear)
  }, [section])

  // Arriving with a #pub-… / #proj-… hash (e.g. from the map): bring that entry into view and flash it.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id || morphing.current) return
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(id)
      if (!el) return
      el.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
      el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash')
    })
    return () => cancelAnimationFrame(raf)
  }, [section])
  /* Opening a paper from the map or the Recently list: the dot (or row) grows into that paper's card
     on its page, using a view transition. Without view transitions, or with reduced motion, it just
     switches section and the hash effect above scrolls to and flashes the card. */
  const openWork = (href: string, from?: Element | null) => {
    setActiveWork(null)
    const id = href.split('#')[1]
    const doc = document as Document & { startViewTransition?: (cb: () => Promise<void>) => { finished: Promise<void> } }
    if (!from || !id || !doc.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.history.pushState(null, '', href)
      return
    }
    // SVG shapes can't carry a view-transition-name, so a dot gets an HTML stand-in at the same spot.
    let source = from as HTMLElement
    let ghost: HTMLElement | null = null
    if (from instanceof SVGElement) {
      const r = from.getBoundingClientRect()
      ghost = document.createElement('div')
      ghost.className = 'morph-ghost'
      ghost.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;background:${getComputedStyle(from).getPropertyValue('--t')}`
      document.body.appendChild(ghost)
      source = ghost
    }
    source.style.viewTransitionName = 'work-morph'
    morphing.current = true
    let target: HTMLElement | null = null
    const t = doc.startViewTransition(async () => {
      source.style.viewTransitionName = ''
      ghost?.remove()
      window.history.pushState(null, '', href)
      target = await waitForId(id)
      if (target) { target.style.viewTransitionName = 'work-morph'; target.scrollIntoView({ block: 'center' }) }
    })
    t.finished.finally(() => {
      morphing.current = false
      if (!target) return
      target.style.viewTransitionName = ''
      target.classList.remove('flash'); void target.offsetWidth; target.classList.add('flash')
    })
  }
  const name = profile?.name || 'Shashwat Sarkar'
  const labels = parseSectionLabels(profile?.section_labels)
  const empty = parseEmptyMessages(profile?.empty_messages)
  const title = TITLES[section]
  const tagline = section === 'about' ? '' : (labels[section as keyof typeof labels] || '').trim()
  const email = (() => {
    try {
      const s = (typeof profile?.socials === 'string' ? JSON.parse(profile.socials) : profile?.socials) as Array<{ platform?: string; url: string }> | undefined
      const m = s?.find(x => /^(e-?mail|mail)$/i.test(x.platform || ''))?.url
      return m ? m.replace(/^mailto:/, '') : ''
    } catch { return '' }
  })()
  const updated = useMemo(() => {
    const stamps = [profile, ...experiences, ...publications, ...projects, ...blogs].map(x => x?.updated_at).filter(Boolean) as string[]
    return stamps.length ? shortDate(stamps.sort().at(-1)!.slice(0, 10)) : ''
  }, [profile, experiences, publications, projects, blogs])

  const all = { about: [], publications, projects, experience: experiences, blogs }[section]
  const list = {
    about: [],
    publications: publications.filter(p => matches(query, p.title, p.authors, p.venue, venueAbbr(p.venue), venueName(p.venue), p.publication_year, p.abstract_text, p.status, p.doi)),
    projects: projects.filter(p => matches(query, p.title, p.technologies, p.description, p.status, p.completed_date, shortDate(p.completed_date))),
    experience: experiences,
    blogs: blogs.filter(b => matches(query, b.title, b.description, b.content, b.tag)),
  }[section]
  const emptyText = query.trim() ? 'No matches — try another word.' : (empty[section as keyof typeof empty] || 'Nothing here yet.')

  return (
    <main id="main" key={section} ref={mainRef} className="shell" tabIndex={-1}
      onPointerMove={section === 'about' ? fromRow : undefined}
      onPointerLeave={section === 'about' ? () => setActiveWork(null) : undefined}>
      {section === 'about' ? (
        <>
          <AboutHeader profile={profile} experiences={experiences} certifications={certifications} map={<ResearchMap points={points} active={activeWork} onActive={setActiveWork} onOpen={openWork} />} />
          {news.length > 0 && (
            <section className="block" aria-labelledby="h-news">
              <h2 id="h-news" className="block-title">Recently</h2>
              <ul className="news">
                {news.map((n, i) => {
                  const first = i === 0 || news[i - 1].year !== n.year
                  return (
                    <li key={n.key} data-work={n.work} className={first ? 'news-first' : undefined}>
                      {(() => {
                        const inner = (
                          <>
                            <time>{first ? n.year : <span className="sr-only">{n.year}</span>}</time>
                            <span className="news-month">{n.month}</span>
                            <span className="news-text">{n.kind && <span className="news-tag" data-kind={n.kind}>{n.kind}</span>}<MdInline>{n.text}</MdInline></span>
                            {n.work && <MdChevronRight className="news-go" size={20} aria-hidden="true" />}
                          </>
                        )
                        // Paper rows are M3 list items that open the paper; role rows are plain.
                        return n.work
                          ? <a className="news-row ripple" href={`/publications#${n.work}`} onClick={e => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); openWork(`/publications#${n.work}`, e.currentTarget) }}>{inner}</a>
                          : <div className="news-row">{inner}</div>
                      })()}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
          <section className="block" aria-labelledby="h-pubs">
            <div className="block-head">
              <h2 id="h-pubs" className="block-title">Selected publications</h2>
              {publications.length > SELECTED && <Link className="md-btn text ripple" href="/publications" onClick={e => navigate(e, '/publications', pathname)}>All {publications.length}<MdArrowForward size={18} aria-hidden="true" /></Link>}
            </div>
            {publications.length ? <PublicationList publications={publications.slice(0, SELECTED)} me={name} /> : <div className="empty"><Md>{empty.publications || 'Nothing published yet.'}</Md></div>}
          </section>
        </>
      ) : (
        <>
          <header className="page-head">
            <div>
              <h1>{title}</h1>
              {tagline && <div className="page-note"><Md>{tagline}</Md></div>}
            </div>
            {section !== 'experience' && all.length >= SEARCH_FROM && (
              <label className="search"><MdSearch aria-hidden="true" size={22} /><span className="sr-only">Search {title.toLowerCase()}</span><input type="search" placeholder={`Search ${title.toLowerCase()}`} value={query} onChange={e => setQuery(e.target.value)} /></label>
            )}
          </header>
          {list.length === 0 ? <div className="empty" role="status"><Md>{emptyText}</Md></div>
            : section === 'publications' ? <PublicationList publications={list as typeof publications} groupByYear me={name} />
            : section === 'projects' ? <ProjectList projects={list as typeof projects} />
            : section === 'experience' ? <ExperienceList experiences={list as typeof experiences} />
            : <WritingList blogs={list as typeof blogs} />}
        </>
      )}
      <footer className="footer">
        <span>© {new Date().getFullYear()} {name}</span>
        {email && <a href={`mailto:${email}`}>{email}</a>}
        {updated && <span>Updated {updated}</span>}
      </footer>
    </main>
  )
}
