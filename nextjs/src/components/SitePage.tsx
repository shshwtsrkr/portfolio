'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { FiArrowRight, FiSearch } from 'react-icons/fi'
import AboutHeader from '@/components/AboutHeader'
import ExperienceList from '@/components/ExperienceList'
import ProjectList from '@/components/ProjectList'
import PublicationList from '@/components/PublicationList'
import WritingList from '@/components/WritingList'
import { Md } from '@/components/Markdown'
import { matches, parseEmptyMessages, parseSectionLabels, shortDate, venueAbbr, venueName } from '@/lib/format'
import type { PublicPageData } from '@/lib/public-page-data'

export type Section = 'about' | 'publications' | 'projects' | 'experience' | 'blogs'

export const SECTION_BY_PATH: Record<string, Section> = { '/': 'about', '/publications': 'publications', '/projects': 'projects', '/experience': 'experience', '/blogs': 'blogs' }

const SELECTED = 3

/* One page per section, all sharing the fixed nav, the centered column, and the footer.
   Every route already carries the full dataset, so the nav switches sections on the client via
   history.pushState (synced into usePathname) — no server round-trip between clicks. */
export default function SitePage({ section: initialSection, profile, experiences, publications, projects, blogs }: PublicPageData & { section: Section }) {
  const pathname = usePathname()
  const section = SECTION_BY_PATH[pathname] ?? initialSection
  const [query, setQuery] = useState('')
  const jump = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault(); window.history.pushState(null, '', href); window.scrollTo({ top: 0 })
  }
  const name = profile?.name || 'Shashwat Sarkar'
  const labels = parseSectionLabels(profile?.section_labels)
  const empty = parseEmptyMessages(profile?.empty_messages)
  const title = { about: 'about', publications: 'publications', projects: 'projects', experience: 'work', blogs: 'writing' }[section]
  // Custom section labels from the admin read as taglines, so they sit under the fixed page title.
  const tagline = section === 'about' ? '' : (labels[section] || '').trim()

  const list = {
    about: [],
    publications: publications.filter(p => matches(query, p.title, p.authors, p.venue, venueAbbr(p.venue), venueName(p.venue), p.publication_year, p.abstract_text, p.status, p.doi)),
    projects: projects.filter(p => matches(query, p.title, p.technologies, p.description, p.status, p.completed_date, shortDate(p.completed_date), p.github_url, p.live_url)),
    experience: experiences,
    blogs: blogs.filter(b => matches(query, b.title, b.description, b.content, b.tag)),
  }[section]
  const emptyText = query.trim() ? 'No matches. Try another search.' : (section === 'experience' ? 'Nothing here yet.' : empty[section as keyof typeof empty] || 'Nothing published here yet.')

  return (
    <>
      <main id="main" key={section} className="portfolio-shell" tabIndex={-1}>
        {section === 'about' ? (
          <>
            <AboutHeader profile={profile} />
            {experiences.length > 0 && (
              <section aria-labelledby="h-experience">
                <div className="section-head etched"><h2 id="h-experience"><Link href="/experience" onClick={e => jump(e, '/experience')}>work</Link></h2><Link className="section-link" href="/experience" onClick={e => jump(e, '/experience')}>full history <FiArrowRight aria-hidden="true" size={13} /></Link></div>
                <ExperienceList experiences={experiences.slice(0, 4)} compact />
              </section>
            )}
            <section aria-labelledby="h-publications">
              <div className="section-head etched"><h2 id="h-publications"><Link href="/publications" onClick={e => jump(e, '/publications')}>selected publications</Link></h2>{publications.length > SELECTED && <Link className="section-link" href="/publications" onClick={e => jump(e, '/publications')}>all {publications.length} <FiArrowRight aria-hidden="true" size={13} /></Link>}</div>
              {publications.length ? <PublicationList publications={publications.slice(0, SELECTED)} me={name} /> : <div className="empty-note"><Md>{empty.publications || 'Nothing published here yet.'}</Md></div>}
            </section>
          </>
        ) : (
          <>
            <div className="section-head page-title">
              <h2>{title}</h2>
              {section !== 'experience' && <label className="search-well"><FiSearch aria-hidden="true" size={14} /><span className="sr-only">Search {title}</span><input type="search" placeholder={`Search ${title}…`} value={query} onChange={e => setQuery(e.target.value)} /></label>}
            </div>
            {tagline && <div className="page-note"><Md>{tagline}</Md></div>}
            <div key={query}>
              {list.length === 0 ? <div className="empty-note" role="status"><Md>{emptyText}</Md></div>
                : section === 'publications' ? <PublicationList publications={list as typeof publications} groupByYear me={name} />
                : section === 'projects' ? <ProjectList projects={list as typeof projects} />
                : section === 'experience' ? <ExperienceList experiences={list as typeof experiences} />
                : <WritingList blogs={list as typeof blogs} />}
            </div>
          </>
        )}
        <footer className="site-footer etched">
          <span>© {new Date().getFullYear()} {name}</span><span className="dot">·</span><a href="#top">back to top</a>
        </footer>
      </main>
    </>
  )
}
