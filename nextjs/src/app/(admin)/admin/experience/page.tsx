import { createClient } from '@/lib/supabase-server'
import ExperienceAdmin from '@/components/admin/ExperienceAdmin'
import { isSupabaseConfigured, MOCK_EXPERIENCES } from '@/lib/dev-data'

export default async function AdminExperiencePage() {
  if (!isSupabaseConfigured()) {
    return <ExperienceAdmin initialExperiences={MOCK_EXPERIENCES} devMode />
  }
  const supabase = await createClient()
  const { data: experiences } = await supabase
    .from('experience')
    .select('*')
    .order('display_order', { ascending: true })
  return <ExperienceAdmin initialExperiences={experiences ?? []} />
}
