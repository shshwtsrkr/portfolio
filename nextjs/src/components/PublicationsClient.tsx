'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaFilePdf, FaGithub, FaExternalLinkAlt, FaTimes } from 'react-icons/fa'
import type { Publication } from '@/types'
import FilterBar from '@/components/FilterBar'
import { statusColor } from '@/lib/format'

function cardBg() { return 'var(--card-bg)' }

function PublicationModal({ pub, onClose }: { pub: Publication; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
      style={{ background: 'rgba(12,12,12,0.92)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full md:max-w-2xl"
        style={{ background: 'var(--modal-bg)', border: '1px solid var(--border)', padding: '2rem', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="pr-8">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {pub.status && (
                <span className="mono" style={{
                  fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700,
                  background: statusColor(pub.status), color: '#0C0C0C', padding: '2px 8px',
                }}>
                  {pub.status}
                </span>
              )}
            </div>
            <h2 className="font-bold" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', lineHeight: 1.3 }}>{pub.title}</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--body-muted)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}><FaTimes size={16} /></button>
        </div>
        {pub.authors && <p className="mono mb-4" style={{ fontSize: '0.8rem', color: 'var(--body-muted)', letterSpacing: '0.05em' }}>{pub.authors}</p>}
        {(pub.venue || pub.publication_year) && (
          <p className="mono mb-6" style={{ fontSize: '0.72rem', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {pub.venue}{pub.publication_year ? ` · ${pub.publication_year}` : ''}
          </p>
        )}
        {pub.abstract_text && <p style={{ fontSize: '0.8rem', lineHeight: 1.75, color: 'var(--body-muted)', marginBottom: '1.5rem' }}>{pub.abstract_text}</p>}
        {pub.show_citations && pub.citation_count && pub.citation_count > 0 && (
          <p className="mono mb-6" style={{ fontSize: '0.72rem', color: 'var(--body-muted)', letterSpacing: '0.1em' }}>
            {pub.citation_count} citation{pub.citation_count !== 1 ? 's' : ''}
          </p>
        )}
        <div className="flex gap-6">
          {pub.show_pdf_button && pub.pdf_url && (
            <a href={pub.pdf_url} target="_blank" rel="noopener noreferrer" className="mono flex items-center gap-2"
              style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: 'var(--fg)', textDecoration: 'none', borderBottom: '1px solid var(--fg)', paddingBottom: '1px', transition: 'color 0.15s, border-color 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.borderColor = 'var(--fg)' }}>
              <FaFilePdf size={12} /> PAPER
            </a>
          )}
          {pub.show_code_button && pub.code_url && (
            <a href={pub.code_url} target="_blank" rel="noopener noreferrer" className="mono flex items-center gap-2"
              style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: 'var(--fg)', textDecoration: 'none', borderBottom: '1px solid var(--fg)', paddingBottom: '1px', transition: 'color 0.15s, border-color 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.borderColor = 'var(--fg)' }}>
              <FaGithub size={12} /> CODE
            </a>
          )}
          {pub.show_doi_button && pub.doi && (
            <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="mono flex items-center gap-2"
              style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: 'var(--fg)', textDecoration: 'none', borderBottom: '1px solid var(--fg)', paddingBottom: '1px', transition: 'color 0.15s, border-color 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.borderColor = 'var(--fg)' }}>
              <FaExternalLinkAlt size={12} /> DOI
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function PublicationsClient({ publications, noTopPad, emptyMessage }: { publications: Publication[]; noTopPad?: boolean; emptyMessage?: string }) {
  const [filter, setFilter] = useState<string | null>(null)
  const [active, setActive] = useState<Publication | null>(null)
  const statuses = [...new Set(publications.map((p) => p.status).filter(Boolean) as string[])]
  const filtered = filter ? publications.filter((p) => p.status === filter) : publications

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('cursorsuppress', { detail: !!active }))
    return () => { window.dispatchEvent(new CustomEvent('cursorsuppress', { detail: false })) }
  }, [active])

  return (
    <div style={{ paddingTop: noTopPad ? 0 : '48px' }}>
      <div className="px-6 md:px-10 pt-16 pb-24">
        <FilterBar title="Publications" statuses={statuses} filter={filter} count={filtered.length} onFilter={setFilter} />

        {filtered.length === 0 ? (
          <p className="mono pt-12 text-center" style={{ fontSize: '0.8rem', color: 'var(--body-muted)', lineHeight: 1.7 }}>
            {emptyMessage || '— no entries yet —'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '3px' }}>
            {filtered.map((pub, i) => (
              <motion.button
                key={pub.id}
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActive(pub)}
                className="group flex flex-col text-left"
                style={{ background: 'var(--bg)', cursor: 'pointer', border: '1px solid var(--border)', transition: 'background 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(217,119,87,0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg)'}
              >
                {/* Image / placeholder area */}
                <div
                  className="relative overflow-hidden w-full"
                  style={{
                    aspectRatio: '16/9',
                    background: cardBg(),
                    padding: '2rem 1rem 1rem',
                  }}
                >
                  {pub.thumbnail_url ? (
                    <img
                      src={pub.thumbnail_url}
                      alt={pub.title}
                      className="w-full h-full"
                      style={{ objectFit: 'contain', display: 'block' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-6">
                      <p className="text-center font-semibold line-clamp-3" style={{ fontSize: '0.8rem', color: 'var(--body-muted)', lineHeight: 1.4 }}>
                        {pub.venue || pub.title}
                      </p>
                    </div>
                  )}
                  {/* Status badge — filled with status color, black text */}
                  {pub.status && (
                    <div className="absolute top-3 left-3">
                      <span className="mono" style={{
                        fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase',
                        fontWeight: 700,
                        background: statusColor(pub.status),
                        color: '#0C0C0C',
                        padding: '3px 8px',
                      }}>
                        {pub.status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Text area */}
                <div className="flex flex-col flex-1 p-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="font-semibold mb-2 line-clamp-3" style={{ fontSize: '0.98rem', color: 'var(--fg)', lineHeight: 1.4 }}>
                    {pub.title}
                  </p>
                  {pub.authors && (
                    <p className="mono line-clamp-1" style={{ fontSize: '0.72rem', color: 'var(--body-muted)' }}>
                      {pub.authors}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-3" style={{ marginTop: 'auto', borderTop: '1px solid var(--border)' }}>
                    <span className="mono line-clamp-1 flex-1 pr-2" style={{ fontSize: '0.68rem', color: 'var(--body-muted)', letterSpacing: '0.06em' }}>
                      {pub.venue || '—'}
                    </span>
                    <span className="mono shrink-0" style={{ fontSize: '0.68rem', color: 'var(--body-muted)', letterSpacing: '0.06em' }}>
                      {pub.publication_year || '—'}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {active && <PublicationModal pub={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  )
}
