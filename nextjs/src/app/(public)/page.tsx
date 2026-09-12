import SitePage from '@/components/SitePage'
import { getPublicPageData } from '@/lib/public-page-data'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AboutPage() {
  const data = await getPublicPageData()
  return <SitePage section="about" {...data} />
}
