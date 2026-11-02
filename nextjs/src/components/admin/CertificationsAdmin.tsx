'use client'

import { MdAdd, MdDeleteOutline, MdEdit, MdOutlineVerified, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import type { Certification } from '@/types'
import { shortDate } from '@/lib/format'
import { snackbar } from '@/components/Material'
import { Button, Empty, IconButton, PageHeader, Sheet, StatusChip, Switch, TextField, useCrud } from './m3'

const EMPTY: Partial<Certification> = {
  name: '', issuer: '', issued_date: '', expires_date: null, credential_url: '', display_order: 0, is_published: true,
}
const byDate = (a: Certification, b: Certification) => (b.issued_date || '').localeCompare(a.issued_date || '')

export default function CertificationsAdmin({ initialCertifications, devMode, missingTable }: { initialCertifications: Certification[]; devMode?: boolean; missingTable?: boolean }) {
  const { items, editing, setEditing, saving, save, remove, togglePublished, dialog } = useCrud('certifications', initialCertifications, byDate, devMode, 'Certification')
  const set = (patch: Partial<Certification>) => setEditing({ ...editing, ...patch })

  const submit = () => {
    if (!editing?.name || !editing.issuer || !editing.issued_date) return snackbar('Name, issuer and issue date are required.')
    save(row => ({ ...row, credential_url: row.credential_url || null, expires_date: row.expires_date || null }))
  }

  return (
    <>
      <PageHeader title="Certifications" subtitle="Shown on the home page and in the Recently list.">
        <Button icon={<MdAdd size={20} />} onClick={() => setEditing({ ...EMPTY })}>New certification</Button>
      </PageHeader>

      {missingTable && (
        <div className="a-notice">The certifications table doesn&apos;t exist yet. Run <code>supabase/add_certifications.sql</code> in the Supabase SQL Editor, then reload.</div>
      )}

      {items.length ? (
        <ul className="a-list">
          {items.map(c => (
            <li key={c.id} className="a-list-item">
              <span className="a-list-lead"><MdOutlineVerified size={24} /></span>
              <div className="a-list-body">
                <div className="a-list-title">{c.name}</div>
                <div className="a-list-meta">
                  <span>{c.issuer} · {shortDate(c.issued_date)}</span>
                  <StatusChip published={c.is_published} />
                </div>
              </div>
              <div className="a-list-actions">
                <IconButton label={c.is_published === false ? 'Show on site' : 'Hide from site'} onClick={() => togglePublished(c)}>{c.is_published === false ? <MdVisibility size={20} /> : <MdVisibilityOff size={20} />}</IconButton>
                <IconButton label="Edit" onClick={() => setEditing({ ...c })}><MdEdit size={20} /></IconButton>
                <IconButton label="Delete" danger onClick={() => remove(c, c.name)}><MdDeleteOutline size={20} /></IconButton>
              </div>
            </li>
          ))}
        </ul>
      ) : <Empty icon={<MdOutlineVerified size={40} />}>No certifications yet.</Empty>}

      <Sheet open={!!editing} title={editing?.id ? 'Edit certification' : 'New certification'} onClose={() => setEditing(null)} onSave={submit} saving={saving}>
        {editing && <>
          <TextField label="Certification name" value={editing.name} onChange={v => set({ name: v })} required support="e.g. Professional Machine Learning Engineer" />
          <TextField label="Issuer" value={editing.issuer} onChange={v => set({ issuer: v })} required support="e.g. Google Cloud" />
          <div className="a-row">
            <TextField label="Issued on" type="date" value={editing.issued_date} onChange={v => set({ issued_date: v })} required />
            <TextField label="Expires on" type="date" value={editing.expires_date} onChange={v => set({ expires_date: v || null })} support="Optional; not shown on the site" />
          </div>
          <TextField label="Credential link" type="url" value={editing.credential_url} onChange={v => set({ credential_url: v })} support="Optional, e.g. your Credly or Google verification URL" />
          <Switch label="Show on site" checked={editing.is_published !== false} onChange={v => set({ is_published: v })} />
        </>}
      </Sheet>
      {dialog}
    </>
  )
}
