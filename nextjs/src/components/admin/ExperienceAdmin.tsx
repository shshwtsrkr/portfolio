'use client'

import { MdAdd, MdDeleteOutline, MdEdit, MdOutlineWork, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import type { Experience } from '@/types'
import { shortDate } from '@/lib/format'
import { Button, Empty, IconButton, PageHeader, Sheet, StatusChip, Switch, TextField, useCrud } from './m3'

const EMPTY: Partial<Experience> = {
  role: '', company: '', start_date: '', end_date: null,
  is_current: false, description: '', display_order: 0, is_published: true,
}
const byOrder = (a: Experience, b: Experience) => (a.display_order || 0) - (b.display_order || 0)

export default function ExperienceAdmin({ initialExperiences, devMode }: { initialExperiences: Experience[]; devMode?: boolean }) {
  const { items, editing, setEditing, saving, save, remove, togglePublished, dialog } = useCrud('experience', initialExperiences, byOrder, devMode, 'Role')
  const set = (patch: Partial<Experience>) => setEditing({ ...editing, ...patch })

  return (
    <>
      <PageHeader title="Experience" subtitle="Roles at the same company are shown together as one card, newest first.">
        <Button icon={<MdAdd size={20} />} onClick={() => setEditing({ ...EMPTY })}>New role</Button>
      </PageHeader>

      {items.length ? (
        <ul className="a-list">
          {items.map(exp => (
            <li key={exp.id} className="a-list-item">
              <span className="a-list-lead"><MdOutlineWork size={24} /></span>
              <div className="a-list-body">
                <div className="a-list-title">{exp.role}</div>
                <div className="a-list-meta">
                  <span>{exp.company} · {shortDate(exp.start_date)} – {exp.is_current || !exp.end_date ? 'now' : shortDate(exp.end_date)}</span>
                  <StatusChip published={exp.is_published} />
                </div>
              </div>
              <div className="a-list-actions">
                <IconButton label={exp.is_published === false ? 'Show on site' : 'Hide from site'} onClick={() => togglePublished(exp)}>{exp.is_published === false ? <MdVisibility size={20} /> : <MdVisibilityOff size={20} />}</IconButton>
                <IconButton label="Edit" onClick={() => setEditing({ ...exp })}><MdEdit size={20} /></IconButton>
                <IconButton label="Delete" danger onClick={() => remove(exp, exp.role)}><MdDeleteOutline size={20} /></IconButton>
              </div>
            </li>
          ))}
        </ul>
      ) : <Empty icon={<MdOutlineWork size={40} />}>No roles yet.</Empty>}

      <Sheet open={!!editing} title={editing?.id ? 'Edit role' : 'New role'} onClose={() => setEditing(null)} onSave={() => save()} saving={saving}>
        {editing && <>
          <TextField label="Role / title" value={editing.role} onChange={v => set({ role: v })} required />
          <TextField label="Company / organisation" value={editing.company} onChange={v => set({ company: v })} required support="Use the same spelling for every role at one company so they group together." />
          <div className="a-row">
            <TextField label="Start date" type="date" value={editing.start_date} onChange={v => set({ start_date: v })} />
            <TextField label="End date" type="date" value={editing.end_date} onChange={v => set({ end_date: v || null })} support="Leave blank if current" />
          </div>
          <TextField label="Description" value={editing.description} onChange={v => set({ description: v })} multiline rows={6} mono
            placeholder={'- Built X using Y\n- Improved Z by 40%'} support="Markdown bullet points" />
          <TextField label="Display order" type="number" value={editing.display_order ?? 0} onChange={v => set({ display_order: Number(v) })} support="Lower numbers show first" />
          <div>
            <Switch label="Current role" checked={!!editing.is_current} onChange={v => set({ is_current: v })} />
            <Switch label="Show on site" checked={editing.is_published !== false} onChange={v => set({ is_published: v })} />
          </div>
        </>}
      </Sheet>
      {dialog}
    </>
  )
}
