'use client'

import { useEffect, useRef, useState } from 'react'
import { MdArrowUpward } from 'react-icons/md'

/* Material 3 runtime pieces, kept tiny:
   - Ripples: one document-level listener draws the press ripple on any `.ripple` element.
   - Snackbar: anything can call `snackbar('text')`; one host shows it bottom-centre.
   - Back-to-top FAB: appears once the page has scrolled past the first screen. */

export function snackbar(message: string) {
  window.dispatchEvent(new CustomEvent('md-snackbar', { detail: message }))
}

export default function MaterialRuntime() {
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const [showFab, setShowFab] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const host = (e.target as HTMLElement | null)?.closest<HTMLElement>('.ripple')
      if (!host || e.button !== 0) return
      const r = host.getBoundingClientRect()
      const size = Math.hypot(r.width, r.height) * 2
      const wave = document.createElement('span')
      wave.className = 'ripple-wave'
      wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`
      host.appendChild(wave)
      const release = () => {
        wave.classList.add('is-out')
        setTimeout(() => wave.remove(), 450)
        window.removeEventListener('pointerup', release)
        window.removeEventListener('pointercancel', release)
      }
      window.addEventListener('pointerup', release)
      window.addEventListener('pointercancel', release)
    }
    const onToast = (e: Event) => {
      clearTimeout(timer.current)
      setToast({ id: Date.now(), text: (e as CustomEvent<string>).detail })
      timer.current = setTimeout(() => setToast(null), 3200)
    }
    let raf = 0
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setShowFab(window.scrollY > window.innerHeight * 0.9)) }
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('md-snackbar', onToast)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('md-snackbar', onToast)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <>
      <button type="button" className="fab ripple" data-show={showFab} aria-label="Back to top" tabIndex={showFab ? 0 : -1}
        onClick={() => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}>
        <MdArrowUpward size={24} aria-hidden="true" />
      </button>
      <div className="snackbar-host" aria-live="polite">
        {toast && <div key={toast.id} className="snackbar">{toast.text}</div>}
      </div>
    </>
  )
}
