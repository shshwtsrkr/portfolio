'use client'

import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import type { Experience } from '@/types'

const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function duration(start: string, end: string | null | undefined): string {
  const s = new Date(start + 'T00:00:00')
  const e = end ? new Date(end + 'T00:00:00') : new Date()
  let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth())
  if (months < 1) months = 1
  const yrs = Math.floor(months / 12)
  const mos = months % 12
  if (yrs === 0) return `${mos} mo${mos !== 1 ? 's' : ''}`
  if (mos === 0) return `${yrs} yr${yrs !== 1 ? 's' : ''}`
  return `${yrs} yr${yrs !== 1 ? 's' : ''} ${mos} mo${mos !== 1 ? 's' : ''}`
}

export default function ExperienceTimeline({ experiences, label }: { experiences: Experience[]; label?: string }) {
  if (!experiences.length) return null
  const sectionLabel = label?.trim() || 'Experience'

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="px-6 md:px-10 pb-24"
    >
      <div className="hairline mb-8" />
      <p className="label mb-4">{'// '}{sectionLabel}</p>
      <h1 className="font-bold uppercase" style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', letterSpacing: '-0.02em', lineHeight: 1 }}>
        Experience
      </h1>
      <div className="mt-4 mb-12" style={{ borderTop: '1px solid var(--border)' }} />

      <div className="relative">
        {/* Vertical connecting line */}
        <div
          style={{
            position: 'absolute',
            left: '7px',
            top: '8px',
            bottom: '2.5rem',
            width: '1px',
            background: 'var(--timeline-line)',
            zIndex: 0,
          }}
        />

        <div className="space-y-0">
          {experiences.map((exp, i) => {
            const active = exp.is_current || !exp.end_date
            const dateRange = `${fmtDate(exp.start_date)} – ${active ? 'present' : fmtDate(exp.end_date!)}`
            const dur = duration(exp.start_date, exp.end_date)

            return (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="relative pl-8 pb-10"
              >
                {/* Node — sits on top of line, bg matches page so line appears to pass behind it */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '5px',
                    width: '15px',
                    height: '15px',
                    borderRadius: '50%',
                    background: 'var(--bg)',
                    border: `2px solid ${active ? '#D97757' : 'var(--timeline-node)'}`,
                    zIndex: 1,
                  }}
                />

                {/* Header row — date right on desktop, below on mobile */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <h3
                        className="font-semibold"
                        style={{ fontSize: '1rem', color: active ? '#D97757' : 'var(--fg)', lineHeight: 1.3 }}
                      >
                        {exp.role}
                      </h3>
                      {/* Date inline on mobile, hidden on desktop */}
                      <span className="mono md:hidden" style={{ fontSize: '0.68rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>
                        {dateRange}
                      </span>
                    </div>
                    <p className="mono mt-1" style={{ fontSize: '0.8rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                      {exp.company}
                    </p>
                    <p className="mono mt-1" style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>
                      {dur}
                    </p>
                  </div>
                  {/* Date right-aligned on desktop only */}
                  <span className="mono shrink-0 hidden md:block" style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.05em', paddingTop: '2px' }}>
                    {dateRange}
                  </span>
                </div>

                {/* Markdown description */}
                {exp.description && (
                  <div
                    className="mt-3"
                    style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.7 }}
                  >
                    <ReactMarkdown
                      components={{
                        ul: ({ children }) => (
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {children}
                          </ul>
                        ),
                        li: ({ children }) => (
                          <li style={{ display: 'flex', gap: '0.6rem', alignItems: 'baseline' }}>
                            <span style={{ color: 'var(--fg)', flexShrink: 0, fontSize: '0.4rem' }}>●</span>
                            <span style={{ color: 'var(--fg)' }}>{children}</span>
                          </li>
                        ),
                        p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
                      }}
                    >
                      {exp.description}
                    </ReactMarkdown>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* F1 easter egg — Silverstone coordinates, barely visible */}
      <p
        className="mono mt-16 select-none"
        style={{ fontSize: '0.55rem', color: 'rgba(240,237,232,0.07)', letterSpacing: '0.12em' }}
        title="52.0786° N, 1.0169° W"
      >
        52.0786° N, 1.0169° W
      </p>
    </motion.section>
  )
}
