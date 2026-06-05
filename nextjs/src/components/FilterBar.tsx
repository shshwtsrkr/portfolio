'use client'

import { entryCount } from '@/lib/format'

interface Props {
  title: string
  statuses: string[]
  filter: string | null
  count: number
  onFilter: (v: string | null) => void
}

export default function FilterBar({ title, statuses, filter, count, onFilter }: Props) {
  const all = [{ label: 'All', value: null as string | null }, ...statuses.map((s) => ({ label: s, value: s }))]

  return (
    <div className="mb-8">
      {/* Title always full-width on its own line */}
      <h1
        className="font-bold uppercase"
        style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', letterSpacing: '-0.02em', lineHeight: 1 }}
      >
        {title}
      </h1>

      {/* Filters + count on the row below */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-y-2">
        {statuses.length > 0 ? (
          <div className="flex items-center gap-4 flex-wrap">
            {all.map(({ label, value }) => {
              const isActive = value === filter
              return (
                <button
                  key={label}
                  onClick={() => onFilter(value)}
                  className="mono flex items-center gap-1.5"
                  style={{
                    fontSize: '0.72rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: isActive ? 'var(--fg)' : 'var(--muted)',
                    fontWeight: isActive ? 600 : 400,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--fg)' }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--muted)' }}
                >
                  <span style={{
                    width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
                    background: isActive ? '#D97757' : 'transparent',
                    border: `1px solid ${isActive ? '#D97757' : 'var(--muted)'}`,
                    transition: 'background 0.15s, border-color 0.15s',
                    display: 'inline-block',
                  }} />
                  {label}
                </button>
              )
            })}
          </div>
        ) : <div />}

        <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.12em' }}>
          {entryCount(count)}
        </span>
      </div>

      <div className="mt-3" style={{ borderTop: '1px solid var(--border)' }} />
    </div>
  )
}
