'use client'

import { useMemo, type ReactNode } from 'react'
import { Md, MdInline } from '@/components/Markdown'
import type { IconType } from 'react-icons'
import { FaGithub, FaLinkedin, FaXTwitter, FaMedium, FaYoutube, FaInstagram, FaOrcid } from 'react-icons/fa6'
import { SiGooglescholar, SiSemanticscholar } from 'react-icons/si'
import { MdDownload, MdLink, MdOpenInNew, MdOutlineEmail, MdOutlineLanguage, MdOutlineVerified, MdWorkOutline } from 'react-icons/md'
import { warmResume } from '@/components/Navigation'
import { resumeHref, shortDate } from '@/lib/format'
import type { Certification, Experience, Profile, SocialLink } from '@/types'

const DEFAULT_ABOUT = `I'm a machine learning researcher and engineer focused on computer vision, deep learning systems, and scalable MLOps infrastructure.`
const DEFAULT_SOCIALS: SocialLink[] = [
  { platform: 'googlescholar', url: 'https://scholar.google.com' },
  { platform: 'github', url: 'https://github.com/shshwtsrkr' },
  { platform: 'linkedin', url: 'https://linkedin.com' },
  { platform: 'email', url: 'papershared8@gmail.com' },
]

// Human labels for the link row; research profiles first, then code, then social, then contact.
const LABELS: Record<string, [label: string, rank: number, icon: IconType]> = {
  googlescholar: ['Google Scholar', 0, SiGooglescholar], scholar: ['Google Scholar', 0, SiGooglescholar], orcid: ['ORCID', 1, FaOrcid], semanticscholar: ['Semantic Scholar', 1, SiSemanticscholar],
  github: ['GitHub', 2, FaGithub], linkedin: ['LinkedIn', 3, FaLinkedin], x: ['X', 4, FaXTwitter], twitter: ['X', 4, FaXTwitter],
  website: ['Website', 5, MdOutlineLanguage], globe: ['Website', 5, MdOutlineLanguage], medium: ['Medium', 6, FaMedium], youtube: ['YouTube', 6, FaYoutube], instagram: ['Instagram', 7, FaInstagram],
  email: ['Email', 8, MdOutlineEmail], mail: ['Email', 8, MdOutlineEmail],
}
const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

interface Highlight { word: string }
interface ProfileTextConfig { about_highlights?: Highlight[] }

function safeJson<T>(v: unknown, fallback: T): T {
  if (!v) return fallback
  if (typeof v === 'object') return v as T
  try { return JSON.parse(v as string) } catch { return fallback }
}

function splitHighlights(text: string, highlights: Highlight[]) {
  let parts: Array<{ text: string; hit?: boolean }> = [{ text }]
  for (const highlight of highlights) {
    const word = highlight.word?.trim()
    if (!word) continue
    const re = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    parts = parts.flatMap(part => part.hit ? [part] : part.text.split(re).filter(Boolean).map(value => ({ text: value, hit: value.toLowerCase() === word.toLowerCase() })))
  }
  return parts
}

/* Hero: name, role line, bio, and a plain row of text links; on wide screens a side column lists
   what's current (pulled from experience), so the essentials are visible without scrolling. */
