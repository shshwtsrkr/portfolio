import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isSupabaseConfigured, MOCK_PROFILE } from '@/lib/dev-data'

const RESUME_TTL = 3600 // seconds; a CV changes rarely, and caching is what makes "cv" open instantly

// Google Drive "share" links (…/file/d/<id>/view) point at an HTML viewer
// page, not the file itself. Rewrite them to the direct-download endpoint so
// we stream the real PDF bytes rather than the viewer HTML.
function toDirectDownloadUrl(url: string): string {
  const driveId =
    url.match(/\/file\/d\/([^/]+)/)?.[1] ||
    url.match(/[?&]id=([^&]+)/)?.[1]
  if (url.includes('drive.google.com') && driveId) {
    return `https://drive.google.com/uc?export=download&id=${driveId}`
  }
  return url
}

// Only the two profile columns we need — not the whole public dataset.
async function resumeProfile(): Promise<{ name?: string; resume_file_url?: string } | null> {
  if (!isSupabaseConfigured()) return MOCK_PROFILE
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('profile').select('name, resume_file_url').limit(1).single()
    return data ?? null
  } catch {
    return null
  }
}

// Streams the profile resume through our own origin as an inline PDF so the
// browser opens it in its viewer (with its own download button) — even when
// the source URL is an external link (Google Drive, Dropbox, etc.) that would
// otherwise hand back an HTML preview page instead of the PDF.
export async function GET() {
  const profile = await resumeProfile()
  const resumeUrl = profile?.resume_file_url
  if (!resumeUrl) {
    return NextResponse.json({ error: 'No resume configured' }, { status: 404 })
  }
  const fetchUrl = toDirectDownloadUrl(resumeUrl)

  let upstream: Response
  try {
    // Kept in Next's data cache so repeat opens don't wait on Google Drive.
    upstream = await fetch(fetchUrl, { redirect: 'follow', next: { revalidate: RESUME_TTL } })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch resume' }, { status: 502 })
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'Failed to fetch resume' }, { status: 502 })
  }

  const name = (profile?.name || 'Resume').replace(/\s+/g, '_')

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${name}_Resume.pdf"`,
      // Browser and CDN may keep it for an hour; the viewer tab opens from cache on the next click.
      'Cache-Control': `public, max-age=${RESUME_TTL}, s-maxage=${RESUME_TTL}, stale-while-revalidate=86400`,
    },
  })
}
