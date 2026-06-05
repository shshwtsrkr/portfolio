'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { Blog } from '@/types'
import ImageUpload from './ImageUpload'

const EMPTY: Partial<Blog> = {
  title: '', description: '', date: new Date().toISOString().split('T')[0],
  thumbnail_url: '', external_url: '', read_duration: 5,
  display_order: 0, is_published: false,
}

export default function BlogsAdmin({ initialBlogs, devMode }: { initialBlogs: Blog[]; devMode?: boolean }) {
  const [blogs, setBlogs] = useState(initialBlogs)
  const [editing, setEditing] = useState<Partial<Blog> | null>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const refresh = () => router.refresh()

  const sortBlogs = (items: Blog[]) =>
    [...items].sort((a, b) => (a.display_order || 0) - (b.display_order || 0) || new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())

  const upsertLocal = (blog: Blog) => {
    setBlogs((items) => {
      const exists = items.some((item) => item.id === blog.id)
      const next = exists
        ? items.map((item) => item.id === blog.id ? blog : item)
        : [blog, ...items]
      return sortBlogs(next)
    })
  }

  const save = async () => {
    if (!editing) return
    if (devMode) { alert('Dev mode: saves are disabled. Connect Supabase to persist changes.'); return }
    setSaving(true)
    let saved: Blog | null = null
    let error
    if (editing.id) {
      const { id, ...data } = editing as Blog
      delete data.created_at
      delete data.updated_at
      const result = await supabase.from('blogs').update(data).eq('id', id).select().single()
      saved = result.data
      error = result.error
    } else {
      const result = await supabase.from('blogs').insert(editing).select().single()
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
    refresh()
  }

  const del = async (id: number) => {
    if (!confirm('Delete this blog?')) return
    await supabase.from('blogs').delete().eq('id', id)
    setBlogs((b) => b.filter((x) => x.id !== id))
  }

  const toggle = async (blog: Blog) => {
    await supabase.from('blogs').update({ is_published: !blog.is_published }).eq('id', blog.id)
    setBlogs((b) => b.map((x) => x.id === blog.id ? { ...x, is_published: !x.is_published } : x))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Blogs</h1>
        <button onClick={() => setEditing({ ...EMPTY })}
          className="px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors">
          + New Blog
        </button>
      </div>

      {editing && (
        <div className="card-glass mb-6">
          <h2 className="text-xl font-semibold mb-4">{editing.id ? 'Edit Blog' : 'New Blog'}</h2>
          <div className="grid gap-4">
            <Field label="Title" value={editing.title || ''} onChange={(v) => setEditing({ ...editing, title: v })} required />
            <Field label="Description" value={editing.description || ''} onChange={(v) => setEditing({ ...editing, description: v })} multiline />
            <ImageUpload label="Thumbnail" value={editing.thumbnail_url || ''} onChange={(v) => setEditing({ ...editing, thumbnail_url: v })} devMode={devMode} />
            <Field label="Date" value={editing.date || ''} onChange={(v) => setEditing({ ...editing, date: v })} type="date" />
            <Field label="External URL" value={editing.external_url || ''} onChange={(v) => setEditing({ ...editing, external_url: v })} />
            <div className="flex gap-4">
              <Field label="Read Duration (min)" value={String(editing.read_duration || 5)} onChange={(v) => setEditing({ ...editing, read_duration: Number(v) })} type="number" />
              <Field label="Display Order" value={String(editing.display_order || 0)} onChange={(v) => setEditing({ ...editing, display_order: Number(v) })} type="number" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.is_published || false} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} className="w-4 h-4" />
              Published
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
        {blogs.map((blog) => (
          <div key={blog.id} className="card-glass flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full shrink-0 ${blog.is_published ? 'bg-green-400' : 'bg-gray-600'}`} />
                <h3 className="font-semibold text-white truncate">{blog.title}</h3>
              </div>
              <p className="text-sm text-gray-400">{blog.date}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => toggle(blog)} className="px-3 py-1 rounded-full text-xs bg-white/10 hover:bg-white/20 transition-colors">
                {blog.is_published ? 'Unpublish' : 'Publish'}
              </button>
              <button onClick={() => setEditing({ ...blog })} className="px-3 py-1 rounded-full text-xs bg-white/10 hover:bg-white/20 transition-colors">
                Edit
              </button>
              <button onClick={() => del(blog.id)} className="px-3 py-1 rounded-full text-xs bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
        {blogs.length === 0 && <p className="text-center text-gray-500 py-10">No blogs yet. Create your first one!</p>}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', multiline = false, required = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; multiline?: boolean; required?: boolean
}) {
  const cls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30'
  return (
    <label className="block">
      <span className="text-xs text-gray-400 mb-1 block">{label}{required && ' *'}</span>
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={cls} />
        : <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      }
    </label>
  )
}
