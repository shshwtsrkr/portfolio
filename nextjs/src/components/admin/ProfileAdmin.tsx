'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { Profile, EmptyMessages, SectionLabels } from '@/types'
import { parseEmptyMessages, parseSectionLabels } from '@/lib/format'
import ImageUpload from './ImageUpload'
import ReactMarkdown from 'react-markdown'

const ACCENT = '#B8741F'

function parseArr<T>(v: unknown, fallback: T[]): T[] {
  if (Array.isArray(v)) return v as T[]
  if (typeof v === 'string') { try { const p = JSON.parse(v); return Array.isArray(p) ? p : fallback } catch { return fallback } }
  return fallback
}
function parseObj<T>(v: unknown, fallback: T): T {
  if (v && typeof v === 'object') return v as T
  if (typeof v === 'string') { try { return JSON.parse(v) } catch { return fallback } }
  return fallback
}

interface Highlight { word: string; color: string }
interface Oneliner { text: string; highlights: Highlight[]; about_highlights?: Highlight[] }
interface SocialRow { platform: string; url: string }

const PLATFORMS = [
  { value: 'github', label: 'GitHub' },
  { value: 'googlescholar', label: 'Google Scholar' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Website' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'medium', label: 'Medium' },
]

export default function ProfileAdmin({ initialProfile, devMode }: { initialProfile: Profile | null; devMode?: boolean }) {
  const router = useRouter()
  const supabase = createClient()

  const [id] = useState(initialProfile?.id)
  const [name, setName] = useState(initialProfile?.name || '')
  const [title, setTitle] = useState(initialProfile?.title || '')
  const [about, setAbout] = useState(initialProfile?.about || '')
  const [imageUrl, setImageUrl] = useState(initialProfile?.profile_image_url || '')
  const [resumeUrl, setResumeUrl] = useState(initialProfile?.resume_file_url || '')
  const [socials, setSocials] = useState<SocialRow[]>(
    parseArr<SocialRow>(initialProfile?.socials, []).map((s) => ({ platform: s.platform || 'github', url: s.url || '' }))
  )
  const initialOneliner = parseObj<Oneliner>(initialProfile?.oneliner_config, { text: '', highlights: [] })
  const [aboutHighlights, setAboutHighlights] = useState<string[]>(
    (initialOneliner.about_highlights || []).map((h) => h.word).filter(Boolean)
  )
  const initialEmpty = parseEmptyMessages(initialProfile?.empty_messages)
  const [emptyMsgs, setEmptyMsgs] = useState<EmptyMessages>({
    blogs: initialEmpty.blogs || '',
    projects: initialEmpty.projects || '',
    publications: initialEmpty.publications || '',
  })
  const initialLabels = parseSectionLabels(initialProfile?.section_labels)
  const [labels, setLabels] = useState<SectionLabels>({
    experience: initialLabels.experience || '',
    publications: initialLabels.publications || '',
    projects: initialLabels.projects || '',
    blogs: initialLabels.blogs || '',
  })

  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  const save = async () => {
    if (devMode) { alert('Dev mode: saves disabled. Connect Supabase + log in to persist.'); return }
    setSaving(true)
    setStatus('')
    const payload = {
      name, title,
      about,
      profile_image_url: imageUrl || null,
      resume_file_url: resumeUrl || null,
      socials: socials.filter((s) => s.url.trim()),
      oneliner_config: {
        ...initialOneliner,
        about_highlights: aboutHighlights.filter(Boolean).map((word) => ({ word, color: ACCENT })),
      },
      empty_messages: {
        blogs: emptyMsgs.blogs || '',
        projects: emptyMsgs.projects || '',
        publications: emptyMsgs.publications || '',
      },
      section_labels: {
        experience: labels.experience || '',
        publications: labels.publications || '',
        projects: labels.projects || '',
        blogs: labels.blogs || '',
      },
    }
    let error
    if (id) {
      ({ error } = await supabase.from('profile').update(payload).eq('id', id))
    } else {
      ({ error } = await supabase.from('profile').insert(payload))
    }
    setSaving(false)
    if (error) { setStatus(`Error: ${error.message}`) }
    else { setStatus('Saved ✓'); router.refresh(); setTimeout(() => setStatus(''), 2500) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <div className="flex items-center gap-3">
          {status && <span className={`text-sm ${status.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{status}</span>}
          <button onClick={save} disabled={saving}
            className="px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic info */}
        <div className="card-glass">
          <h2 className="text-lg font-semibold mb-4">Basic Info</h2>
          <div className="grid gap-4">
            <Field label="Name" value={name} onChange={setName} required />
            <Field label="Title (e.g. ML Engineer & Researcher)" value={title} onChange={setTitle} required />
            <MarkdownField label="About me" value={about} onChange={setAbout} rows={6}
              hint="Markdown: blank line = new paragraph, **bold**, and links as [text](https://…). Select text and press “Link” to wrap it." />
            <span className="text-xs text-gray-400 mb-2 block">About highlights (must match text exactly; shown in the accent colour)</span>
            <ListEditor items={aboutHighlights} setItems={setAboutHighlights} placeholder="e.g. computer vision" addLabel="+ Add about highlight" accentDot />
            {about && (
              <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">About preview</span>
                <MarkdownPreview text={about} words={aboutHighlights.filter(Boolean)} />
              </div>
            )}
            <ImageUpload label="Profile Image (optional)" value={imageUrl} onChange={setImageUrl} devMode={devMode} />
            <Field label="Resume URL (PDF link — Google Drive share links work)" value={resumeUrl} onChange={setResumeUrl} />
          </div>
        </div>

        {/* Socials */}
        <div className="card-glass">
          <h2 className="text-lg font-semibold mb-1">Social Links</h2>
          <p className="text-xs text-gray-400 mb-4">Shown as icons under your name, in this order. Drag-free reorder with the arrows.</p>
          <div className="space-y-2">
            {socials.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={s.platform}
                  onChange={(e) => { const n = [...socials]; n[i] = { ...n[i], platform: e.target.value }; setSocials(n) }}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-white/30 shrink-0"
                  style={{ width: 150 }}
                >
                  {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <input
                  value={s.url}
                  onChange={(e) => { const n = [...socials]; n[i] = { ...n[i], url: e.target.value }; setSocials(n) }}
                  placeholder={s.platform === 'email' ? 'you@example.com' : 'https://…'}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                />
                <button type="button" disabled={i === 0}
                  onClick={() => { const n = [...socials]; [n[i-1], n[i]] = [n[i], n[i-1]]; setSocials(n) }}
                  className="px-2 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-colors">↑</button>
                <button type="button" disabled={i === socials.length - 1}
                  onClick={() => { const n = [...socials]; [n[i+1], n[i]] = [n[i], n[i+1]]; setSocials(n) }}
                  className="px-2 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-colors">↓</button>
                <button type="button" onClick={() => setSocials(socials.filter((_, idx) => idx !== i))}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-900/20 transition-colors">✕</button>
              </div>
            ))}
            <button type="button" onClick={() => setSocials([...socials, { platform: 'github', url: '' }])}
              className="px-3 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/20 transition-colors">
              + Add social link
            </button>
          </div>
        </div>

        {/* Section labels */}
        <div className="card-glass">
          <h2 className="text-lg font-semibold mb-1">Page Taglines</h2>
          <p className="text-xs text-gray-400 mb-4">One sentence shown under the title of each page (publications, projects, work, writing). Leave blank to show nothing.</p>
          <div className="grid gap-4">
            <Field label="Work tagline" value={labels.experience || ''} onChange={(v) => setLabels({ ...labels, experience: v })} />
            <Field label="Publications tagline" value={labels.publications || ''} onChange={(v) => setLabels({ ...labels, publications: v })} />
            <Field label="Projects tagline" value={labels.projects || ''} onChange={(v) => setLabels({ ...labels, projects: v })} />
            <Field label="Writing tagline" value={labels.blogs || ''} onChange={(v) => setLabels({ ...labels, blogs: v })} />
          </div>
        </div>

        {/* Empty-state messages */}
        <div className="card-glass">
          <h2 className="text-lg font-semibold mb-1">Empty Section Messages</h2>
          <p className="text-xs text-gray-400 mb-4">Shown on a page when it has no published entries.</p>
          <div className="grid gap-4">
            <Field label="Writing — empty message" value={emptyMsgs.blogs || ''} onChange={(v) => setEmptyMsgs({ ...emptyMsgs, blogs: v })} />
            <Field label="Projects — empty message" value={emptyMsgs.projects || ''} onChange={(v) => setEmptyMsgs({ ...emptyMsgs, projects: v })} />
            <Field label="Publications — empty message" value={emptyMsgs.publications || ''} onChange={(v) => setEmptyMsgs({ ...emptyMsgs, publications: v })} />
          </div>
        </div>
      </div>
    </div>
  )
}

function MarkdownPreview({ text, words }: { text: string; words: string[] }) {
  const hl = (children: React.ReactNode): React.ReactNode => Array.isArray(children)
    ? children.map((c, i) => typeof c === 'string' ? <span key={i}>{hl(c)}</span> : c)
    : typeof children === 'string' ? <PreviewLine text={children} words={words} inline /> : children
  return (
    <div className="text-sm text-gray-200 leading-relaxed space-y-2 [&_a]:underline [&_a]:text-blue-400">
      <ReactMarkdown components={{ p: ({ children }) => <p>{hl(children)}</p>, li: ({ children }) => <li>{hl(children)}</li> }}>{text}</ReactMarkdown>
    </div>
  )
}

function MarkdownField({ label, value, onChange, rows = 4, hint }: { label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const insertLink = () => {
    const el = ref.current
    if (!el) return
    const url = window.prompt('Link URL (https://…)')
    if (!url) return
    const { selectionStart: a, selectionEnd: b } = el
    const selected = value.slice(a, b) || 'link text'
    const next = `${value.slice(0, a)}[${selected}](${url})${value.slice(b)}`
    onChange(next)
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + 1, a + 1 + selected.length) })
  }
  return (
    <label className="block">
      <span className="text-xs text-gray-400 mb-1 flex items-center justify-between">
        <span>{label}</span>
        <button type="button" onClick={insertLink} className="px-2 py-0.5 rounded-md text-[11px] bg-white/10 hover:bg-white/20 transition-colors">Link</button>
      </span>
      <textarea ref={ref} value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-white/30" />
      {hint && <span className="text-[11px] text-gray-500 mt-1 block">{hint}</span>}
    </label>
  )
}

function PreviewLine({ text, words, inline }: { text: string; words: string[]; inline?: boolean }) {
  let parts: { t: string; hl: boolean }[] = [{ t: text, hl: false }]
  for (const w of words) {
    if (!w) continue
    const re = new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    parts = parts.flatMap((p) =>
      p.hl ? [p] : p.t.split(re).filter(Boolean).map((s) => ({ t: s, hl: s.toLowerCase() === w.toLowerCase() }))
    )
  }
  const body = parts.map((p, i) => p.hl
    ? <span key={i} style={{ color: ACCENT, fontWeight: 600 }}>{p.t}</span>
    : <span key={i}>{p.t}</span>)
  return inline ? <>{body}</> : <p className="text-sm text-gray-200 leading-relaxed">{body}</p>
}

function ListEditor({ items, setItems, placeholder, addLabel, accentDot }: {
  items: string[]; setItems: (v: string[]) => void; placeholder: string; addLabel: string; accentDot?: boolean
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          {accentDot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT, flexShrink: 0 }} />}
          <input
            value={item}
            onChange={(e) => { const next = [...items]; next[i] = e.target.value; setItems(next) }}
            placeholder={placeholder}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
          />
          <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))}
            className="px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-900/20 transition-colors shrink-0">
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setItems([...items, ''])}
        className="px-3 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/20 transition-colors">
        {addLabel}
      </button>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-xs text-gray-400 mb-1 block">{label}{required && ' *'}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30" />
    </label>
  )
}
