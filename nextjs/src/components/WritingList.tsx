'use client'

import { useState } from 'react'
import { MdOpenInNew } from 'react-icons/md'
import { Md, MdInline } from '@/components/Markdown'
import { shortDate } from '@/lib/format'
import type { Blog } from '@/types'

function Post({ blog }: { blog: Blog }) {
  const [open, setOpen] = useState(false)
  const bodyId = `post-${blog.id}`
  return (
    <li className="post md-card">
      <p className="pub-venue">
        <span>{shortDate(blog.date)}</span>
        {blog.read_duration ? <span>{blog.read_duration} min read</span> : null}
        {blog.tag && <span>{blog.tag}</span>}
      </p>
      <h3 className="pub-title">{blog.external_url ? <a href={blog.external_url} target="_blank" rel="noopener noreferrer"><MdInline>{blog.title}</MdInline></a> : <MdInline>{blog.title}</MdInline>}</h3>
      {blog.description && <div className="pub-desc prose"><Md>{blog.description}</Md></div>}
      {(blog.content || blog.external_url) && (
        <div className="pub-links">
          {blog.content && <button type="button" className="md-btn tonal ripple" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen(o => !o)}>{open ? 'Close' : 'Read'}</button>}
          {blog.external_url && <a className="md-btn outlined ripple" href={blog.external_url} target="_blank" rel="noopener noreferrer">Read article<MdOpenInNew className="trail" size={14} aria-hidden="true" /></a>}
        </div>
      )}
      {blog.content && (
        <div className="collapsible" data-open={open} id={bodyId} aria-hidden={!open}>
          <div><div className="post-body prose">
            {blog.thumbnail_url && <img className="post-thumb" src={blog.thumbnail_url} alt="" loading="lazy" width={1200} height={675} />}
            <Md>{blog.content}</Md>
          </div></div>
        </div>
      )}
    </li>
  )
}

export default function WritingList({ blogs }: { blogs: Blog[] }) {
  return <ol className="pub-list">{blogs.map(b => <Post key={b.id} blog={b} />)}</ol>
}
