'use client'

import { useState } from 'react'
import { FiArrowUpRight } from 'react-icons/fi'
import { Md, MdInline } from '@/components/Markdown'
import { markAuthor, venueAbbr, venueName } from '@/lib/format'
import type { Publication } from '@/types'

function Entry({ pub, index, me }: { pub: Publication; index: number; me: string }) {
  const [open, setOpen] = useState(false)
  const links = [
    ...(pub.show_pdf_button && pub.pdf_url ? [{ label: 'Paper', href: pub.pdf_url }] : []),
    ...(pub.show_code_button && pub.code_url ? [{ label: 'Code', href: pub.code_url }] : []),
    ...(pub.show_doi_button && pub.doi ? [{ label: 'DOI', href: `https://doi.org/${pub.doi}` }] : []),
  ]
  const abstractId = `abstract-${pub.id}`
  return (
    <li className="bib-entry" style={{ '--i': index } as React.CSSProperties}>
      <div className="bib-abbr">
        <span className="badge venue" title={pub.venue || undefined}>{venueAbbr(pub.venue)}</span>
        {pub.status && <span className="badge outline">{pub.status}</span>}
      </div>
      <div className="bib-main">
        <div className="bib-title"><MdInline>{pub.title}</MdInline></div>
        {pub.authors && <div className="bib-authors">{markAuthor(pub.authors, me).map((p, i) => p.me ? <em key={i}>{p.text}</em> : <span key={i}>{p.text}</span>)}</div>}
        {(pub.venue || pub.publication_year) && (
          <div className="bib-periodical">{pub.venue && <>In <span className="venue">{venueName(pub.venue)}</span></>}{pub.venue && pub.publication_year ? ', ' : ''}{pub.publication_year}</div>
        )}
        <div className="bib-links">
          {pub.abstract_text && <button type="button" className="btn" aria-expanded={open} aria-controls={abstractId} onClick={() => setOpen(o => !o)}>Abs</button>}
          {links.map(link => <a key={link.label} className="btn" href={link.href} target="_blank" rel="noopener noreferrer">{link.label} <FiArrowUpRight aria-hidden="true" /></a>)}
          {pub.show_citations && !!pub.citation_count && <span className="bib-cites">{pub.citation_count} citations</span>}
        </div>
        {pub.abstract_text && (
          <div className="bib-abstract collapsible" data-open={open} id={abstractId} aria-hidden={!open}>
            <div><div className="glass prose"><Md>{pub.abstract_text}</Md></div></div>
          </div>
        )}
      </div>
    </li>
  )
}

/* Bibliography list: venue badge column on the left, title / authors / venue / link buttons on the right. */
export default function PublicationList({ publications, groupByYear, me }: { publications: Publication[]; groupByYear?: boolean; me: string }) {
  if (!groupByYear) return <ol className="bibliography">{publications.map((p, i) => <Entry key={p.id} pub={p} index={i} me={me} />)}</ol>
  const years = Array.from(new Set(publications.map(p => p.publication_year ?? 0))).sort((a, b) => b - a)
  let i = 0
  return (
    <>
      {years.map(year => (
        <section key={year} aria-label={year ? `${year}` : 'Undated'}>
          <h3 className="year-heading etched">{year || 'undated'}</h3>
          <ol className="bibliography">{publications.filter(p => (p.publication_year ?? 0) === year).map(p => <Entry key={p.id} pub={p} index={i++} me={me} />)}</ol>
        </section>
      ))}
    </>
  )
}