export default function AboutHeader({ profile, experiences, certifications = [], map }: { profile: Partial<Profile> | null; experiences: Experience[]; certifications?: Certification[]; map?: ReactNode }) {
  const name = profile?.name || 'Shashwat Sarkar'
  const cv = resumeHref(profile?.resume_file_url)
  const about = (profile?.about || DEFAULT_ABOUT).trim()
  // "Researcher … | AI & Cloud Engineer" → a middot reads as typeset rather than as a code separator.
  const role = (profile?.title || 'ML Engineer & Researcher').replace(/\s*\|\s*/g, ' · ')
  const highlights = safeJson<ProfileTextConfig>(profile?.oneliner_config, {}).about_highlights || []
  const hl = (children: ReactNode): ReactNode => Array.isArray(children)
    ? children.map((c, i) => typeof c === 'string' ? <span key={i}>{hl(c)}</span> : c)
    : typeof children === 'string'
      ? splitHighlights(children, highlights).map((part, j) => part.hit ? <strong key={j}>{part.text}</strong> : <span key={j}>{part.text}</span>)
      : children
  const md = {
    p: ({ children }: { children?: ReactNode }) => <p>{hl(children)}</p>,
    li: ({ children }: { children?: ReactNode }) => <li>{hl(children)}</li>,
  }
  const socials = useMemo(() => {
    const links = safeJson<SocialLink[]>(profile?.socials, DEFAULT_SOCIALS)
    return (Array.isArray(links) ? links : DEFAULT_SOCIALS)
      .filter(s => s?.url)
      .map(s => {
        const k = key(s.platform || s.icon || '')
        const isMail = k === 'email' || k === 'mail'
        const href = isMail && !/^(https?:|mailto:)/.test(s.url) ? `mailto:${s.url}` : s.url
        const [label, rank, icon] = LABELS[k] ?? [s.platform || 'Link', 9, MdLink]
        return { href, label, rank, icon, external: href.startsWith('http') }
      })
      .sort((a, b) => a.rank - b.rank)
  }, [profile])
  const current = experiences.filter(e => e.is_current || !e.end_date)

  return (
    <section className="hero" aria-label="About">
      <div className="hero-main">
        {/* Optional portrait: a round photo above the name, so the name keeps its full width. With no photo, nothing changes. */}
        {profile?.profile_image_url && (
          <div className="hero-avatar-wrap">
            <img className="hero-avatar" src={profile.profile_image_url} alt={`Portrait of ${name}`} width={88} height={88} />
            {/* A hand-drawn arrow (one smooth arc, a small loop at the tail) pointing at the photo, sketched in once on load (Claude-style marginal doodle). */}
            <svg className="doodle-arrow" viewBox="0 0 150 115" aria-hidden="true">
              <path pathLength={1} d="M134 104 C 126 92, 112 92, 108 100 C 104 108, 118 110, 120 98 C 122 84, 104 70, 84 62 C 62 53, 40 48, 17 47" />
              <path pathLength={1} className="head" d="M27 38.5 C 23 42, 20 44.5, 16.5 47 C 20.5 49, 24 51.5, 27.5 55.5" />
            </svg>
          </div>
        )}
        <h1 className="hero-name">{name}</h1>
        <p className="hero-role"><MdInline>{role}</MdInline></p>
        <div className="hero-bio prose"><Md components={md}>{about}</Md></div>
        <div className="hero-actions">
          {cv && <a className="md-btn filled ripple" href={cv} onPointerEnter={() => warmResume(cv)} onFocus={() => warmResume(cv)} download={`${name.replace(/\s+/g, '_')}_CV.pdf`}><MdDownload size={18} aria-hidden="true" />Download CV</a>}
          <ul className="chip-set" aria-label="Elsewhere">
            {socials.map(s => {
              const Icon = s.icon
              return <li key={s.href}><a className="md-chip ripple" href={s.href} target={s.external ? '_blank' : undefined} rel="noopener noreferrer"><Icon size={16} aria-hidden="true" />{s.label}</a></li>
            })}
          </ul>
        </div>
      </div>
      <aside className="hero-side" aria-label="At a glance">
        {map}
        {current.length > 0 && (
          <div className="side-block md-card">
            <h2 className="side-label">Currently</h2>
            <ul>
              {current.map(e => (
                <li key={e.id}>
                  <span className="side-icon" aria-hidden="true"><MdWorkOutline size={20} /></span>
                  <span className="side-role"><MdInline>{e.role}</MdInline></span>
                  <span className="side-org"><MdInline>{e.company}</MdInline></span>
                  <span className="side-date">since {shortDate(e.start_date)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {certifications.length > 0 && (
          <div className="side-block md-card">
            <h2 className="side-label">Certifications</h2>
            <ul>
              {certifications.map(c => (
                <li key={c.id}>
                  <span className="side-icon" aria-hidden="true"><MdOutlineVerified size={20} /></span>
                  <span className="side-role">{c.credential_url
                    ? <a className="cert-link" href={c.credential_url} target="_blank" rel="noopener noreferrer">{c.name.includes(' ') && `${c.name.slice(0, c.name.lastIndexOf(' '))} `}<span className="nowrap">{c.name.slice(c.name.lastIndexOf(' ') + 1)}<MdOpenInNew size={14} aria-label="(opens credential)" /></span></a>
                    : c.name}</span>
                  <span className="side-org">{c.issuer}</span>
                  <span className="side-date">{shortDate(c.issued_date)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </section>
  )
}
