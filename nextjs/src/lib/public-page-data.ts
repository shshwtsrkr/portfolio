import { cache } from 'react'
import { createServerClient } from '@supabase/ssr'
import {
  isSupabaseConfigured,
  MOCK_BLOGS,
  MOCK_CERTIFICATIONS,
  MOCK_EXPERIENCES,
  MOCK_PROFILE,
  MOCK_PROJECTS,
  MOCK_PUBLICATIONS,
} from '@/lib/dev-data'
import type { Blog, Certification, Experience, Profile, Project, Publication } from '@/types'

export interface PublicPageData {
  profile: Profile | null
  experiences: Experience[]
  publications: Publication[]
  projects: Project[]
  blogs: Blog[]
  certifications: Certification[]
}

const MOCK_DATA: PublicPageData = {
  profile: MOCK_PROFILE,
  experiences: MOCK_EXPERIENCES,
  publications: MOCK_PUBLICATIONS,
  projects: MOCK_PROJECTS,
  blogs: MOCK_BLOGS,
  certifications: MOCK_CERTIFICATIONS,
}

// Public content is read with the anon key and no cookies, so pages stay static (ISR) instead of
// rendering on every request. cache() dedupes the query between the layout and the page.
export const getPublicPageData = cache(async (): Promise<PublicPageData> => {
  if (!isSupabaseConfigured()) return MOCK_DATA

  try {
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: { getAll: () => [], setAll: () => {} },
    })
    const [
      { data: profile },
      { data: experiences },
      { data: publications },
      { data: projects },
      { data: blogs },
      { data: certifications },
    ] = await Promise.all([
      supabase.from('profile').select('*').limit(1).single(),
      supabase.from('experience').select('*').eq('is_published', true).order('display_order'),
      supabase.from('publications').select('*').eq('is_published', true).order('display_order'),
      supabase.from('projects').select('*').eq('is_published', true).order('display_order'),
      supabase.from('blogs').select('*').eq('is_published', true).order('display_order'),
      // Missing table (migration not run yet) just returns an error and no rows, so the card stays hidden.
      supabase.from('certifications').select('*').eq('is_published', true).order('issued_date', { ascending: false }),
    ])

    return withPreviewSamples({
      profile: profile ?? null,
      experiences: experiences ?? [],
      publications: await withPublishedMonths(publications ?? []),
      projects: projects ?? [],
      blogs: blogs ?? [],
      certifications: certifications ?? [],
    })
  } catch {
    return MOCK_DATA
  }
})

/* A paper's month (for the home page's Recently list) comes from the admin's month field when set; otherwise
   it's looked up from Crossref by DOI: the date the paper first went online, falling back to when the DOI
   was registered (Elsevier lists only the print issue). Cached for a week; any failure just leaves it blank.
   Ignored unless Crossref's year matches the stored year, so a late print date can't move a paper. */
async function withPublishedMonths(pubs: Publication[]): Promise<Publication[]> {
  return Promise.all(pubs.map(async p => {
    if (p.publication_month || !p.doi || !p.publication_year) return p
    try {
      const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(p.doi)}`, {
        next: { revalidate: 60 * 60 * 24 * 7 },
        signal: AbortSignal.timeout(4000),
      })
      if (!res.ok) return p
      const { message: m } = await res.json()
      const [year, month] = (m['published-online'] ?? m.created)?.['date-parts']?.[0] ?? []
      return year === p.publication_year && month ? { ...p, publication_month: month } : p
    } catch {
      return p
    }
  }))
}

/* Local preview only: with PREVIEW_SAMPLES=1 in .env.local AND the dev server running, fill in a sample
   certification and a placeholder photo where the real data has none, to see those parts of the page.
   Never active in a production build, so it can't reach the live site. Remove the line to turn it off. */
function withPreviewSamples(data: PublicPageData): PublicPageData {
  if (process.env.NODE_ENV !== 'development' || process.env.PREVIEW_SAMPLES !== '1') return data
  return {
    ...data,
    profile: data.profile && !data.profile.profile_image_url ? { ...data.profile, profile_image_url: '/sample-avatar.svg' } : data.profile,
    certifications: data.certifications.length ? data.certifications : MOCK_CERTIFICATIONS,
  }
}
