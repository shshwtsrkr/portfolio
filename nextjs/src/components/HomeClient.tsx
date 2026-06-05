'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FaGithub, FaLinkedin, FaEnvelope, FaDownload, FaGlobe,
  FaInstagram, FaYoutube, FaMedium, FaLink, FaXTwitter,
} from 'react-icons/fa6'
import { SiGooglescholar } from 'react-icons/si'
import { TypeAnimation } from 'react-type-animation'
import type { Profile, SocialLink, Experience } from '@/types'
import ExperienceTimeline from '@/components/ExperienceTimeline'

const DEFAULT_TYPING_TEXTS = ['Deep Learning Researcher', 'Computer Vision Engineer', 'MLOps Architect']
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
  let parts: Array<{ text: string; color?: string }> = [{ text }]
  for (const highlight of highlights) {
    const word = highlight.word?.trim()
    if (!word) continue
    const re = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    parts = parts.flatMap((part) => {
      if (part.color) return [part]
      return part.text
        .split(re)
        .filter(Boolean)
        .map((value) => ({
          text: value,
          color: value.toLowerCase() === word.toLowerCase() ? highlight.color || 'var(--accent)' : undefined,
        }))
    })
  }
  return parts
}

function getIcon(map: Record<string, React.ElementType>, key: string): React.ElementType {
  const k = key.toLowerCase().replace(/[^a-z0-9]/g, '')
  return map[k] || map[`si${k}`] || map[`fa${k}`] || map.default
}

