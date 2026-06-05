'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { Profile, EmptyMessages, SectionLabels } from '@/types'
import { parseEmptyMessages, parseSectionLabels } from '@/lib/format'
import ImageUpload from './ImageUpload'

const ACCENT = '#D97757'

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
  const [typingTexts, setTypingTexts] = useState<string[]>(
    parseArr<string>(initialProfile?.typing_animation_texts, [])
  )
  const initialOneliner = parseObj<Oneliner>(initialProfile?.oneliner_config, { text: '', highlights: [] })
  const [onelinerText, setOnelinerText] = useState(initialOneliner.text || '')
  const [highlights, setHighlights] = useState<string[]>(
    (initialOneliner.highlights || []).map((h) => h.word).filter(Boolean)
  )
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
      typing_animation_texts: typingTexts.filter(Boolean),
      oneliner_config: {
        text: onelinerText,
        highlights: highlights.filter(Boolean).map((word) => ({ word, color: ACCENT })),
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
            <label className="block">
              <span className="text-xs text-gray-400 mb-1 block">About me</span>
              <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30" />
            </label>
            <span className="text-xs text-gray-400 mb-2 block">About highlights (must match text exactly)</span>
            <ListEditor items={aboutHighlights} setItems={setAboutHighlights} placeholder="e.g. computer vision" addLabel="+ Add about highlight" accentDot />
            {about && (
              <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">About preview</span>
                <PreviewLine text={about} words={aboutHighlights.filter(Boolean)} />
              </div>
            )}
            <ImageUpload label="Profile Image (optional)" value={imageUrl} onChange={setImageUrl} devMode={devMode} />
            <Field label="Resume URL (PDF link)" value={resumeUrl} onChange={setResumeUrl} />
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

        {/* Typing animation */}
        <div className="card-glass">
          <h2 className="text-lg font-semibold mb-1">Typing Animation</h2>
          <p className="text-xs text-gray-400 mb-4">Phrases that cycle under your name (the <span className="font-mono">$ ___</span> line).</p>
          <ListEditor items={typingTexts} setItems={setTypingTexts} placeholder="e.g. Computer Vision Engineer" addLabel="+ Add phrase" />
        </div>

        {/* One-liner */}
        <div className="card-glass">
          <h2 className="text-lg font-semibold mb-1">Tagline</h2>
          <p className="text-xs text-gray-400 mb-4">The sentence below the typing line. Add words/phrases to highlight in orange.</p>
          <label className="block mb-4">
            <span className="text-xs text-gray-400 mb-1 block">Tagline text</span>
            <textarea value={onelinerText} onChange={(e) => setOnelinerText(e.target.value)} rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30" />
          </label>
          <span className="text-xs text-gray-400 mb-2 block">Highlighted words (must match text exactly)</span>
          <ListEditor items={highlights} setItems={setHighlights} placeholder="e.g. computer vision" addLabel="+ Add highlight" accentDot />
          {/* Live preview */}
          {onelinerText && (
            <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <span className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">Preview</span>
              <PreviewLine text={onelinerText} words={highlights.filter(Boolean)} />
            </div>
          )}
        </div>

        {/* Section labels */}
        <div className="card-glass">
          <h2 className="text-lg font-semibold mb-1">Section Labels</h2>
          <p className="text-xs text-gray-400 mb-4">The small <span className="font-mono">{'// label'}</span> shown above each section. The <span className="font-mono">{'//'}</span> is added automatically.</p>
          <div className="grid gap-4">
            <Field label="Experience label" value={labels.experience || ''} onChange={(v) => setLabels({ ...labels, experience: v })} />
            <Field label="Publications label" value={labels.publications || ''} onChange={(v) => setLabels({ ...labels, publications: v })} />
            <Field label="Projects label" value={labels.projects || ''} onChange={(v) => setLabels({ ...labels, projects: v })} />
            <Field label="Blogs label" value={labels.blogs || ''} onChange={(v) => setLabels({ ...labels, blogs: v })} />
          </div>
        </div>

        {/* Empty-state messages */}
        <div className="card-glass">
          <h2 className="text-lg font-semibold mb-1">Empty Section Messages</h2>
          <p className="text-xs text-gray-400 mb-4">Shown on a section when it has no published entries. Leave blank for the default dash.</p>
          <div className="grid gap-4">
            <Field label="Blogs — empty message" value={emptyMsgs.blogs || ''} onChange={(v) => setEmptyMsgs({ ...emptyMsgs, blogs: v })} />
            <Field label="Projects — empty message" value={emptyMsgs.projects || ''} onChange={(v) => setEmptyMsgs({ ...emptyMsgs, projects: v })} />
            <Field label="Publications — empty message" value={emptyMsgs.publications || ''} onChange={(v) => setEmptyMsgs({ ...emptyMsgs, publications: v })} />
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewLine({ text, words }: { text: string; words: string[] }) {
  let parts: { t: string; hl: boolean }[] = [{ t: text, hl: false }]
  for (const w of words) {
    if (!w) continue
    const re = new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    parts = parts.flatMap((p) =>
      p.hl ? [p] : p.t.split(re).filter(Boolean).map((s) => ({ t: s, hl: s.toLowerCase() === w.toLowerCase() }))
    )
  }
  return (
    <p className="text-sm text-gray-200 leading-relaxed">
      {parts.map((p, i) => p.hl
        ? <span key={i} style={{ color: ACCENT, fontWeight: 600 }}>{p.t}</span>
        : <span key={i}>{p.t}</span>)}
    </p>
  )
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
