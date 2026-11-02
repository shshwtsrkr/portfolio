'use client'

/* Material 3 building blocks for the admin area. Styles live in app/(admin)/admin.css. */

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { MdClose } from 'react-icons/md'
import { createClient } from '@/lib/supabase'
import { snackbar } from '@/components/Material'

type Variant = 'filled' | 'tonal' | 'outlined' | 'text' | 'danger'

export function Button({ variant = 'filled', small, icon, children, ...rest }: {
  variant?: Variant; small?: boolean; icon?: ReactNode; children: ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...rest} className={`a-btn ${variant}${small ? ' small' : ''} ripple ${rest.className ?? ''}`}>
      {icon}{children}
    </button>
  )
}

export function IconButton({ label, danger, children, ...rest }: { label: string; danger?: boolean; children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" aria-label={label} title={label} {...rest} className={`a-icon-btn ripple${danger ? ' danger' : ''}`}>
      {children}
    </button>
  )
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <header className="a-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="a-head-actions">{children}</div>}
    </header>
  )
}

type FieldProps = {
  label: string
  value: string | number | null | undefined
  onChange: (v: string) => void
  type?: string
  required?: boolean
  support?: ReactNode
  multiline?: boolean
  rows?: number
  mono?: boolean
  placeholder?: string
  tools?: ReactNode
  inputRef?: React.Ref<HTMLTextAreaElement>
}

/* Outlined text field: the label sits inside the box and floats into the outline once there's a value. */
export function TextField({ label, value, onChange, type = 'text', required, support, multiline, rows = 4, mono, placeholder, tools, inputRef }: FieldProps) {
  const id = useId()
  const common = {
    id, required, value: value ?? '', placeholder: placeholder ?? ' ',
    className: `a-field-control${mono ? ' mono' : ''}`,
    'aria-describedby': support ? `${id}-s` : undefined,
  }
  return (
    <div>
      <div className="a-field">
        {multiline
          ? <textarea {...common} ref={inputRef} rows={rows} onChange={e => onChange(e.target.value)} />
          : <input {...common} type={type} onChange={e => onChange(e.target.value)} />}
        <label htmlFor={id} className="a-field-label">{label}{required && <span className="a-field-req"> *</span>}</label>
        {tools && <div className="a-field-tools">{tools}</div>}
      </div>
      {support && <span id={`${id}-s`} className="a-field-support">{support}</span>}
    </div>
  )
}

export function Select({ label, value, onChange, options, support }: {
  label: string; value: string | number | null | undefined; onChange: (v: string) => void
  options: { value: string | number; label: string }[]; support?: ReactNode
}) {
  const id = useId()
  return (
    <div>
      <div className="a-field">
        <select id={id} className="a-field-control" value={value ?? ''} onChange={e => onChange(e.target.value)}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <label htmlFor={id} className="a-field-label">{label}</label>
      </div>
      {support && <span className="a-field-support">{support}</span>}
    </div>
  )
}

export function Switch({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="a-switch-row">
      <span>{label}{hint && <small>{hint}</small>}</span>
      <span className="a-switch">
        <input type="checkbox" role="switch" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span className="a-switch-handle" />
      </span>
    </label>
  )
}

