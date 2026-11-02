'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useSyncExternalStore } from 'react'
import { MdArticle, MdDarkMode, MdDashboard, MdLightMode, MdLogout, MdOpenInNew, MdOutlineArticle, MdOutlineDashboard, MdOutlinePerson, MdOutlineScience, MdOutlineVerified, MdOutlineWork, MdOutlineWorkspaces, MdPerson, MdScience, MdVerified, MdWork, MdWorkspaces } from 'react-icons/md'
import { createClient } from '@/lib/supabase'
import { chooseTheme } from '@/lib/theme'
import { IconButton } from '@/components/admin/m3'

// Outlined icon when idle, filled when selected (M3 navigation convention).
const NAV = [
  { label: 'Home', href: '/admin', icon: MdOutlineDashboard, active: MdDashboard },
  { label: 'Profile', href: '/admin/profile', icon: MdOutlinePerson, active: MdPerson },
  { label: 'Papers', href: '/admin/publications', icon: MdOutlineScience, active: MdScience },
  { label: 'Projects', href: '/admin/projects', icon: MdOutlineWorkspaces, active: MdWorkspaces },
  { label: 'Work', href: '/admin/experience', icon: MdOutlineWork, active: MdWork },
  { label: 'Certs', href: '/admin/certifications', icon: MdOutlineVerified, active: MdVerified },
  { label: 'Writing', href: '/admin/blogs', icon: MdOutlineArticle, active: MdArticle },
]

// The theme lives on <html data-theme>; watch it so the toggle icon stays in sync.
function watchTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

export default function AdminNav({ devMode }: { devMode?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const dark = useSyncExternalStore(watchTheme, () => document.documentElement.getAttribute('data-theme') === 'dark', () => false)

  useEffect(() => { NAV.forEach(item => router.prefetch(item.href)) }, [router])

  const toggleTheme = () => {
    chooseTheme(dark ? 'light' : 'dark')
  }

  const signOut = async () => {
    if (!devMode) await createClient().auth.signOut()
    router.push('/login')
  }

  const tools = (
    <>
      <a href="/" target="_blank" rel="noopener noreferrer" className="a-icon-btn ripple" aria-label="Open the site" title="Open the site"><MdOpenInNew size={22} /></a>
      <IconButton label={dark ? 'Light theme' : 'Dark theme'} onClick={toggleTheme}>{dark ? <MdLightMode size={22} /> : <MdDarkMode size={22} />}</IconButton>
      <IconButton label="Sign out" onClick={signOut}><MdLogout size={22} /></IconButton>
    </>
  )

  return (
    <>
    {/* Phones: the rail becomes a bottom bar, and these tools move to a small top bar. */}
    <div className="a-mobile-bar">
      <Link href="/admin" className="a-rail-brand" aria-label="Admin home">SS</Link>
      <div>{tools}</div>
    </div>
    <nav className="a-rail" aria-label="Admin">
      <Link href="/admin" className="a-rail-brand" aria-label="Admin home">SS</Link>
      <div className="a-rail-items">
        {NAV.map(item => {
          const on = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          const Icon = on ? item.active : item.icon
          return (
            <Link key={item.href} href={item.href} className="a-nav-item" aria-current={on ? 'page' : undefined}>
              <span className="a-nav-pill ripple"><Icon size={24} aria-hidden="true" /></span>
              {item.label}
            </Link>
          )
        })}
      </div>
      <div className="a-rail-foot">{tools}</div>
    </nav>
    </>
  )
}
