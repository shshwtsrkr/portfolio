import { createClient } from '@/lib/supabase-server'
import CertificationsAdmin from '@/components/admin/CertificationsAdmin'
import { isSupabaseConfigured, MOCK_CERTIFICATIONS } from '@/lib/dev-data'

export default async function AdminCertificationsPage() {
  if (!isSupabaseConfigured()) {
    return <CertificationsAdmin initialCertifications={MOCK_CERTIFICATIONS} devMode />
  }
  const supabase = await createClient()
  const { data: certifications, error } = await supabase
    .from('certifications')
    .select('*')
    .order('issued_date', { ascending: false })
  return <CertificationsAdmin initialCertifications={certifications ?? []} missingTable={!!error} />
}