export default function HomeClient({ profile, experiences, experienceLabel }: { profile: Partial<Profile> | null; experiences: Experience[]; experienceLabel?: string }) {
  const name: string = profile?.name || 'Shashwat Sarkar'
  const [firstName, ...rest] = name.split(' ')
  const lastName = rest.join(' ')
  const [cvHover, setCvHover] = useState(false)

  const typingTexts = useMemo(() => {
    const p = safeJson<string[]>(profile?.typing_animation_texts, DEFAULT_TYPING_TEXTS)
    return Array.isArray(p) && p.length ? p : DEFAULT_TYPING_TEXTS
  }, [profile])

  const about = (profile?.about || DEFAULT_ABOUT).split('\n').filter(Boolean).slice(0, 2).join(' ')
  const aboutHighlights = useMemo(() => {
    const config = safeJson<ProfileTextConfig>(profile?.oneliner_config, {})
    return Array.isArray(config.about_highlights) ? config.about_highlights : []
  }, [profile])
  const aboutParts = useMemo(() => splitHighlights(about, aboutHighlights), [about, aboutHighlights])

  const socials = useMemo(() => {
    const p = safeJson<SocialLink[]>(profile?.socials, DEFAULT_SOCIALS)
    return (Array.isArray(p) && p.length ? p : DEFAULT_SOCIALS)
      .filter((s) => s?.url)
      .map((s) => ({ ...s, Icon: getIcon(SOCIAL_ICON_MAP, s.icon || s.platform || '') }))
  }, [profile])

  const typeSeq = useMemo(() => typingTexts.flatMap((t) => [t, 2000]), [typingTexts])

  const FADE_UP = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] as [number,number,number,number] }
    })
  }

  return (
    <div style={{ paddingTop: '48px' }}>
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="px-6 md:px-10 pt-16 pb-12">
        <div className="flex items-start justify-between mb-6">
          {/* Year label */}
          <div /> {/* spacer */}
          <span className="mono text-xs" style={{ color: 'var(--muted)' }}>
            {new Date().getFullYear()}
          </span>
        </div>

        {/* Name — hard left, huge */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          <motion.h1
            custom={0}
            variants={FADE_UP}
            className="font-bold leading-none tracking-tight uppercase"
            style={{
              fontSize: 'clamp(3.5rem, 11vw, 9rem)',
              fontFamily: 'var(--font-display)',
              color: 'var(--fg)',
              letterSpacing: '-0.02em',
            }}
          >
            {firstName}
            <br />
            <span style={{ color: 'var(--accent)' }}>{lastName}</span>
          </motion.h1>

          {/* Title */}
          <motion.p
            custom={1}
            variants={FADE_UP}
            className="mono mt-4 mb-2"
            style={{ fontSize: '0.85rem', color: 'var(--fg)' }}
          >
            {profile?.title || 'ML Engineer & Researcher'}
          </motion.p>

          {/* Typing animation */}
          <motion.div custom={2} variants={FADE_UP} className="mb-8" style={{ height: '1.6rem' }}>
            <span
              className="mono uppercase"
              style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: 'var(--muted)' }}
            >
              ${' '}
            </span>
            <TypeAnimation
              sequence={typeSeq}
              wrapper="span"
              speed={55}
              className="mono uppercase"
              style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: 'var(--muted)' }}
              repeat={Infinity}
            />
          </motion.div>
        </motion.div>

        {/* Hairline */}
        <div className="hairline mb-6" />

        {/* About */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="label mb-3">About me</p>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              lineHeight: 1.7,
              maxWidth: '64rem',
              color: 'var(--fg)',
              fontWeight: 300,
            }}
          >
            {aboutParts.map((part, i) => part.color
              ? <span key={i} style={{ color: part.color, fontWeight: 500 }}>{part.text}</span>
              : <span key={i}>{part.text}</span>
            )}
          </p>
        </motion.div>

        {/* Social links + CV */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex items-center gap-5 mt-8 flex-wrap"
          onMouseEnter={() => window.dispatchEvent(new CustomEvent('cursorsuppress', { detail: true }))}
          onMouseLeave={() => window.dispatchEvent(new CustomEvent('cursorsuppress', { detail: false }))}
        >
          {socials.map((s) => {
            const Icon = s.Icon as React.ElementType
            const href = s.platform?.toLowerCase() === 'email' && !s.url.startsWith('http')
              ? `mailto:${s.url}` : s.url
            return (
              <a
                key={`${s.platform}-${s.url}`}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                title={s.platform}
                style={{ color: 'var(--fg)', transition: 'color 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--fg)'}
              >
                <Icon size={18} />
              </a>
            )
          })}

          {profile?.resume_file_url && (
            <>
              {/* thin divider before the CV button */}
              <span style={{ width: 1, height: 18, background: 'var(--border)', display: 'inline-block' }} />
              <button
                onMouseEnter={() => setCvHover(true)}
                onMouseLeave={() => setCvHover(false)}
                onClick={async () => {
                  const resumeUrl = profile.resume_file_url
                  if (!resumeUrl) return
                  window.open(resumeUrl, '_blank')
                  try {
                    const res = await fetch(resumeUrl)
                    const blob = await res.blob()
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url; a.download = `${name.replace(/\s+/g, '_')}_Resume.pdf`
                    document.body.appendChild(a); a.click()
                    document.body.removeChild(a); URL.revokeObjectURL(url)
                  } catch {}
                }}
                className="mono group relative inline-flex items-center gap-2 overflow-hidden"
                title="Download CV"
                style={{
                  fontSize: '0.68rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  padding: '8px 16px',
                  border: '1px solid var(--fg)',
                  color: cvHover ? '#0C0C0C' : 'var(--fg)',
                  background: cvHover ? 'var(--accent)' : 'transparent',
                  borderColor: cvHover ? 'var(--accent)' : 'var(--fg)',
                  cursor: 'pointer',
                  transition: 'color 0.3s, background 0.3s, border-color 0.3s',
                }}
              >
                <span>Download CV</span>
                <motion.span
                  animate={{ y: cvHover ? [0, 3, 0] : 0 }}
                  transition={cvHover ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
                  style={{ display: 'inline-flex' }}
                >
                  <FaDownload size={11} />
                </motion.span>
              </button>
            </>
          )}
        </motion.div>
      </section>

      <ExperienceTimeline experiences={experiences} label={experienceLabel} />
    </div>
  )
}
