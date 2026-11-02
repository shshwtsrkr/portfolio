'use client'

import { useRef, useState } from 'react'
import { MdAutoAwesome, MdDeleteOutline, MdUpload } from 'react-icons/md'
import { Button, TextField } from './m3'

interface Props {
  label: string
  value: string
  onChange: (url: string) => void
  devMode?: boolean
  /** Optional GitHub repo URL used to ground the AI thumbnail generator. */
  contextUrl?: string
  /** Round preview, for portraits. */
  round?: boolean
}

export default function ImageUpload({ label, value, onChange, devMode, contextUrl, round }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const [showGen, setShowGen] = useState(false)
  const [genPrompt, setGenPrompt] = useState('')
  const [genRepo, setGenRepo] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')

  const handleFile = async (file: File) => {
    if (devMode) { setError('Dev mode: uploading is off. Connect Supabase and sign in.'); return }
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Upload failed')
      onChange(json.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const generate = async () => {
    if (devMode) { setGenError('Dev mode: generating is off. Connect Supabase and sign in.'); return }
    if (!genPrompt.trim()) { setGenError('Describe the thumbnail first.'); return }
    setGenerating(true)
    setGenError('')
    try {
      const res = await fetch('/api/generate-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: genPrompt, repoUrl: genRepo }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Generation failed')
      onChange(json.url)
      setShowGen(false)
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <span className="a-label">{label}</span>
      <div className="a-image">
        <div className={`a-image-preview${round ? ' square' : ''}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value ? <img src={value} alt="" /> : <span>No image</span>}
        </div>
        <div>
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
          <div className="a-image-actions">
            <Button variant="tonal" small icon={<MdUpload size={18} />} onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? 'Uploading…' : 'Upload'}
            </Button>
            {!round && (
              <Button variant="outlined" small icon={<MdAutoAwesome size={18} />} onClick={() => { setGenError(''); setGenRepo(r => r || contextUrl || ''); setShowGen(s => !s) }}>
                Generate with AI
              </Button>
            )}
            {value && <Button variant="danger" small icon={<MdDeleteOutline size={18} />} onClick={() => onChange('')}>Remove</Button>}
          </div>
          <TextField label="Image URL" value={value} onChange={onChange} support="Or paste a link to an image" />
          {error && <p className="a-error-text" role="alert">{error}</p>}

          {showGen && (
            <div className="a-panel">
              <p>Makes a vector (SVG) thumbnail with Gemini. A GitHub repo is optional; its README and description are used as context.</p>
              <TextField label="GitHub repo URL" value={genRepo} onChange={setGenRepo} />
              <TextField label="Describe the thumbnail" value={genPrompt} onChange={setGenPrompt} multiline rows={3} />
              <div className="a-image-actions" style={{ marginBottom: 0 }}>
                <Button small onClick={generate} disabled={generating}>{generating ? 'Generating…' : 'Generate'}</Button>
                <Button variant="text" small onClick={() => setShowGen(false)}>Cancel</Button>
              </div>
              {genError && <p className="a-error-text" role="alert">{genError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
