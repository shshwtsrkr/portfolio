import { createClient } from '@/lib/supabase-server'
import BlogsAdmin from '@/components/admin/BlogsAdmin'
import { isSupabaseConfigured, MOCK_BLOGS } from '@/lib/dev-data'

export default async function AdminBlogsPage() {
  if (!isSupabaseConfigured()) {
    return <BlogsAdmin initialBlogs={MOCK_BLOGS} devMode />
  }
  const supabase = await createClient()
  const { data: blogs } = await supabase
    .from('blogs')
    .select('*')
    .order('display_order', { ascending: true })
  return <BlogsAdmin initialBlogs={blogs ?? []} />
}
