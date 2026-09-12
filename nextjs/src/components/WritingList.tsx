'use client'

import { useState } from 'react'
import { FiArrowUpRight } from 'react-icons/fi'
import { Md, MdInline } from '@/components/Markdown'
import { shortDate } from '@/lib/format'
import type { Blog } from '@/types'

function Post({ blog, index }: { blog: Blog; index: number }) {
  const [open, setOpen] = useState(false)
  const bodyId = `post-${blog.id}`
  return (
    <li className="post-item" style={{ '--i': index } as React.CSSProperties}>
      <h3>{blog.external_url ? <a href={blog.external_url} target="_blank" rel="noopener noreferrer"><MdInline>{blog.title}</MdInline></a> : <MdInline>{blog.title}</MdInline>}</h3>
      <div className="post-meta">
        <span>{shortDate(blog.date)}</span>
        {blog.read_duration ? <><span>·</span><span>{blog.read_duration} min read</span></> : null}
        {blog.tag && <span className="badge outline">{blog.tag}</span>}
      </div>
      {blog.description && <div className="post-excerpt prose"><Md>{blog.description}</Md></div>}
      {(blog.content || blog.external_url) && (
        <div className="post-actions">
          {blog.content && <button type="button" className="btn" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen(o => !o)}>{open ? 'Close' : 'Read'}</button>}
          {blog.external_url && <a className="btn" href={blog.external_url} target="_blank" rel="noopener noreferrer">Read article <FiArrowUpRight aria-hidden="true" /></a>}
        </div>
      )}
      {blog.content && (
        <div className="post-body collapsible" data-open={open} id={bodyId} aria-hidden={!open}>
          <div><div className="glass prose">
            {blog.thumbnail_url && <img className="post-thumb" src={blog.thumbnail_url} alt="" loading="lazy" width={1200} height={675} />}
            <Md>{blog.content}</Md>
          </div></div>
        </div>
      )}
    </li>
  )
}

export default function WritingList({ blogs }: { blogs: Blog[] }) {
  return <ul className="post-list">{blogs.map((b, i) => <Post key={b.id} blog={b} index={i} />)}</ul>
}
