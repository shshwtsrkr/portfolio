'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaGithub, FaExternalLinkAlt, FaTimes } from 'react-icons/fa'
import type { Project } from '@/types'
import FilterBar from '@/components/FilterBar'
import { statusColor } from '@/lib/format'

function cardBg() { return 'var(--card-bg)' }

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
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
        <div className="flex justify-between items-start mb-6">
          <div>
            {project.status && (
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="mono" style={{
                  fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700,
                  background: statusColor(project.status), color: '#0C0C0C', padding: '2px 8px',
                }}>
                  {project.status}
                </span>
              </div>
            )}
            <h2 className="font-bold uppercase" style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', letterSpacing: '-0.02em' }}>{project.title}</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--body-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><FaTimes size={16} /></button>
        </div>
        {project.description && <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--body-muted)', marginBottom: '1.5rem' }}>{project.description}</p>}
        {project.technologies && (
          <div className="mb-6">
            <p className="label mb-2">Stack</p>
            <div className="flex flex-wrap gap-2">
              {project.technologies.split(',').map((t) => (
                <span key={t} className="mono" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--body-muted)', border: '1px solid var(--border)', padding: '2px 8px' }}>
                  {t.trim().toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}
        {project.completed_date && <p className="mono mb-6" style={{ fontSize: '0.72rem', color: 'var(--body-muted)', letterSpacing: '0.1em' }}>Completed: {project.completed_date}</p>}
        <div className="flex gap-4">
          {project.show_code_button && project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="mono flex items-center gap-2"
              style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: 'var(--fg)', textDecoration: 'none', borderBottom: '1px solid var(--fg)', paddingBottom: '1px', transition: 'color 0.15s, border-color 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.borderColor = 'var(--fg)' }}>
              <FaGithub size={12} /> CODE
            </a>
          )}
          {project.show_live_demo_button && project.live_url && (
            <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="mono flex items-center gap-2"
              style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: 'var(--fg)', textDecoration: 'none', borderBottom: '1px solid var(--fg)', paddingBottom: '1px', transition: 'color 0.15s, border-color 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.borderColor = 'var(--fg)' }}>
              <FaExternalLinkAlt size={12} /> LIVE
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ProjectsClient({ projects, noTopPad, emptyMessage }: { projects: Project[]; noTopPad?: boolean; emptyMessage?: string }) {
  const [filter, setFilter] = useState<string | null>(null)
  const [active, setActive] = useState<Project | null>(null)
  const statuses = [...new Set(projects.map((p) => p.status).filter(Boolean))]
  const filtered = filter ? projects.filter((p) => p.status === filter) : projects

  // Hide the cursor follower while a card modal is open
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('cursorsuppress', { detail: !!active }))
    return () => { window.dispatchEvent(new CustomEvent('cursorsuppress', { detail: false })) }
  }, [active])

  return (
    <div style={{ paddingTop: noTopPad ? 0 : '48px' }}>
      <div className="px-6 md:px-10 pt-16 pb-24">
        <FilterBar title="Projects" statuses={statuses} filter={filter} count={filtered.length} onFilter={setFilter} />

        {filtered.length === 0 ? (
          <p className="mono pt-12 text-center" style={{ fontSize: '0.8rem', color: 'var(--body-muted)', lineHeight: 1.7 }}>
            {emptyMessage || '— no entries yet —'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '3px' }}>
            {filtered.map((project, i) => (
              <motion.button
                key={project.id}
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActive(project)}
                className="group flex flex-col text-left"
                style={{ background: 'var(--bg)', cursor: 'pointer', border: '1px solid var(--border)', transition: 'background 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(217,119,87,0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg)'}
              >
                {/* Image area */}
                <div
                  className="relative overflow-hidden w-full"
                  style={{
                    aspectRatio: '16/9',
                    background: cardBg(),
                    padding: '2rem 1rem 1rem',
                  }}
                >
                  {project.preview_image_url ? (
                    <img
                      src={project.preview_image_url}
                      alt={project.title}
                      className="w-full h-full"
                      style={{ objectFit: 'contain', display: 'block' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-end">
                      <span className="mono" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: 'var(--body-muted)', textTransform: 'uppercase' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                  {/* Status badge — filled with status color, black text */}
                  {project.status && (
                    <div className="absolute top-3 left-3">
                      <span className="mono" style={{
                        fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700,
                        background: statusColor(project.status), color: '#0C0C0C', padding: '3px 8px',
                      }}>
                        {project.status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Text area */}
                <div className="flex flex-col flex-1 p-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="font-semibold mb-2 line-clamp-2" style={{ fontSize: '0.98rem', color: 'var(--fg)', lineHeight: 1.4 }}>
                    {project.title}
                  </p>
                  {project.description && (
                    <p className="line-clamp-2 flex-1" style={{ fontSize: '0.8rem', color: 'var(--body-muted)', lineHeight: 1.6 }}>
                      {project.description}
                    </p>
                  )}
                  {project.technologies && (
                    <p className="mono mt-2 line-clamp-1" style={{ fontSize: '0.68rem', color: 'var(--body-muted)', letterSpacing: '0.06em' }}>
                      {project.technologies}
                    </p>
                  )}
                  <div className="flex items-center gap-3 pt-3" style={{ marginTop: 'auto', borderTop: '1px solid var(--border)' }}>
                    {project.show_code_button && project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                        className="mono flex items-center gap-1"
                        style={{ fontSize: '0.68rem', letterSpacing: '0.1em', color: 'var(--body-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--fg)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--body-muted)'}
                      >
                        <FaGithub size={10} /> CODE
                      </a>
                    )}
                    {project.show_live_demo_button && project.live_url && (
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                        className="mono flex items-center gap-1"
                        style={{ fontSize: '0.68rem', letterSpacing: '0.1em', color: 'var(--body-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--fg)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--body-muted)'}
                      >
                        <FaExternalLinkAlt size={10} /> LIVE
                      </a>
                    )}
                    <span className="mono ml-auto" style={{ fontSize: '0.68rem', color: 'var(--body-muted)', letterSpacing: '0.06em' }}>
                      {project.completed_date || '—'}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {active && <ProjectModal project={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  )
}
