import SitePage from '@/components/SitePage'
import { getPublicPageData } from '@/lib/public-page-data'

// Static, refreshed at most once a minute after admin edits.
export const revalidate = 60

export default async function AboutPage() {
  const data = await getPublicPageData()
  return <SitePage section="about" {...data} />
}
