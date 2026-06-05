'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import HomeClient from '@/components/HomeClient'
import PublicationsClient from '@/components/PublicationsClient'
import ProjectsClient from '@/components/ProjectsClient'
import BlogsClient from '@/components/BlogsClient'
import { computeActiveSection, type SectionPos } from '@/lib/scrollspy'
import { parseEmptyMessages, parseSectionLabels } from '@/lib/format'
import type { Profile, Experience, Publication, Project, Blog } from '@/types'

interface Props {
  profile: Profile | null
  experiences: Experience[]
  publications: Publication[]
  projects: Project[]
  blogs: Blog[]
}

const SECTIONS = [
  { id: 'section-profile',      path: '/' },
  { id: 'section-publications', path: '/publications' },
  { id: 'section-projects',     path: '/projects' },
  { id: 'section-blogs',        path: '/blogs' },
]

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="px-6 md:px-10 py-4" style={{ borderTop: '1px solid var(--border)' }}>
      <p className="label">{label}</p>
    </div>
  )
}

export default function ScrollPage({ profile, experiences, publications, projects, blogs }: Props) {
  const pathname = usePathname()
  const lastPathRef = useRef<string>('')
  const didInitialScrollRef = useRef(false)
  const empty = parseEmptyMessages(profile?.empty_messages)
  const labels = parseSectionLabels(profile?.section_labels)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      // Measure each section's absolute top in document coordinates.
      const positions: SectionPos[] = SECTIONS.map(({ id, path }) => {
        const el = document.getElementById(id)
        const top = el ? el.getBoundingClientRect().top + window.scrollY : Number.MAX_SAFE_INTEGER
        return { path, top }
      }).filter((p) => p.top !== Number.MAX_SAFE_INTEGER)

      const active = computeActiveSection(positions, {
        scrollY: window.scrollY,
        viewportHeight: window.innerHeight,
        pageHeight: document.documentElement.scrollHeight,
      })

      if (active !== lastPathRef.current) {
        lastPathRef.current = active
        history.replaceState(null, '', active)
        window.dispatchEvent(new CustomEvent('sectionchange', { detail: active }))
      }
    }

    // rAF-throttled scroll handler
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    const initialSection = SECTIONS.find((s) => s.path === pathname && s.path !== '/')
    if (initialSection && !didInitialScrollRef.current) {
      didInitialScrollRef.current = true
      requestAnimationFrame(() => {
        const el = document.getElementById(initialSection.id)
        if (!el) {
          update()
          return
        }
        const targetY = Math.max(el.getBoundingClientRect().top + window.scrollY - 48, 0)
        window.scrollTo(0, targetY)
        update()
      })
    } else {
      update() // set initial state
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [pathname])

  return (
    <div>
      <section id="section-profile">
        <HomeClient profile={profile} experiences={experiences} experienceLabel={labels.experience} />
      </section>

      <section id="section-publications">
        <SectionDivider label={`// ${labels.publications || 'Publications'}`} />
        <PublicationsClient publications={publications} noTopPad emptyMessage={empty.publications} />
      </section>

      <section id="section-projects">
        <SectionDivider label={`// ${labels.projects || 'Projects'}`} />
        <ProjectsClient projects={projects} noTopPad emptyMessage={empty.projects} />
      </section>

      <section id="section-blogs">
        <SectionDivider label={`// ${labels.blogs || 'Blogs'}`} />
        <BlogsClient blogs={blogs} noTopPad emptyMessage={empty.blogs} />
      </section>
    </div>
  )
}
