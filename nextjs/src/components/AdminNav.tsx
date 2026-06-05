'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'

const NAV = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Profile', href: '/admin/profile' },
  { label: 'Experience', href: '/admin/experience' },
  { label: 'Blogs', href: '/admin/blogs' },
  { label: 'Projects', href: '/admin/projects' },
  { label: 'Publications', href: '/admin/publications' },
]

export default function AdminNav({ userEmail, devMode }: { userEmail: string; devMode?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    NAV.forEach((item) => router.prefetch(item.href))
  }, [router])

  const signOut = async () => {
    if (!devMode) {
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    router.push('/login')
  }

  return (
    <nav className="bg-gray-900 border-b border-white/10 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden sm:block">{userEmail}</span>
          <button
            onClick={signOut}
            className="px-3 py-1.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
