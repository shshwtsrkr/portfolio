'use client'

import { useEffect, useRef } from 'react'

const NAV_HEIGHT = 48

export default function CursorFollower() {
  const ref = useRef<HTMLDivElement>(null)
  const target = useRef({ x: -200, y: -200 })
  const pos = useRef({ x: -200, y: -200 })

  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(hover: none)').matches) return

    const el = ref.current
    if (!el) return

    let moved = false
    let suppressed = false   // modal/expanded card open
    let inNav = false        // cursor over the fixed nav bar
    let raf = 0

    const apply = () => {
      el.style.opacity = moved && !suppressed && !inNav ? '1' : '0'
    }

    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX
      target.current.y = e.clientY
      moved = true
      inNav = e.clientY <= NAV_HEIGHT
      apply()
    }
    const onLeave = () => { moved = false; apply() }
    const onSuppress = (e: Event) => { suppressed = (e as CustomEvent<boolean>).detail; apply() }

    const loop = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.2
      pos.current.y += (target.current.y - pos.current.y) * 0.2
      el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(10px, 10px)`
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    window.addEventListener('cursorsuppress', onSuppress)
    raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('cursorsuppress', onSuppress)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 200,
        pointerEvents: 'none',
        opacity: 0,
        transition: 'opacity 0.25s ease',
        willChange: 'transform',
      }}
    >
      <span
        className="mono"
        style={{
          background: 'rgba(217, 119, 87, 0.72)', // muted claude orange, slightly transparent
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          color: '#0C0C0C',
          fontWeight: 700,
          fontSize: '0.58rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          padding: '4px 9px',
          display: 'inline-block',
        }}
      >
        Scroll
      </span>
    </div>
  )
}
