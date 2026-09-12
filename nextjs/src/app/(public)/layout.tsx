import './portfolio.css'
import CursorFollower from '@/components/CursorFollower'
import LiquidBackground from '@/components/LiquidBackground'
import Navigation from '@/components/Navigation'
import { getPublicPageData } from '@/lib/public-page-data'

export const dynamic = 'force-dynamic'

/* The nav lives here, not in the page, so it survives route changes and its active pill can slide. */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getPublicPageData()
  return (
    <div id="top" className="w-full">
      <LiquidBackground />
      <CursorFollower />
      <Navigation name={profile?.name || 'Shashwat Sarkar'} hasResume={!!profile?.resume_file_url} />
      {children}
    </div>
  )
}
