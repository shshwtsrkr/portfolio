import Link from 'next/link'
import { MdOpenInNew, MdOutlineArticle, MdOutlinePerson, MdOutlineScience, MdOutlineVerified, MdOutlineWork, MdOutlineWorkspaces } from 'react-icons/md'
import { createClient } from '@/lib/supabase-server'
import { isSupabaseConfigured } from '@/lib/dev-data'

const SECTIONS = [
  { table: 'publications', label: 'Publications', href: '/admin/publications', icon: MdOutlineScience },
  { table: 'projects', label: 'Projects', href: '/admin/projects', icon: MdOutlineWorkspaces },
  { table: 'experience', label: 'Experience', href: '/admin/experience', icon: MdOutlineWork },
  { table: 'certifications', label: 'Certifications', href: '/admin/certifications', icon: MdOutlineVerified },
  { table: 'blogs', label: 'Writing', href: '/admin/blogs', icon: MdOutlineArticle },
] as const

export default async function AdminDashboard() {
  // Total and live (published) counts per section; a missing table just reads as zero.
  const counts = await Promise.all(SECTIONS.map(async s => {
    if (!isSupabaseConfigured()) return { total: 0, live: 0 }
    const supabase = await createClient()
    const [all, live] = await Promise.all([
      supabase.from(s.table).select('*', { count: 'exact', head: true }),
      supabase.from(s.table).select('*', { count: 'exact', head: true }).eq('is_published', true),
    ])
    return { total: all.count ?? 0, live: live.count ?? 0 }
  }))

  return (
    <>
      <header className="a-head">
        <div>
          <h1>Welcome back</h1>
          <p>Changes you save here show on the site within a minute.</p>
        </div>
      </header>

      <div className="a-stats">
        {SECTIONS.map((s, i) => {
          const Icon = s.icon
          const { total, live } = counts[i]
          return (
            <Link key={s.table} href={s.href} className="a-stat ripple">
              <span className="a-stat-icon"><Icon size={22} aria-hidden="true" /></span>
              <span>
                <span className="a-stat-num">{total}</span>
                <span className="a-stat-label" style={{ display: 'block' }}>{s.label}</span>
                <span className="a-stat-sub">{total === live ? 'All live' : `${live} live · ${total - live} hidden`}</span>
              </span>
            </Link>
          )
        })}
      </div>

      <h2 className="a-section-title">Shortcuts</h2>
      <div className="a-actions-grid">
        <Link href="/admin/profile" className="a-action ripple">
          <MdOutlinePerson size={24} aria-hidden="true" />
          <span><strong>Edit profile</strong><span>Name, about, photo, social links, résumé</span></span>
        </Link>
        <a href="/" target="_blank" rel="noopener noreferrer" className="a-action ripple">
          <MdOpenInNew size={24} aria-hidden="true" />
          <span><strong>View site</strong><span>Open the public portfolio in a new tab</span></span>
        </a>
      </div>
    </>
  )
}
