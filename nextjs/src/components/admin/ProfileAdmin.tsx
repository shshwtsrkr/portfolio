'use client'

import { useRef, useState } from 'react'
import { MdAdd, MdArrowDownward, MdArrowUpward, MdClose, MdLink, MdSave } from 'react-icons/md'
import { snackbar } from '@/components/Material'
import { Button, IconButton, PageHeader, Select, TextField } from './m3'
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

  const save = async () => {
    if (devMode) return snackbar('Dev mode: saving is off. Connect Supabase and sign in.')
    setSaving(true)
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
    if (error) return snackbar(`Couldn't save: ${error.message}`)
    snackbar('Profile saved')
    router.refresh()
  }

  const setSocial = (i: number, patch: Partial<SocialRow>) => setSocials(socials.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  const moveSocial = (i: number, by: number) => { const n = [...socials]; [n[i + by], n[i]] = [n[i], n[i + by]]; setSocials(n) }

  return (
    <>
      <PageHeader title="Profile" subtitle="Your name, introduction and links on the home page.">
        <Button icon={<MdSave size={20} />} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
      </PageHeader>

      <section className="a-card">
        <h2>Basics</h2>
        <div className="a-stack">
          <ImageUpload label="Photo" value={imageUrl} onChange={setImageUrl} devMode={devMode} round />
          <TextField label="Name" value={name} onChange={setName} required />
          <TextField label="Title" value={title} onChange={setTitle} required support="Shown under your name, e.g. Researcher in Medical Imaging | AI & Infra Engineer" />
          <MarkdownField label="About" value={about} onChange={setAbout} rows={8}
            hint="Markdown: a blank line starts a new paragraph, **bold**, links as [text](https://…). Select text and press the link button to wrap it." />
          <div>
            <span className="a-label">Highlighted phrases</span>
            <ListEditor items={aboutHighlights} setItems={setAboutHighlights} placeholder="e.g. computer vision" addLabel="Add phrase" />
            <span className="a-field-support" style={{ margin: '8px 0 0' }}>Must match the About text exactly; shown in the accent colour.</span>
          </div>
          {about && (
            <div>
              <span className="a-label">Preview</span>
              <MarkdownPreview text={about} words={aboutHighlights.filter(Boolean)} />
            </div>
          )}
          <TextField label="Résumé URL" type="url" value={resumeUrl} onChange={setResumeUrl} support="Link to a PDF; Google Drive share links work" />
        </div>
      </section>

      <section className="a-card">
        <h2>Social links</h2>
        <p className="a-card-sub">Shown as icons under your name, in this order.</p>
        <div className="a-repeat">
          {socials.map((s, i) => (
            <div key={i} className="a-repeat-row">
              <Select label="Platform" value={s.platform} onChange={v => setSocial(i, { platform: v })} options={PLATFORMS} />
              <TextField label={s.platform === 'email' ? 'Email address' : 'URL'} value={s.url} onChange={v => setSocial(i, { url: v })} />
              <div className="a-list-actions">
                <IconButton label="Move up" disabled={i === 0} onClick={() => moveSocial(i, -1)}><MdArrowUpward size={20} /></IconButton>
                <IconButton label="Move down" disabled={i === socials.length - 1} onClick={() => moveSocial(i, 1)}><MdArrowDownward size={20} /></IconButton>
                <IconButton label="Remove" danger onClick={() => setSocials(socials.filter((_, idx) => idx !== i))}><MdClose size={20} /></IconButton>
              </div>
            </div>
          ))}
          <div><Button variant="text" icon={<MdAdd size={20} />} onClick={() => setSocials([...socials, { platform: 'github', url: '' }])}>Add link</Button></div>
        </div>
      </section>

      <section className="a-card">
        <h2>Page taglines</h2>
        <p className="a-card-sub">One sentence under each page&apos;s title. Leave blank to show nothing.</p>
        <div className="a-stack">
          <TextField label="Experience" value={labels.experience} onChange={v => setLabels({ ...labels, experience: v })} />
          <TextField label="Publications" value={labels.publications} onChange={v => setLabels({ ...labels, publications: v })} />
          <TextField label="Projects" value={labels.projects} onChange={v => setLabels({ ...labels, projects: v })} />
          <TextField label="Writing" value={labels.blogs} onChange={v => setLabels({ ...labels, blogs: v })} />
        </div>
      </section>

      <section className="a-card">
        <h2>Empty page messages</h2>
        <p className="a-card-sub">Shown when a page has nothing published yet.</p>
        <div className="a-stack">
          <TextField label="Writing" value={emptyMsgs.blogs} onChange={v => setEmptyMsgs({ ...emptyMsgs, blogs: v })} />
          <TextField label="Projects" value={emptyMsgs.projects} onChange={v => setEmptyMsgs({ ...emptyMsgs, projects: v })} />
          <TextField label="Publications" value={emptyMsgs.publications} onChange={v => setEmptyMsgs({ ...emptyMsgs, publications: v })} />
        </div>
      </section>
    </>
  )
}

function MarkdownPreview({ text, words }: { text: string; words: string[] }) {
  const hl = (children: React.ReactNode): React.ReactNode => Array.isArray(children)
    ? children.map((c, i) => typeof c === 'string' ? <span key={i}>{hl(c)}</span> : c)
    : typeof children === 'string' ? <Highlighted text={children} words={words} /> : children
  return (
    <div className="a-preview">
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
    onChange(`${value.slice(0, a)}[${selected}](${url})${value.slice(b)}`)
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + 1, a + 1 + selected.length) })
  }
  return (
    <TextField label={label} value={value} onChange={onChange} multiline rows={rows} mono support={hint} inputRef={ref}
      tools={<IconButton label="Insert link" onClick={insertLink}><MdLink size={20} /></IconButton>} />
  )
}

function Highlighted({ text, words }: { text: string; words: string[] }) {
  let parts: { t: string; hl: boolean }[] = [{ t: text, hl: false }]
  for (const w of words) {
    if (!w) continue
    const re = new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    parts = parts.flatMap((p) =>
      p.hl ? [p] : p.t.split(re).filter(Boolean).map((s) => ({ t: s, hl: s.toLowerCase() === w.toLowerCase() }))
    )
  }
  return <>{parts.map((p, i) => p.hl ? <span key={i} className="hl">{p.t}</span> : <span key={i}>{p.t}</span>)}</>
}

function ListEditor({ items, setItems, placeholder, addLabel }: { items: string[]; setItems: (v: string[]) => void; placeholder: string; addLabel: string }) {
  return (
    <div className="a-repeat">
      {items.map((item, i) => (
        <div key={i} className="a-repeat-row single">
          <TextField label="Phrase" value={item} placeholder={placeholder} onChange={v => { const next = [...items]; next[i] = v; setItems(next) }} />
          <IconButton label="Remove" danger onClick={() => setItems(items.filter((_, idx) => idx !== i))}><MdClose size={20} /></IconButton>
        </div>
      ))}
      <div><Button variant="text" icon={<MdAdd size={20} />} onClick={() => setItems([...items, ''])}>{addLabel}</Button></div>
    </div>
  )
}
