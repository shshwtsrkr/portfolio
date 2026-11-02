'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { MdClose, MdCode, MdContentCopy, MdExpandMore, MdLink, MdOpenInNew, MdOutlineDescription } from 'react-icons/md'
import { snackbar } from '@/components/Material'
import { Md, MdInline } from '@/components/Markdown'
import { bibtex, isFinalStatus, markAuthor, venueAbbr, venueName } from '@/lib/format'
import type { Publication } from '@/types'

// The lightbox reuses these exact props for its placeholder, so it resolves to the thumbnail already in cache.
const THUMB = { width: 360, height: 220, sizes: '(max-width: 720px) 100vw, 180px' } as const

function Entry({ pub, me, onFigure, onWarm }: { pub: Publication; me: string; onFigure: (p: Publication, from: HTMLElement) => void; onWarm: (p: Publication) => void }) {
  const [open, setOpen] = useState(false)
  const links = [
    ...(pub.show_pdf_button && pub.pdf_url ? [{ label: 'Paper', href: pub.pdf_url, icon: MdOutlineDescription }] : []),
    ...(pub.show_code_button && pub.code_url ? [{ label: 'Code', href: pub.code_url, icon: MdCode }] : []),
    ...(pub.show_doi_button && pub.doi ? [{ label: 'DOI', href: `https://doi.org/${pub.doi}`, icon: MdLink }] : []),
  ]
  const copyBib = async () => {
    try { await navigator.clipboard.writeText(bibtex(pub)); snackbar('BibTeX copied to clipboard') } catch { snackbar('Couldn’t copy — clipboard blocked') }
  }
  const abstractId = `abstract-${pub.id}`
  const abbr = venueAbbr(pub.venue)
  return (
    <li id={`pub-${pub.id}`} data-work={`pub-${pub.id}`} className={`pub md-card${pub.thumbnail_url ? ' has-fig' : ''}`}>
      {pub.thumbnail_url && (
        <button type="button" className="pub-fig" onClick={e => onFigure(pub, e.currentTarget)} onPointerEnter={() => onWarm(pub)} onFocus={() => onWarm(pub)} aria-label={`Enlarge figure: ${pub.title}`}>
          <Image src={pub.thumbnail_url} alt="" {...THUMB} />
        </button>
      )}
      <div className="pub-body">
        <p className="pub-venue">
          {pub.venue && <abbr className="venue-chip" title={venueName(pub.venue)}>{abbr}</abbr>}
          {pub.publication_year && <span>{pub.publication_year}</span>}
          {pub.status && !isFinalStatus(pub.status) && <span className="pub-status">{pub.status}</span>}
        </p>
        <h3 className="pub-title"><MdInline>{pub.title}</MdInline></h3>
        {pub.authors && <p className="pub-authors">{markAuthor(pub.authors, me).map((p, i) => p.me ? <strong key={i}>{p.text}</strong> : <span key={i}>{p.text}</span>)}</p>}
        {pub.venue && <p className="pub-in"><em>{venueName(pub.venue)}</em></p>}
        <div className="pub-links">
          {links.map((link, i) => {
            const Icon = link.icon
            return <a key={link.label} className={`md-btn ${i === 0 ? 'tonal' : 'outlined'} ripple`} href={link.href} target="_blank" rel="noopener noreferrer"><Icon size={18} aria-hidden="true" />{link.label}<MdOpenInNew className="trail" size={14} aria-hidden="true" /></a>
          })}
          {pub.abstract_text && <button type="button" className="md-btn text ripple" aria-expanded={open} aria-controls={abstractId} onClick={() => setOpen(o => !o)}>Abstract<MdExpandMore className="chev" size={18} aria-hidden="true" /></button>}
          <button type="button" className="md-btn text ripple" onClick={copyBib}><MdContentCopy size={16} aria-hidden="true" />BibTeX</button>
          {pub.show_citations && !!pub.citation_count && <span className="pub-cites">{pub.citation_count} citations</span>}
        </div>
        {pub.abstract_text && (
          <div className="collapsible" data-open={open} id={abstractId} aria-hidden={!open}>
            <div><div className="pub-abstract prose"><Md>{pub.abstract_text}</Md></div></div>
          </div>
        )}
      </div>
    </li>
  )
}

