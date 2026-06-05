import { createClient } from '@/lib/supabase-server'
import ProfileAdmin from '@/components/admin/ProfileAdmin'
import { isSupabaseConfigured, MOCK_PROFILE } from '@/lib/dev-data'

export default async function AdminProfilePage() {
  if (!isSupabaseConfigured()) {
    return <ProfileAdmin initialProfile={MOCK_PROFILE} devMode />
  }
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profile').select('*').limit(1).single()
  return <ProfileAdmin initialProfile={profile ?? null} />
}
