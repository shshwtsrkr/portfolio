import { createClient } from '@/lib/supabase-server'
import PublicationsAdmin from '@/components/admin/PublicationsAdmin'
import { isSupabaseConfigured, MOCK_PUBLICATIONS } from '@/lib/dev-data'

export default async function AdminPublicationsPage() {
  if (!isSupabaseConfigured()) {
    return <PublicationsAdmin initialPublications={MOCK_PUBLICATIONS} devMode />
  }
  const supabase = await createClient()
  const { data: publications } = await supabase
    .from('publications')
    .select('*')
    .order('display_order', { ascending: true })
  return <PublicationsAdmin initialPublications={publications ?? []} />
}
