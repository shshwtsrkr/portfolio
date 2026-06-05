import { createClient } from '@/lib/supabase-server'
import ProjectsAdmin from '@/components/admin/ProjectsAdmin'
import { isSupabaseConfigured, MOCK_PROJECTS } from '@/lib/dev-data'

export default async function AdminProjectsPage() {
  if (!isSupabaseConfigured()) {
    return <ProjectsAdmin initialProjects={MOCK_PROJECTS} devMode />
  }
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true })
  return <ProjectsAdmin initialProjects={projects ?? []} />
}