/* Bibliography: figure (if any) on the left, then venue · year, title, authors, and text links. */
export default function PublicationList({ publications, groupByYear, me }: { publications: Publication[]; groupByYear?: boolean; me: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [figure, setFigure] = useState<Publication | null>(null)
  const [loaded, setLoaded] = useState<Set<string>>(() => new Set())
  // Hover/focus mounts the full-size image (eager) inside the closed dialog, so it is usually ready by the click.
  const warm = (p: Publication) => { if (!dialogRef.current?.open) setFigure(p) }
  const originRef = useRef<HTMLElement | null>(null)
  const closingRef = useRef(false)

  /* The viewer grows out of the thumbnail that was clicked and shrinks back into it on close (a FLIP
     animation: measure both boxes, then animate transform/opacity only, so it stays on the compositor). */
  const fromThumb = (dialog: HTMLDialogElement) => {
    const thumb = originRef.current?.getBoundingClientRect()
    if (!thumb || !thumb.width) return null
    const box = dialog.getBoundingClientRect()
    const dx = thumb.left + thumb.width / 2 - (box.left + box.width / 2)
    const dy = thumb.top + thumb.height / 2 - (box.top + box.height / 2)
    return `translate(${dx}px, ${dy}px) scale(${thumb.width / box.width})`
  }
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches
  const EASE = 'cubic-bezier(.22, 1, .36, 1)'

  const show = (p: Publication, from: HTMLElement) => {
    const dialog = dialogRef.current
    if (!dialog) return
    originRef.current = from
    flushSync(() => setFigure(p))
    dialog.showModal()
    // With reduced motion the viewer fades and settles in place instead of flying out of the thumbnail.
    const start = still() ? 'scale(.96)' : fromThumb(dialog) ?? 'scale(.96)'
    dialog.animate([{ transform: start, opacity: 0.35 }, { transform: 'none', opacity: 1 }], { duration: still() ? 220 : 480, easing: EASE })
    try { dialog.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out', pseudoElement: '::backdrop' }) } catch { /* no pseudo-element animation */ }
  }

  const hide = () => {
    const dialog = dialogRef.current
    if (!dialog?.open || closingRef.current) return
    const end = still() ? 'scale(.96)' : fromThumb(dialog) ?? 'scale(.96)'
    closingRef.current = true
    const anims = [dialog.animate([{ transform: 'none', opacity: 1 }, { transform: end, opacity: 0 }], { duration: still() ? 180 : 340, easing: 'cubic-bezier(.4, 0, .6, 1)', fill: 'forwards' })]
    try { anims.push(dialog.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease-in', fill: 'forwards', pseudoElement: '::backdrop' })) } catch { /* no pseudo-element animation */ }
    anims[0].onfinish = () => {
      dialog.close()
      anims.forEach(a => a.cancel()) // drop the held end state so the next open starts clean
      closingRef.current = false
      originRef.current?.focus({ preventScroll: true })
    }
  }
  const ready = !!figure?.thumbnail_url && loaded.has(figure.thumbnail_url)
  const entries = (list: Publication[]) => <ol className="pub-list">{list.map(p => <Entry key={p.id} pub={p} me={me} onFigure={show} onWarm={warm} />)}</ol>
  const years = Array.from(new Set(publications.map(p => p.publication_year ?? 0))).sort((a, b) => b - a)

  return (
    <>
      {groupByYear
        ? years.map(year => (
          <section key={year} className="year-group" aria-label={year ? `${year}` : 'Undated'}>
            <h2 className="year-label">{year || 'Undated'}</h2>
            {entries(publications.filter(p => (p.publication_year ?? 0) === year))}
          </section>
        ))
        : entries(publications)}
      <dialog ref={dialogRef} className="lightbox" onClick={e => { if (e.target === e.currentTarget) hide() }} onCancel={e => { e.preventDefault(); hide() }} aria-label="Figure">
        {figure?.thumbnail_url && (
          <figure>
            <div className="lightbox-frame" data-ready={ready}>
              {/* Placeholder: the cached thumbnail, blurred, with a spinner — never an empty white box. */}
              <Image className="lightbox-placeholder" src={figure.thumbnail_url} alt="" {...THUMB} aria-hidden="true" />
              {!ready && <span className="spinner" role="status"><span className="sr-only">Loading figure</span></span>}
              <Image key={figure.thumbnail_url} className="lightbox-full" src={figure.thumbnail_url} alt={`Figure from “${figure.title}”`} width={1400} height={900} sizes="min(92vw, 1100px)" loading="eager"
                onLoad={() => setLoaded(prev => new Set(prev).add(figure.thumbnail_url!))} />
            </div>
            <figcaption><MdInline>{figure.title}</MdInline></figcaption>
          </figure>
        )}
        <button type="button" className="lightbox-close ripple" onClick={hide} aria-label="Close"><MdClose size={22} /></button>
      </dialog>
    </>
  )
}
