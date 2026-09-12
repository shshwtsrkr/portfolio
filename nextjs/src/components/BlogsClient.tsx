'use client'

import { motion } from 'framer-motion'
import type { Blog } from '@/types'
import { entryCount, monthYear } from '@/lib/format'

function cardBg() { return 'var(--card-bg)' }

export default function BlogsClient({ blogs, noTopPad, emptyMessage }: { blogs: Blog[]; noTopPad?: boolean; emptyMessage?: string }) {
  return (
    <div style={{ paddingTop: noTopPad ? 0 : '48px' }}>
      <div className="px-6 md:px-10 pt-16 pb-24">

        <div className="mb-8">
          <div className="flex items-end justify-between">
            <h1 className="font-bold uppercase" style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              Blogs
            </h1>
            <span className="mono mb-1" style={{ fontSize: '0.7rem', color: 'var(--body-muted)', letterSpacing: '0.12em' }}>
              {entryCount(blogs.length)}
            </span>
          </div>
          <div className="mt-4" style={{ borderTop: '1px solid var(--border)' }} />
        </div>

        {blogs.length === 0 ? (
          <p className="mono pt-12 text-center" style={{ fontSize: '0.8rem', color: 'var(--body-muted)', lineHeight: 1.7 }}>
            {emptyMessage || '— no entries yet —'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '3px' }}>
            {blogs.map((blog, i) => (
              <motion.a
                key={blog.id}
                href={blog.external_url || '#'}
                target={blog.external_url ? '_blank' : undefined}
                rel="noopener noreferrer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group flex flex-col"
                style={{ textDecoration: 'none', background: 'var(--bg)', border: '1px solid var(--border)', transition: 'background 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(217,119,87,0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg)'}
              >
                {/* Image area */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    aspectRatio: '16/9',
                    background: blog.thumbnail_url ? '#fff' : cardBg(),
                    padding: '2rem 1rem 1rem',
                  }}
                >
                  {blog.thumbnail_url ? (
                    <img src={blog.thumbnail_url} alt={blog.title} className="w-full h-full" style={{ objectFit: 'contain', display: 'block', transition: 'transform 0.4s', transform: 'scale(1)' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  ) : (
                    <div className="w-full h-full flex items-end">
                      <span className="mono" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: 'var(--body-muted)', opacity: 0.4, textTransform: 'uppercase' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Text area */}
                <div className="flex flex-col flex-1 p-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="font-semibold mb-2 line-clamp-2" style={{ fontSize: '0.98rem', color: 'var(--fg)', lineHeight: 1.4 }}>
                    {blog.title}
                  </p>
                  {blog.description && (
                    <p className="line-clamp-2 flex-1" style={{ fontSize: '0.8rem', color: 'var(--body-muted)', lineHeight: 1.6 }}>
                      {blog.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-3" style={{ marginTop: 'auto', borderTop: '1px solid var(--border)' }}>
                    <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--body-muted)', letterSpacing: '0.06em' }}>
                      {blog.date ? monthYear(blog.date) : '—'}
                    </span>
                    {blog.read_duration && (
                      <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--body-muted)', letterSpacing: '0.06em' }}>
                        {blog.read_duration} min
                      </span>
                    )}
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
