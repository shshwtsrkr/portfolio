'use client'

import { MdAdd, MdDeleteOutline, MdEdit, MdOutlineScience, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import type { Publication } from '@/types'
import { venueAbbr } from '@/lib/format'
import ImageUpload from './ImageUpload'
import { Button, Empty, IconButton, MONTHS, PageHeader, Select, Sheet, StatusChip, Switch, TextField, useCrud } from './m3'

const STATUS_OPTIONS = ['Under Preparation', 'Submitted', 'Under Review', 'Accepted', 'Published']
const EMPTY: Partial<Publication> = {
  title: '', authors: '', venue: '', publication_year: new Date().getFullYear(),
  abstract_text: '', doi: '', pdf_url: '', code_url: '', thumbnail_url: '',
  show_citations: false, citation_count: 0, display_order: 0, is_published: false,
  show_pdf_button: true, show_code_button: false, show_doi_button: true,
}
const byOrder = (a: Publication, b: Publication) => (a.display_order || 0) - (b.display_order || 0) || (b.publication_year || 0) - (a.publication_year || 0)

export default function PublicationsAdmin({ initialPublications, devMode }: { initialPublications: Publication[]; devMode?: boolean }) {
  const { items, editing, setEditing, saving, save, remove, togglePublished, dialog } = useCrud('publications', initialPublications, byOrder, devMode, 'Paper')
  const set = (patch: Partial<Publication>) => setEditing({ ...editing, ...patch })
  // The month column is optional (supabase/add_publication_month.sql). Without it, the site finds the month from the DOI.
  const hasMonthColumn = initialPublications.some(p => 'publication_month' in p)

  return (
    <>
      <PageHeader title="Publications" subtitle="Papers on the Publications page, the research map and Recently.">
        <Button icon={<MdAdd size={20} />} onClick={() => setEditing({ ...EMPTY })}>New paper</Button>
      </PageHeader>

      {items.length ? (
        <ul className="a-list">
          {items.map(pub => (
            <li key={pub.id} className="a-list-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <span className="a-list-lead">{pub.thumbnail_url ? <img src={pub.thumbnail_url} alt="" /> : <MdOutlineScience size={24} />}</span>
              <div className="a-list-body">
                <div className="a-list-title">{pub.title}</div>
                <div className="a-list-meta">
                  <span>{[pub.venue && venueAbbr(pub.venue), pub.publication_year, pub.status].filter(Boolean).join(' · ')}</span>
                  <StatusChip published={pub.is_published} />
                </div>
              </div>
              <div className="a-list-actions">
                <IconButton label={pub.is_published ? 'Hide from site' : 'Show on site'} onClick={() => togglePublished(pub)}>{pub.is_published ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}</IconButton>
                <IconButton label="Edit" onClick={() => setEditing({ ...pub })}><MdEdit size={20} /></IconButton>
                <IconButton label="Delete" danger onClick={() => remove(pub, pub.title)}><MdDeleteOutline size={20} /></IconButton>
              </div>
            </li>
          ))}
        </ul>
      ) : <Empty icon={<MdOutlineScience size={40} />}>No papers yet.</Empty>}

      <Sheet open={!!editing} title={editing?.id ? 'Edit paper' : 'New paper'} onClose={() => setEditing(null)} onSave={() => save()} saving={saving}>
        {editing && <>
          <TextField label="Title" value={editing.title} onChange={v => set({ title: v })} required />
          <TextField label="Authors" value={editing.authors} onChange={v => set({ authors: v })} support="Comma-separated; your name is bolded automatically" />
          <TextField label="Venue" value={editing.venue} onChange={v => set({ venue: v })} support="Conference or journal, e.g. ICPR 2024" />
          <div className="a-row">
            <TextField label="Year" type="number" value={editing.publication_year} onChange={v => set({ publication_year: Number(v) })} />
            {hasMonthColumn && (
              <Select label="Month" value={editing.publication_month ?? ''} onChange={v => set({ publication_month: v ? Number(v) : null })}
                options={[{ value: '', label: 'From DOI' }, ...MONTHS.map((m, i) => ({ value: i + 1, label: m }))]} />
            )}
            <Select label="Status" value={editing.status ?? ''} onChange={v => set({ status: v })}
              options={[{ value: '', label: '—' }, ...STATUS_OPTIONS.map(s => ({ value: s, label: s }))]} />
          </div>
          <TextField label="Abstract" value={editing.abstract_text} onChange={v => set({ abstract_text: v })} multiline rows={6} support="Markdown; links as [text](https://…)" />
          <ImageUpload label="Figure / thumbnail" value={editing.thumbnail_url || ''} onChange={v => set({ thumbnail_url: v })} devMode={devMode} contextUrl={editing.code_url || ''} />

          <p className="a-sheet-section">Links</p>
          <TextField label="DOI" value={editing.doi} onChange={v => set({ doi: v })} support="e.g. 10.1007/978-3-031-78447-7_15 — also used to find the publication month" />
          <TextField label="Paper / PDF URL" type="url" value={editing.pdf_url} onChange={v => set({ pdf_url: v })} />
          <TextField label="Code URL" type="url" value={editing.code_url} onChange={v => set({ code_url: v })} />

          <p className="a-sheet-section">Display</p>
          <div className="a-row">
            <TextField label="Citations" type="number" value={editing.citation_count ?? 0} onChange={v => set({ citation_count: Number(v) })} />
            <TextField label="Display order" type="number" value={editing.display_order ?? 0} onChange={v => set({ display_order: Number(v) })} />
          </div>
          <div className="a-switches">
            <Switch label="Show on site" checked={!!editing.is_published} onChange={v => set({ is_published: v })} />
            <Switch label="Show citations" checked={!!editing.show_citations} onChange={v => set({ show_citations: v })} />
            <Switch label="Paper button" checked={!!editing.show_pdf_button} onChange={v => set({ show_pdf_button: v })} />
            <Switch label="Code button" checked={!!editing.show_code_button} onChange={v => set({ show_code_button: v })} />
            <Switch label="DOI button" checked={!!editing.show_doi_button} onChange={v => set({ show_doi_button: v })} />
          </div>
        </>}
      </Sheet>
      {dialog}
    </>
  )
}
