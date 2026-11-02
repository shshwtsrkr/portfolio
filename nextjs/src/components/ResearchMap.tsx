'use client'

import { useMemo, useRef, useState } from 'react'
import { shortDate, venueAbbr } from '@/lib/format'
import type { Project, Publication } from '@/types'

/* Research map: every paper and project is a dot, grouped into topic islands. A faint thread links the work in
   date order (the research trajectory). Topics are assigned from each entry's own words, so the map stays
   current as work is added in the admin. Color is never the only cue: islands carry text labels and the
   same items are listed in full further down the page. */

type Topic = 'text' | 'medical' | 'geo' | 'other'
export interface WorkPoint { key: string; kind: 'paper' | 'project'; title: string; meta: string; topic: Topic; sort: string; href: string }

const TOPICS: Record<Topic, { label: string; at: [number, number]; spin: number }> = {
  text: { label: 'Scene & text', at: [0.27, 0.33], spin: 0.4 },
  medical: { label: 'Medical imaging', at: [0.73, 0.3], spin: 2.1 },
  geo: { label: 'Aerial & geo', at: [0.73, 0.76], spin: 4.0 },
  other: { label: 'Other ML', at: [0.27, 0.77], spin: 5.3 },
}
const ORDER: Topic[] = ['text', 'medical', 'geo', 'other']
const W = 440, H = 340
const GOLDEN = 2.39996

function topicOf(...text: Array<string | undefined>): Topic {
  const t = text.filter(Boolean).join(' ').toLowerCase()
  if (/tumou?r|medical|surviv|biopsy|cancer|\bmri\b|leukemia|patholog|clinical|radiolog/.test(t)) return 'medical'
  if (/aerial|cadastral|geoloc|satellite|remote sens/.test(t)) return 'geo'
  if (/\btext\b|ocr|spott|recogni[sz]er|document|scene|handwrit|character/.test(t)) return 'text'
  return 'other'
}

