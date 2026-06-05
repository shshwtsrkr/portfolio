'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { Experience } from '@/types'

const EMPTY: Partial<Experience> = {
  role: '', company: '', start_date: '', end_date: null,
  is_current: false, description: '', display_order: 0, is_published: true,
}

export default function ExperienceAdmin({ initialExperiences, devMode }: { initialExperiences: Experience[]; devMode?: boolean }) {
  const [experiences, setExperiences] = useState(initialExperiences)
  const [editing, setEditing] = useState<Partial<Experience> | null>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const sortExperiences = (items: Experience[]) =>
    [...items].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))

  const upsertLocal = (experience: Experience) => {
    setExperiences((items) => {
      const exists = items.some((item) => item.id === experience.id)
      const next = exists
        ? items.map((item) => item.id === experience.id ? experience : item)
        : [experience, ...items]
      return sortExperiences(next)
    })
  }

  const save = async () => {
    if (!editing) return
    if (devMode) { alert('Dev mode: saves disabled. Connect Supabase to persist.'); return }
    setSaving(true)
    let saved: Experience | null = null
    let error
    if (editing.id) {
      const { id, ...data } = editing as Experience
      delete data.created_at
      delete data.updated_at
      const result = await supabase.from('experience').update(data).eq('id', id).select().single()
      saved = result.data
      error = result.error
    } else {
      const result = await supabase.from('experience').insert(editing).select().single()
      saved = result.data
      error = result.error
    }
    setSaving(false)
    if (error) {
      alert(`Save failed: ${error.message}`)
      return
    }
    if (saved) upsertLocal(saved)
    setEditing(null)
    router.refresh()
  }

  const del = async (id: number) => {
    if (!confirm('Delete this entry?')) return
    if (devMode) { alert('Dev mode: deletes disabled.'); return }
    await supabase.from('experience').delete().eq('id', id)
    setExperiences((e) => e.filter((x) => x.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Experience</h1>
        <button onClick={() => setEditing({ ...EMPTY })}
          className="px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors">
          + New Entry
        </button>
      </div>

      {editing && (
        <div className="card-glass mb-6">
          <h2 className="text-xl font-semibold mb-4">{editing.id ? 'Edit Entry' : 'New Entry'}</h2>
          <div className="grid gap-4">
            <Field label="Role / Title" value={editing.role || ''} onChange={(v) => setEditing({ ...editing, role: v })} required />
            <Field label="Company / Organisation" value={editing.company || ''} onChange={(v) => setEditing({ ...editing, company: v })} required />
            <div className="flex gap-4">
              <Field label="Start Date" value={editing.start_date || ''} onChange={(v) => setEditing({ ...editing, start_date: v })} type="date" />
              <Field label="End Date (leave blank if current)" value={editing.end_date || ''} onChange={(v) => setEditing({ ...editing, end_date: v || null })} type="date" />
            </div>
            <div className="flex gap-4">
              <Field label="Display Order" value={String(editing.display_order || 0)} onChange={(v) => setEditing({ ...editing, display_order: Number(v) })} type="number" />
            </div>
            <div className="flex flex-wrap gap-4">
              <CheckField label="Current Role" checked={!!editing.is_current} onChange={(v) => setEditing({ ...editing, is_current: v })} />
              <CheckField label="Published" checked={editing.is_published !== false} onChange={(v) => setEditing({ ...editing, is_published: v })} />
            </div>
            <label className="block">
              <span className="text-xs text-gray-400 mb-1 block">Description (markdown bullet points)</span>
              <textarea
                value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                rows={5}
                placeholder="- Built X using Y&#10;- Improved Z by 40%&#10;- Led a team of N"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 font-mono"
              />
            </label>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving}
              className="px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 bg-white/10 rounded-full font-medium hover:bg-white/20 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {experiences.map((exp) => (
          <div key={exp.id} className="card-glass flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {exp.is_current && <span className="w-2 h-2 rounded-full bg-[#D97757] shrink-0" />}
                <h3 className="font-semibold text-white truncate">{exp.role}</h3>
              </div>
              <p className="text-sm text-gray-400">{exp.company} · {exp.start_date} – {exp.end_date || 'present'}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setEditing({ ...exp })} className="px-3 py-1 rounded-full text-xs bg-white/10 hover:bg-white/20 transition-colors">Edit</button>
              <button onClick={() => del(exp.id)} className="px-3 py-1 rounded-full text-xs bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors">Delete</button>
            </div>
          </div>
        ))}
        {experiences.length === 0 && <p className="text-center text-gray-500 py-10">No experience entries yet.</p>}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean
}) {
  return (
    <label className="block flex-1">
      <span className="text-xs text-gray-400 mb-1 block">{label}{required && ' *'}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30" />
    </label>
  )
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4" />
      {label}
    </label>
  )
}
