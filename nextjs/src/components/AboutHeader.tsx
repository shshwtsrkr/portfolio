'use client'

import { useMemo, type ReactNode } from 'react'
import { Md, MdInline } from '@/components/Markdown'
import {
  FaGithub, FaLinkedin, FaEnvelope, FaDownload, FaGlobe,
  FaInstagram, FaYoutube, FaMedium, FaLink, FaXTwitter,
} from 'react-icons/fa6'
import { SiGooglescholar } from 'react-icons/si'
import { warmResume } from '@/components/Navigation'
import { resumeHref } from '@/lib/format'
import type { Profile, SocialLink } from '@/types'

const DEFAULT_ABOUT = `I'm a machine learning researcher and engineer focused on computer vision, deep learning systems, and scalable MLOps infrastructure.`
// UX order: code → research → professional → social → contact
const DEFAULT_SOCIALS: SocialLink[] = [
  { platform: 'github', url: 'https://github.com/shshwtsrkr' },
  { platform: 'googlescholar', url: 'https://scholar.google.com' },
  { platform: 'linkedin', url: 'https://linkedin.com' },
  { platform: 'x', url: 'https://x.com' },
  { platform: 'email', url: 'papershared8@gmail.com' },
]

const SOCIAL_ICON_MAP: Record<string, React.ElementType> = {
  github: FaGithub, fagithub: FaGithub,
  googlescholar: SiGooglescholar, scholar: SiGooglescholar,
  linkedin: FaLinkedin, falinkedin: FaLinkedin,
  twitter: FaXTwitter, x: FaXTwitter,
  email: FaEnvelope, mail: FaEnvelope,
  globe: FaGlobe, website: FaGlobe,
  instagram: FaInstagram, youtube: FaYoutube, medium: FaMedium,
  download: FaDownload, link: FaLink, default: FaLink,
}

interface Highlight { word: string; color?: string }
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

function getIcon(map: Record<string, React.ElementType>, key: string): React.ElementType {
  const k = key.toLowerCase().replace(/[^a-z0-9]/g, '')
  return map[k] || map[`si${k}`] || map[`fa${k}`] || map.default
}

/* Name, subtitle, floated portrait, bio paragraphs, and a centered social row — the classic academic "about" header. */
export default function AboutHeader({ profile }: { profile: Partial<Profile> | null }) {
  const name = profile?.name || 'Shashwat Sarkar'
  const cv = resumeHref(profile?.resume_file_url)
  const about = (profile?.about || DEFAULT_ABOUT).trim()
  const config = safeJson<ProfileTextConfig>(profile?.oneliner_config, {})
  const highlights = config.about_highlights || []
  // Highlight words inside plain text runs only — never inside links or other inline markup.
  const hl = (children: ReactNode): ReactNode => Array.isArray(children)
    ? children.map((c, i) => typeof c === 'string' ? <span key={i}>{hl(c)}</span> : c)
    : typeof children === 'string'
      ? splitHighlights(children, highlights).map((part, j) => <span key={j} className={part.hit ? 'bio-highlight' : undefined}>{part.text}</span>)
      : children
  const md = {
    p: ({ children }: { children?: ReactNode }) => <p>{hl(children)}</p>,
    li: ({ children }: { children?: ReactNode }) => <li>{hl(children)}</li>,
  }
  const socials = useMemo(() => {
    const links = safeJson<SocialLink[]>(profile?.socials, DEFAULT_SOCIALS)
    return (Array.isArray(links) ? links : DEFAULT_SOCIALS).filter(s => s?.url)
  }, [profile])

  return (
    <>
      <header className="post-header">
        <h1>{name}</h1>
        <p className="desc"><MdInline>{profile?.title || 'ML Engineer & Researcher'}</MdInline></p>
      </header>
      <article className="about-article clearfix" aria-label="About me">
        {profile?.profile_image_url && (
          <div className="profile">
            <div className="profile-frame glass"><div className="photo"><img src={profile.profile_image_url} alt={`Portrait of ${name}`} width={400} height={500} /></div></div>
            <p className="profile-caption">{name.toLowerCase()}</p>
          </div>
        )}
        <Md components={md}>{about}</Md>
      </article>
      <div className="social-row">
        {socials.map(s => {
          const Icon = getIcon(SOCIAL_ICON_MAP, s.icon || s.platform || '')
          const href = ['email', 'mail'].includes(s.platform?.toLowerCase()) && !/^(https?:|mailto:)/.test(s.url) ? `mailto:${s.url}` : s.url
          return <a key={`${s.platform}-${s.url}`} className="social-link" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" aria-label={s.platform} title={s.platform}><Icon size={17} /></a>
        })}
        {cv && <a className="btn" href={cv} onPointerEnter={() => warmResume(cv)} onFocus={() => warmResume(cv)} download={`${name.replace(/\s+/g, '_')}_Resume.pdf`}>Download CV <FaDownload /></a>}
      </div>
    </>
  )
}