// Project dates arrive as ISO strings or text like "Nov 2022"; normalise to YYYY-MM so papers and projects sort together.
function yearMonth(v?: string | null): string {
  if (!v) return '0000-00'
  const d = new Date(/^\d{4}-\d{2}(-\d{2})?$/.test(v) ? `${v.slice(0, 10)}T00:00:00` : v)
  return isNaN(d.getTime()) ? (v.match(/(19|20)\d{2}/)?.[0] ?? '0000') + '-00' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function toWorkPoints(publications: Publication[], projects: Project[]): WorkPoint[] {
  return [
    ...publications.map<WorkPoint>(p => ({
      key: `pub-${p.id}`, kind: 'paper', title: p.title,
      meta: [venueAbbr(p.venue), p.publication_year].filter(Boolean).join(' '),
      topic: topicOf(p.title, p.abstract_text), sort: `${p.publication_year ?? 0}-06`, href: `/publications#pub-${p.id}`,
    })),
    ...projects.map<WorkPoint>(p => ({
      key: `proj-${p.id}`, kind: 'project', title: p.title,
      meta: shortDate(p.completed_date) || 'Project',
      topic: topicOf(p.title, p.technologies, p.description), sort: yearMonth(p.completed_date), href: `/projects#proj-${p.id}`,
    })),
  ]
}

export default function ResearchMap({ points, active, onActive, onOpen }: {
  points: WorkPoint[]
  active: string | null
  onActive: (key: string | null) => void
  onOpen: (href: string, from?: Element | null) => void
}) {
  const lastPointer = useRef<string>('mouse')
  const [focusKey, setFocusKey] = useState<string | null>(null)

  const layout = useMemo(() => {
    const placed = new Map<string, { x: number; y: number; cx: number; cy: number }>()
    const islands = ORDER.flatMap(topic => {
      const items = points.filter(p => p.topic === topic).sort((a, b) => a.sort.localeCompare(b.sort))
      if (!items.length) return []
      const [fx, fy] = TOPICS[topic].at
      const cx = fx * W, cy = fy * H
      let reach = 0
      items.forEach((p, i) => {
        const r = i === 0 ? 0 : 17 + 16 * Math.sqrt(i)
        const a = i * GOLDEN + TOPICS[topic].spin
        reach = Math.max(reach, r)
        placed.set(p.key, { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) * 0.85, cx, cy })
      })
      return [{ topic, cx, cy, r: reach + 30, count: items.length }]
    })
    const chrono = [...points].sort((a, b) => a.sort.localeCompare(b.sort))
    // Smooth thread through the work in date order (Catmull-Rom → cubic Bézier).
    const pts = chrono.map(p => placed.get(p.key)!)
    let d = pts.length ? `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}` : ''
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2
      const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6
      const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6
      d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
    }
    return { placed, islands, thread: d, first: chrono[0], last: chrono[chrono.length - 1] }
  }, [points])

  const shown = active ?? focusKey
  const hot = shown ? points.find(p => p.key === shown) : undefined
  const hotPos = hot ? layout.placed.get(hot.key) : undefined
  const year = (p?: WorkPoint) => p?.sort.slice(0, 4)

  if (!points.length) return null

  return (
    <figure className="rmap md-card" data-has-active={!!hot}>
      <figcaption className="rmap-head">
        <span className="side-label">Research map</span>
        <span className="rmap-hint">I&apos;ve mapped every paper and project I&apos;ve worked on by topic. <span className="hint-hover">Hover over a dot to see what it is, and click to open it.</span><span className="hint-touch">Tap a dot to see what it is, and tap again to open it.</span></span>
      </figcaption>
      <div className="rmap-plot">
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Research map of papers and projects by topic">
          <defs>
            <pattern id="rmap-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" className="rmap-grid-dot" /></pattern>
            {ORDER.map(t => (
              <radialGradient key={t} id={`rmap-halo-${t}`}>
                <stop offset="0%" className={`halo-stop t-${t}`} stopOpacity="0.16" />
                <stop offset="70%" className={`halo-stop t-${t}`} stopOpacity="0.06" />
                <stop offset="100%" className={`halo-stop t-${t}`} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>
          <rect width={W} height={H} fill="url(#rmap-grid)" />

          {layout.islands.map((isl, i) => (
            <g key={isl.topic} className={`rmap-island t-${isl.topic}`} data-dim={!!hot && hot.topic !== isl.topic} style={{ '--i': i } as React.CSSProperties}>
              <circle cx={isl.cx} cy={isl.cy} r={isl.r} fill={`url(#rmap-halo-${isl.topic})`} className="rmap-halo" style={{ transformOrigin: `${isl.cx}px ${isl.cy}px` }} />
              <text x={isl.cx} y={Math.max(14, isl.cy - isl.r - 2)} textAnchor="middle" className="rmap-label">
                {TOPICS[isl.topic].label}<tspan className="rmap-count" dx="5">{isl.count}</tspan>
              </text>
            </g>
          ))}

          <path d={layout.thread} className="rmap-thread" pathLength={1} />
          {layout.first && layout.last && layout.first.key !== layout.last.key && (
            <>
              <text {...yearAt(layout.placed.get(layout.first.key)!)} className="rmap-year">{year(layout.first)}</text>
              <text {...yearAt(layout.placed.get(layout.last.key)!)} className="rmap-year">{year(layout.last)}</text>
            </>
          )}

          {hot && hotPos && points.filter(p => p.topic === hot.topic && p.key !== hot.key).map(p => {
            const q = layout.placed.get(p.key)!
            return <line key={p.key} x1={hotPos.x} y1={hotPos.y} x2={q.x} y2={q.y} className={`rmap-link t-${hot.topic}`} />
          })}

          {points.map((p, i) => {
            const pos = layout.placed.get(p.key)!
            const isHot = hot?.key === p.key
            return (
              <a key={p.key} href={p.href} className={`rmap-pt t-${p.topic}`} data-kind={p.kind} data-hot={isHot} data-dim={!!hot && !isHot}
                aria-label={`${p.kind === 'paper' ? 'Paper' : 'Project'}: ${p.title} (${p.meta}) — ${TOPICS[p.topic].label}`}
                style={{ '--x': `${pos.x}px`, '--y': `${pos.y}px`, '--cx': `${pos.cx}px`, '--cy': `${pos.cy}px`, '--d': i } as React.CSSProperties}
                onPointerDown={e => { lastPointer.current = e.pointerType }}
                // pointermove, not pointerenter: a dot flying in (or content scrolling) under a resting cursor
                // fires enter events without the visitor doing anything, and browsers also send zero-distance moves
                // after a scroll. Only real movement highlights.
                onPointerMove={e => { if (e.pointerType === 'mouse' && (e.movementX || e.movementY) && active !== p.key) onActive(p.key) }}
                onPointerLeave={e => { if (e.pointerType === 'mouse' && active === p.key) onActive(null) }}
                onFocus={e => { if (e.currentTarget.matches(':focus-visible')) setFocusKey(p.key) }}
                onBlur={() => setFocusKey(null)}
                onClick={e => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
                  e.preventDefault()
                  // Touch: first tap previews, second tap opens.
                  if (lastPointer.current !== 'mouse' && active !== p.key) return onActive(p.key)
                  onOpen(p.href, e.currentTarget.querySelector('.rmap-dot'))
                }}>
                <circle r="14" className="rmap-hit" />
                <g className="rmap-float">
                  <circle r="13" className="rmap-pulse" />
                  <circle r={p.kind === 'paper' ? 7 : 6} className="rmap-dot" />
                </g>
              </a>
            )
          })}
        </svg>

        {hot && hotPos && (
          <div className="rmap-tip" role="status" data-side={hotPos.x > W * 0.66 ? 'left' : hotPos.x < W * 0.34 ? 'right' : 'center'}
            style={{ left: `${(hotPos.x / W) * 100}%`, top: `${(hotPos.y / H) * 100}%` }}>
            <span className="rmap-tip-meta"><i className={`rmap-key t-${hot.topic}`} data-kind={hot.kind} />{hot.kind === 'paper' ? 'Paper' : 'Project'} · {hot.meta}</span>
            <span className="rmap-tip-title">{hot.title}</span>
          </div>
        )}
      </div>
      <ul className="rmap-legend" aria-label="Legend">
        {layout.islands.map(isl => <li key={isl.topic}><i className={`rmap-key t-${isl.topic}`} data-kind="paper" />{TOPICS[isl.topic].label}</li>)}
        <li className="rmap-shape"><i className="rmap-key t-other" data-kind="paper" />paper</li>
        <li className="rmap-shape"><i className="rmap-key t-other" data-kind="project" />project</li>
      </ul>
    </figure>
  )
}

// Year labels sit just outside their point, pushed away from the plot centre so they never cover a dot.
function yearAt(p: { x: number; y: number }) {
  const right = p.x > W / 2
  return { x: p.x + (right ? 12 : -12), y: p.y + 18, textAnchor: right ? 'start' : 'end' } as const
}
