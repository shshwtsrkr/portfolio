import { createClient } from '@/lib/supabase-server'
import { isSupabaseConfigured } from '@/lib/dev-data'
import Link from 'next/link'

export default async function AdminDashboard() {
  let blogCount = 0, projectCount = 0, pubCount = 0

  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const [b, p, pub] = await Promise.all([
      supabase.from('blogs').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('publications').select('*', { count: 'exact', head: true }),
    ])
    blogCount = b.count ?? 0
    projectCount = p.count ?? 0
    pubCount = pub.count ?? 0
  }

  const stats = [
    { label: 'Blogs', count: blogCount, href: '/admin/blogs', accent: '#A855F7' },
    { label: 'Projects', count: projectCount, href: '/admin/projects', accent: '#0EA5E9' },
    { label: 'Publications', count: pubCount, href: '/admin/publications', accent: '#22C55E' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}
            className="card-glass group block min-h-32 transition-transform hover:-translate-y-0.5">
            <div className="flex h-full flex-col justify-between gap-6">
              <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: s.accent }} />
              <div>
                <p className="text-5xl font-bold leading-none text-white">{s.count}</p>
                <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-gray-400">{s.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/profile" className="card-glass hover:border-white/20 transition-colors">
          <h2 className="text-lg font-semibold mb-1">Edit Profile</h2>
          <p className="text-gray-400 text-sm">Update your name, bio, social links, and tech stack</p>
        </Link>
        <Link href="/" target="_blank" className="card-glass hover:border-white/20 transition-colors">
          <h2 className="text-lg font-semibold mb-1">View Site →</h2>
          <p className="text-gray-400 text-sm">Open the public portfolio in a new tab</p>
        </Link>
      </div>
    </div>
  )
}
