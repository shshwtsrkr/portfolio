'use client'

import { MdAdd, MdDeleteOutline, MdEdit, MdOutlineWorkspaces, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import type { Project } from '@/types'
import ImageUpload from './ImageUpload'
import { Button, Empty, IconButton, PageHeader, Select, Sheet, StatusChip, Switch, TextField, useCrud } from './m3'

const STATUS_OPTIONS = ['Completed', 'Active Development', 'On Hold', 'Archived']
const EMPTY: Partial<Project> = {
  title: '', description: '', technologies: '', github_url: '', live_url: '',
  status: 'Active Development', completed_date: '', display_order: 0,
  is_published: false, show_code_button: true, show_live_demo_button: false,
}
const byOrder = (a: Project, b: Project) => (a.display_order || 0) - (b.display_order || 0)

export default function ProjectsAdmin({ initialProjects, devMode }: { initialProjects: Project[]; devMode?: boolean }) {
  const { items, editing, setEditing, saving, save, remove, togglePublished, dialog } = useCrud('projects', initialProjects, byOrder, devMode, 'Project')
  const set = (patch: Partial<Project>) => setEditing({ ...editing, ...patch })

  return (
    <>
      <PageHeader title="Projects" subtitle="Shown on the Projects page and as dots on the research map.">
        <Button icon={<MdAdd size={20} />} onClick={() => setEditing({ ...EMPTY })}>New project</Button>
      </PageHeader>

      {items.length ? (
        <ul className="a-list">
          {items.map(project => (
            <li key={project.id} className="a-list-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <span className="a-list-lead">{project.preview_image_url ? <img src={project.preview_image_url} alt="" /> : <MdOutlineWorkspaces size={24} />}</span>
              <div className="a-list-body">
                <div className="a-list-title">{project.title}</div>
                <div className="a-list-meta">
                  <span>{[project.status, project.completed_date].filter(Boolean).join(' · ')}</span>
                  <StatusChip published={project.is_published} />
                </div>
              </div>
              <div className="a-list-actions">
                <IconButton label={project.is_published ? 'Hide from site' : 'Show on site'} onClick={() => togglePublished(project)}>{project.is_published ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}</IconButton>
                <IconButton label="Edit" onClick={() => setEditing({ ...project })}><MdEdit size={20} /></IconButton>
                <IconButton label="Delete" danger onClick={() => remove(project, project.title)}><MdDeleteOutline size={20} /></IconButton>
              </div>
            </li>
          ))}
        </ul>
      ) : <Empty icon={<MdOutlineWorkspaces size={40} />}>No projects yet.</Empty>}

      <Sheet open={!!editing} title={editing?.id ? 'Edit project' : 'New project'} onClose={() => setEditing(null)} onSave={() => save()} saving={saving}>
        {editing && <>
          <TextField label="Title" value={editing.title} onChange={v => set({ title: v })} required />
          <TextField label="Description" value={editing.description} onChange={v => set({ description: v })} multiline rows={5} support="Markdown; links as [text](https://…)" />
          <TextField label="Technologies" value={editing.technologies} onChange={v => set({ technologies: v })} support="Comma-separated, e.g. PyTorch, FastAPI, Docker" />
          <div className="a-row">
            <Select label="Status" value={editing.status ?? ''} onChange={v => set({ status: v })} options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))} />
            <TextField label="Completed" value={editing.completed_date} onChange={v => set({ completed_date: v })} support="e.g. 2024-11 or Nov 2024" />
          </div>
          <ImageUpload label="Preview image" value={editing.preview_image_url || ''} onChange={v => set({ preview_image_url: v })} devMode={devMode} contextUrl={editing.github_url || ''} />

          <p className="a-sheet-section">Links</p>
          <TextField label="GitHub URL" type="url" value={editing.github_url} onChange={v => set({ github_url: v })} />
          <TextField label="Live URL" type="url" value={editing.live_url} onChange={v => set({ live_url: v })} />

          <p className="a-sheet-section">Display</p>
          <TextField label="Display order" type="number" value={editing.display_order ?? 0} onChange={v => set({ display_order: Number(v) })} support="Lower numbers show first" />
          <div className="a-switches">
            <Switch label="Show on site" checked={!!editing.is_published} onChange={v => set({ is_published: v })} />
            <Switch label="Code button" checked={!!editing.show_code_button} onChange={v => set({ show_code_button: v })} />
            <Switch label="Live demo button" checked={!!editing.show_live_demo_button} onChange={v => set({ show_live_demo_button: v })} />
          </div>
        </>}
      </Sheet>
      {dialog}
    </>
  )
}
