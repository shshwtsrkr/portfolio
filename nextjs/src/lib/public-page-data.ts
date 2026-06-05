import { createClient } from '@/lib/supabase-server'
import {
  isSupabaseConfigured,
  MOCK_BLOGS,
  MOCK_EXPERIENCES,
  MOCK_PROFILE,
  MOCK_PROJECTS,
  MOCK_PUBLICATIONS,
} from '@/lib/dev-data'
import type { Blog, Experience, Profile, Project, Publication } from '@/types'

export interface PublicPageData {
  profile: Profile | null
  experiences: Experience[]
  publications: Publication[]
  projects: Project[]
  blogs: Blog[]
}

const MOCK_DATA: PublicPageData = {
  profile: MOCK_PROFILE,
  experiences: MOCK_EXPERIENCES,
  publications: MOCK_PUBLICATIONS,
  projects: MOCK_PROJECTS,
  blogs: MOCK_BLOGS,
}

export async function getPublicPageData(): Promise<PublicPageData> {
  if (!isSupabaseConfigured()) return MOCK_DATA

  try {
    const supabase = await createClient()
    const [
      { data: profile },
      { data: experiences },
      { data: publications },
      { data: projects },
      { data: blogs },
    ] = await Promise.all([
      supabase.from('profile').select('*').limit(1).single(),
      supabase.from('experience').select('*').eq('is_published', true).order('display_order'),
      supabase.from('publications').select('*').eq('is_published', true).order('display_order'),
      supabase.from('projects').select('*').eq('is_published', true).order('display_order'),
      supabase.from('blogs').select('*').eq('is_published', true).order('display_order'),
    ])

    return {
      profile: profile ?? null,
      experiences: experiences ?? [],
      publications: publications ?? [],
      projects: projects ?? [],
      blogs: blogs ?? [],
    }
  } catch {
    return MOCK_DATA
  }
}
