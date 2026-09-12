'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { Project } from '@/types'
import ImageUpload from './ImageUpload'

const STATUS_OPTIONS = ['Completed', 'Active Development', 'On Hold', 'Archived']
const EMPTY: Partial<Project> = {
  title: '', description: '', technologies: '', github_url: '', live_url: '',
  status: 'Active Development', completed_date: '', display_order: 0,
  is_published: false, show_code_button: true, show_live_demo_button: false,
}

export default function ProjectsAdmin({ initialProjects, devMode }: { initialProjects: Project[]; devMode?: boolean }) {
  const [projects, setProjects] = useState(initialProjects)
  const [editing, setEditing] = useState<Partial<Project> | null>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const sortProjects = (items: Project[]) =>
    [...items].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))

  const upsertLocal = (project: Project) => {
    setProjects((items) => {
      const exists = items.some((item) => item.id === project.id)
      const next = exists
        ? items.map((item) => item.id === project.id ? project : item)
        : [project, ...items]
      return sortProjects(next)
    })
  }

  const save = async () => {
    if (!editing) return
    if (devMode) { alert('Dev mode: saves are disabled. Connect Supabase to persist changes.'); return }
    setSaving(true)
    let saved: Project | null = null
    let error
    if (editing.id) {
      const { id, ...data } = editing as Project
      delete data.created_at
      delete data.updated_at
      const result = await supabase.from('projects').update(data).eq('id', id).select().single()
      saved = result.data
      error = result.error
    } else {
      const result = await supabase.from('projects').insert(editing).select().single()
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
    if (!confirm('Delete this project?')) return
    await supabase.from('projects').delete().eq('id', id)
    setProjects((p) => p.filter((x) => x.id !== id))
  }

  const toggle = async (project: Project) => {
    await supabase.from('projects').update({ is_published: !project.is_published }).eq('id', project.id)
    setProjects((p) => p.map((x) => x.id === project.id ? { ...x, is_published: !x.is_published } : x))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <button onClick={() => setEditing({ ...EMPTY })}
          className="px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors">
          + New Project
        </button>
      </div>

      {editing && (
        <div className="card-glass mb-6">
          <h2 className="text-xl font-semibold mb-4">{editing.id ? 'Edit Project' : 'New Project'}</h2>
          <div className="grid gap-4">
            <Field label="Title" value={editing.title || ''} onChange={(v) => setEditing({ ...editing, title: v })} required />
            <Field label="Description (Markdown — links as [text](https://…))" value={editing.description || ''} onChange={(v) => setEditing({ ...editing, description: v })} multiline />
            <Field label="Technologies (comma-separated)" value={editing.technologies || ''} onChange={(v) => setEditing({ ...editing, technologies: v })} />
            <Field label="GitHub URL" value={editing.github_url || ''} onChange={(v) => setEditing({ ...editing, github_url: v })} />
            <Field label="Live URL" value={editing.live_url || ''} onChange={(v) => setEditing({ ...editing, live_url: v })} />
            <ImageUpload label="Preview Image / Thumbnail" value={editing.preview_image_url || ''} onChange={(v) => setEditing({ ...editing, preview_image_url: v })} devMode={devMode} contextUrl={editing.github_url || ''} />
            <label className="block">
              <span className="text-xs text-gray-400 mb-1 block">Status</span>
              <select value={editing.status || ''} onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <div className="flex gap-4">
              <Field label="Completed Date" value={editing.completed_date || ''} onChange={(v) => setEditing({ ...editing, completed_date: v })} />
              <Field label="Display Order" value={String(editing.display_order || 0)} onChange={(v) => setEditing({ ...editing, display_order: Number(v) })} type="number" />
            </div>
            <div className="flex flex-wrap gap-4">
              <CheckField label="Published" checked={!!editing.is_published} onChange={(v) => setEditing({ ...editing, is_published: v })} />
              <CheckField label="Show Code Button" checked={!!editing.show_code_button} onChange={(v) => setEditing({ ...editing, show_code_button: v })} />
              <CheckField label="Show Live Demo Button" checked={!!editing.show_live_demo_button} onChange={(v) => setEditing({ ...editing, show_live_demo_button: v })} />
            </div>
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
        {projects.map((project) => (
          <div key={project.id} className="card-glass flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full shrink-0 ${project.is_published ? 'bg-green-400' : 'bg-gray-600'}`} />
                <h3 className="font-semibold text-white truncate">{project.title}</h3>
              </div>
              <p className="text-sm text-gray-400">{project.status} {project.completed_date && `· ${project.completed_date}`}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => toggle(project)} className="px-3 py-1 rounded-full text-xs bg-white/10 hover:bg-white/20 transition-colors">
                {project.is_published ? 'Unpublish' : 'Publish'}
              </button>
              <button onClick={() => setEditing({ ...project })} className="px-3 py-1 rounded-full text-xs bg-white/10 hover:bg-white/20 transition-colors">Edit</button>
              <button onClick={() => del(project.id)} className="px-3 py-1 rounded-full text-xs bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors">Delete</button>
            </div>
          </div>
        ))}
        {projects.length === 0 && <p className="text-center text-gray-500 py-10">No projects yet.</p>}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', multiline = false, required = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; multiline?: boolean; required?: boolean
}) {
  const cls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30'
  return (
    <label className="block flex-1">
      <span className="text-xs text-gray-400 mb-1 block">{label}{required && ' *'}</span>
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={cls} />
        : <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />}
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
