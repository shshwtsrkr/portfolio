'use client'

import { useEffect, useRef } from 'react'

const NAV_HEIGHT = 62
const BOTTOM_GAP = 24   // px from the page end that counts as "at the bottom"
const RESHOW_AFTER = 80 // px scrolled back up before the tag returns
const INTERACTIVE = 'a, button, input, textarea, select, summary, label, [role="switch"], [role="button"]'

/* Small "scroll" tag that trails the pointer (desktop only). Hidden over the nav, over anything clickable, on
   unscrollable pages, and once the reader reaches the bottom — it comes back after they scroll a little way up. */
export default function CursorFollower() {
  const ref = useRef<HTMLDivElement>(null)
  const target = useRef({ x: -200, y: -200 })
  const pos = useRef({ x: -200, y: -200 })

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return
    const el = ref.current
    if (!el) return
    let moved = false, inNav = false, overControl = false, done = false, raf = 0
    const apply = () => { el.style.opacity = moved && !inNav && !overControl && !done ? '1' : '0' }
    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY }; moved = true
      inNav = e.clientY <= NAV_HEIGHT
      overControl = !!(e.target as Element | null)?.closest?.(INTERACTIVE)
      apply()
    }
    const onLeave = () => { moved = false; apply() }
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const y = window.scrollY
      if (max <= BOTTOM_GAP || y >= max - BOTTOM_GAP) done = true
      else if (y <= max - RESHOW_AFTER) done = false
      apply()
    }
    const loop = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.2
      pos.current.y += (target.current.y - pos.current.y) * 0.2
      el.style.transform = `translate(${pos.current.x + 14}px, ${pos.current.y + 16}px)`
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', onMove); document.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={ref} className="cursor-tag" aria-hidden="true">
      <span className="cursor-tag-pill"><i className="cursor-tag-wheel" /><span>scroll</span></span>
    </div>
  )
}
