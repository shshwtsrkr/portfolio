import './portfolio.css'
import Navigation from '@/components/Navigation'
import MaterialRuntime from '@/components/Material'
import { getPublicPageData } from '@/lib/public-page-data'
import { resumeHref } from '@/lib/format'

export const revalidate = 60

/* The nav lives here, not in the page, so it survives route changes. */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { profile, blogs } = await getPublicPageData()
  return (
    <div id="top" className="site">
      <Navigation name={profile?.name || 'Shashwat Sarkar'} resumeHref={resumeHref(profile?.resume_file_url)} showWriting={blogs.length > 0} />
      {children}
      <MaterialRuntime />
    </div>
  )
}
