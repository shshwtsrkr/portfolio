import { describe, it, expect } from 'vitest'
import { computeActiveSection, type SectionPos } from './scrollspy'

// Simulated layout: 4 full-height sections on a 800px-tall viewport.
// Section tops at 0, 1000, 2200, 3000. Page total height 3800.
const SECTIONS: SectionPos[] = [
  { path: '/', top: 0 },
  { path: '/publications', top: 1000 },
  { path: '/projects', top: 2200 },
  { path: '/blogs', top: 3000 },
]
const VH = 800
const PAGE = 3800
const NAV = 48

const at = (scrollY: number) =>
  computeActiveSection(SECTIONS, { scrollY, viewportHeight: VH, pageHeight: PAGE, navHeight: NAV })

describe('computeActiveSection', () => {
  it('returns first section at the very top', () => {
    expect(at(0)).toBe('/')
  })

  it('stays on profile while still scrolling through it', () => {
    expect(at(500)).toBe('/')
    expect(at(900)).toBe('/') // line = 900+60 = 960 < 1000, publications not reached
  })

  it('switches to publications once its top crosses the nav line', () => {
    // line = scrollY + 60 must be >= 1000  => scrollY >= 940
    expect(at(940)).toBe('/publications')
    expect(at(1500)).toBe('/publications')
  })

  it('switches to projects at its boundary', () => {
    // line >= 2200 => scrollY >= 2140
    expect(at(2139)).toBe('/publications')
    expect(at(2140)).toBe('/projects')
  })

  it('switches to blogs at its boundary', () => {
    // line >= 3000 => scrollY >= 2940
    expect(at(2940)).toBe('/blogs')
  })

  it('REGRESSION: scrolling UP from blogs back to profile re-activates profile', () => {
    // Was active /blogs at scrollY 2940; user clicks Profile -> scroll to 0
    expect(at(0)).toBe('/')
    // mid-scroll-up positions resolve correctly too
    expect(at(1500)).toBe('/publications')
    expect(at(940)).toBe('/publications')
    expect(at(500)).toBe('/')
  })

  it('REGRESSION: clicking previous section lands active on it, not the next one', () => {
    // Simulate: was on projects (scrollY ~2200), click Publications -> scrollY 940
    const afterClick = at(940)
    expect(afterClick).toBe('/publications')
    expect(afterClick).not.toBe('/projects')
  })

  it('forces last section when scrolled to the page bottom', () => {
    // Bottom: scrollY + VH >= PAGE - 2  => scrollY >= 2998
    // Even though blogs.top (3000) hasn't crossed the line, bottom rule applies.
    expect(at(3000)).toBe('/blogs')
    expect(at(2998)).toBe('/blogs')
  })

  it('handles empty sections gracefully', () => {
    expect(computeActiveSection([], { scrollY: 0, viewportHeight: VH, pageHeight: PAGE })).toBe('/')
  })

  it('handles a short last section that never reaches the top line', () => {
    // blogs is short: top 3700, page height 3800, vh 800.
    const shortLast: SectionPos[] = [
      { path: '/', top: 0 },
      { path: '/publications', top: 1000 },
      { path: '/projects', top: 2000 },
      { path: '/blogs', top: 3700 },
    ]
    // Max scroll = 3800 - 800 = 3000. blogs.top 3700 can never cross line.
    // But bottom rule kicks in at scrollY >= 2998, so blogs wins.
    const active = computeActiveSection(shortLast, { scrollY: 3000, viewportHeight: VH, pageHeight: PAGE, navHeight: NAV })
    expect(active).toBe('/blogs')
  })

  it('is monotonic: active index never skips backwards as you scroll down', () => {
    const order = ['/', '/publications', '/projects', '/blogs']
    let lastIdx = 0
    for (let y = 0; y <= 3000; y += 50) {
      const idx = order.indexOf(at(y))
      expect(idx).toBeGreaterThanOrEqual(lastIdx)
      lastIdx = idx
    }
  })
})
