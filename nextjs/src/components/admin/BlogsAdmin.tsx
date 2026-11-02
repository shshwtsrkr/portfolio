'use client'

import { MdAdd, MdDeleteOutline, MdEdit, MdOutlineArticle, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import type { Blog } from '@/types'
import { shortDate } from '@/lib/format'
import ImageUpload from './ImageUpload'
import { Button, Empty, IconButton, PageHeader, Sheet, StatusChip, Switch, TextField, useCrud } from './m3'

const EMPTY: Partial<Blog> = {
  title: '', description: '', date: new Date().toISOString().split('T')[0],
  thumbnail_url: '', external_url: '', read_duration: 5, tag: '', content: '',
  display_order: 0, is_published: false,
}
const byOrder = (a: Blog, b: Blog) => (a.display_order || 0) - (b.display_order || 0) || new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()

export default function BlogsAdmin({ initialBlogs, devMode }: { initialBlogs: Blog[]; devMode?: boolean }) {
  const { items, editing, setEditing, saving, save, remove, togglePublished, dialog } = useCrud('blogs', initialBlogs, byOrder, devMode, 'Post')
  const set = (patch: Partial<Blog>) => setEditing({ ...editing, ...patch })

  return (
    <>
      <PageHeader title="Writing" subtitle="Posts on the Writing page. Link out to Medium etc., or write the full post here.">
        <Button icon={<MdAdd size={20} />} onClick={() => setEditing({ ...EMPTY, date: new Date().toISOString().split('T')[0] })}>New post</Button>
      </PageHeader>

      {items.length ? (
        <ul className="a-list">
          {items.map(blog => (
            <li key={blog.id} className="a-list-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <span className="a-list-lead">{blog.thumbnail_url ? <img src={blog.thumbnail_url} alt="" /> : <MdOutlineArticle size={24} />}</span>
              <div className="a-list-body">
                <div className="a-list-title">{blog.title}</div>
                <div className="a-list-meta">
                  <span>{[shortDate(blog.date), blog.tag].filter(Boolean).join(' · ')}</span>
                  <StatusChip published={blog.is_published} />
                </div>
              </div>
              <div className="a-list-actions">
                <IconButton label={blog.is_published ? 'Hide from site' : 'Show on site'} onClick={() => togglePublished(blog)}>{blog.is_published ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}</IconButton>
                <IconButton label="Edit" onClick={() => setEditing({ ...blog })}><MdEdit size={20} /></IconButton>
                <IconButton label="Delete" danger onClick={() => remove(blog, blog.title)}><MdDeleteOutline size={20} /></IconButton>
              </div>
            </li>
          ))}
        </ul>
      ) : <Empty icon={<MdOutlineArticle size={40} />}>No posts yet. Write your first one.</Empty>}

      <Sheet open={!!editing} title={editing?.id ? 'Edit post' : 'New post'} onClose={() => setEditing(null)} onSave={() => save()} saving={saving}>
        {editing && <>
          <TextField label="Title" value={editing.title} onChange={v => set({ title: v })} required />
          <TextField label="Short description" value={editing.description} onChange={v => set({ description: v })} multiline rows={3} support="Excerpt shown in the list (Markdown)" />
          <div className="a-row">
            <TextField label="Date" type="date" value={editing.date} onChange={v => set({ date: v })} />
            <TextField label="Tag" value={editing.tag} onChange={v => set({ tag: v })} support="e.g. ML, DevOps" />
            <TextField label="Read time (min)" type="number" value={editing.read_duration ?? 5} onChange={v => set({ read_duration: Number(v) })} />
          </div>
          <TextField label="External URL" type="url" value={editing.external_url} onChange={v => set({ external_url: v })} support="Where the post lives, if it's published elsewhere" />
          <TextField label="Full post" value={editing.content} onChange={v => set({ content: v })} multiline rows={12} mono support="Optional. Markdown; readers open it with the “Read” button." />
          <ImageUpload label="Thumbnail" value={editing.thumbnail_url || ''} onChange={v => set({ thumbnail_url: v })} devMode={devMode} contextUrl={editing.external_url || ''} />

          <p className="a-sheet-section">Display</p>
          <TextField label="Display order" type="number" value={editing.display_order ?? 0} onChange={v => set({ display_order: Number(v) })} support="Lower numbers show first" />
          <Switch label="Show on site" checked={!!editing.is_published} onChange={v => set({ is_published: v })} />
        </>}
      </Sheet>
      {dialog}
    </>
  )
}
