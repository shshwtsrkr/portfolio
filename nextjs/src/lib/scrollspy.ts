// Pure, deterministic scroll-spy: given section positions and the current
// scroll state, return which section path should be the active nav item.
//
// `sections` MUST be ordered top-to-bottom (DOM order). `top` is each
// section's absolute Y position in the document (offset from page top).

export interface SectionPos {
  path: string
  top: number
}

export interface ScrollState {
  scrollY: number
  viewportHeight: number
  pageHeight: number
  navHeight?: number
}

export function computeActiveSection(
  sections: SectionPos[],
  { scrollY, viewportHeight, pageHeight, navHeight = 48 }: ScrollState
): string {
  if (sections.length === 0) return '/'

  // At (or within 2px of) the bottom of the page, the last section is active —
  // handles short final sections that can't scroll all the way to the top.
  if (scrollY + viewportHeight >= pageHeight - 2) {
    return sections[sections.length - 1].path
  }

  // The detection line sits just below the fixed nav. The active section is the
  // last one whose top has crossed above that line.
  const line = scrollY + navHeight + 12

  let active = sections[0].path
  for (const s of sections) {
    if (s.top <= line) active = s.path
    else break
  }
  return active
}