/* Modal side sheet for editing one entry. Escape or the backdrop closes it. */
export function Sheet({ open, title, onClose, onSave, saving, children }: {
  open: boolean; title: string; onClose: () => void; onSave: () => void; saving?: boolean; children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog ref={ref} className="a-sheet" aria-label={title}
      onCancel={e => { e.preventDefault(); onClose() }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      {open && (
        <form method="dialog" style={{ display: 'contents' }} onSubmit={e => { e.preventDefault(); onSave() }}>
          <div className="a-sheet-head">
            <IconButton label="Close" onClick={onClose}><MdClose size={24} /></IconButton>
            <h2>{title}</h2>
          </div>
          <div className="a-sheet-body">{children}</div>
          <div className="a-sheet-foot">
            <Button variant="text" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      )}
    </dialog>
  )
}

/* Promise-based confirm in an M3 basic dialog: `if (await confirm({...})) …` */
export function useConfirm() {
  const [req, setReq] = useState<{ title: string; body: string; action: string; resolve: (ok: boolean) => void } | null>(null)
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { if (req && !ref.current?.open) ref.current?.showModal() }, [req])
  const done = (ok: boolean) => { req?.resolve(ok); ref.current?.close(); setReq(null) }
  const confirm = (o: { title: string; body: string; action?: string }) =>
    new Promise<boolean>(resolve => setReq({ action: 'Delete', ...o, resolve }))
  const dialog = (
    <dialog ref={ref} className="a-dialog" onCancel={e => { e.preventDefault(); done(false) }}>
      {req && <>
        <h2>{req.title}</h2>
        <p>{req.body}</p>
        <div className="a-dialog-actions">
          <Button variant="text" onClick={() => done(false)} autoFocus>Cancel</Button>
          <Button variant="danger" onClick={() => done(true)}>{req.action}</Button>
        </div>
      </>}
    </dialog>
  )
  return { confirm, dialog }
}

/* Shared create / update / delete / publish logic for the list editors. Feedback goes to the snackbar. */
type Row = { id: number; is_published?: boolean; created_at?: string; updated_at?: string }
export function useCrud<T extends Row>(table: string, initial: T[], sort: (a: T, b: T) => number, devMode?: boolean, noun = 'Entry') {
  const [items, setItems] = useState(() => [...initial].sort(sort))
  const [editing, setEditing] = useState<Partial<T> | null>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { confirm, dialog } = useConfirm()

  const save = async (clean: (row: Partial<T>) => Partial<T> = r => r) => {
    if (!editing) return
    if (devMode) return snackbar('Dev mode: saving is off. Connect Supabase to save.')
    setSaving(true)
    const { id, created_at: _c, updated_at: _u, ...data } = clean(editing) as Partial<T> & Row
    void _c; void _u
    const result = id
      ? await supabase.from(table).update(data).eq('id', id).select().single()
      : await supabase.from(table).insert(data).select().single()
    setSaving(false)
    if (result.error) return snackbar(`Couldn't save: ${result.error.message}`)
    const saved = result.data as T
    setItems(list => (list.some(x => x.id === saved.id) ? list.map(x => (x.id === saved.id ? saved : x)) : [saved, ...list]).sort(sort))
    setEditing(null)
    snackbar(id ? `${noun} updated` : `${noun} added`)
    router.refresh()
  }

  const remove = async (item: T, name: string) => {
    if (!(await confirm({ title: `Delete ${noun.toLowerCase()}?`, body: `“${name}” will be removed from the site. This can't be undone.` }))) return
    if (devMode) return snackbar('Dev mode: deleting is off.')
    const { error } = await supabase.from(table).delete().eq('id', item.id)
    if (error) return snackbar(`Couldn't delete: ${error.message}`)
    setItems(list => list.filter(x => x.id !== item.id))
    snackbar(`${noun} deleted`)
    router.refresh()
  }

  const togglePublished = async (item: T) => {
    if (devMode) return snackbar('Dev mode: changes are off.')
    const next = !item.is_published
    const { error } = await supabase.from(table).update({ is_published: next }).eq('id', item.id)
    if (error) return snackbar(`Couldn't update: ${error.message}`)
    setItems(list => list.map(x => (x.id === item.id ? { ...x, is_published: next } : x)))
    snackbar(next ? 'Published' : 'Hidden from the site')
    router.refresh()
  }

  return { items, editing, setEditing, saving, save, remove, togglePublished, dialog }
}

export function Empty({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return <div className="a-empty">{icon}{children}</div>
}

export function StatusChip({ published }: { published?: boolean }) {
  return published !== false ? <span className="a-chip live">Live</span> : <span className="a-chip">Hidden</span>
}

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
