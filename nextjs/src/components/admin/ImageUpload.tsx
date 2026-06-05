'use client'

import { useRef, useState } from 'react'

interface Props {
  label: string
  value: string
  onChange: (url: string) => void
  devMode?: boolean
}

export default function ImageUpload({ label, value, onChange, devMode }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File) => {
    if (devMode) { setError('Dev mode: upload disabled. Connect Supabase + log in.'); return }
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

  return (
    <div className="block">
      <span className="text-xs text-gray-400 mb-1 block">{label}</span>

      <div className="flex items-start gap-3">
        {/* Preview */}
        <div
          className="shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
          style={{ width: 96, height: 54, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-gray-600 font-mono">no image</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Hidden file input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors"
            >
              {uploading ? 'Uploading…' : 'Upload image'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-900/20 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          {/* Manual URL fallback */}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste an image URL"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-white/30"
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
      </div>
    </div>
  )
}
