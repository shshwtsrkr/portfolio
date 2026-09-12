import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Free-tier text model. Image-output models aren't on Gemini's free tier
// (limit: 0), so we have the text model author a self-contained SVG instead.
// Overridable via env in case the model id changes.
const GEMINI_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-3.6-flash'

// Pulls description / language / topics / README from a GitHub repo so the
// generated thumbnail is grounded in what the project actually is.
async function fetchRepoContext(repoUrl: string): Promise<string> {
  const m = repoUrl.match(/github\.com\/([^/]+)\/([^/#?]+)/)
  if (!m) return ''
  const owner = m[1]
  const repo = m[2].replace(/\.git$/, '')

  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  try {
    const [metaRes, readmeRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers }),
    ])

    let ctx = ''
    if (metaRes.ok) {
      const meta = await metaRes.json()
      if (meta.full_name) ctx += `Repository: ${meta.full_name}\n`
      if (meta.description) ctx += `Description: ${meta.description}\n`
      if (meta.language) ctx += `Primary language: ${meta.language}\n`
      if (Array.isArray(meta.topics) && meta.topics.length) ctx += `Topics: ${meta.topics.join(', ')}\n`
    }
    if (readmeRes.ok) {
      const readme = await readmeRes.json()
      const decoded = Buffer.from(readme.content || '', 'base64').toString('utf8')
      if (decoded.trim()) ctx += `\nREADME excerpt:\n${decoded.slice(0, 3000)}`
    }
    return ctx
  } catch {
    return ''
  }
}

// Extract the <svg>…</svg> block and strip anything unsafe. The SVG is only
// ever rendered via <img src>, which already can't execute scripts, but we
// remove scripts / event handlers / external refs as defense in depth.
function extractSafeSvg(text: string): string | null {
  const match = text.match(/<svg[\s\S]*?<\/svg>/i)
  if (!match) return null
  let svg = match[0]
  svg = svg.replace(/<script[\s\S]*?<\/script>/gi, '')
  svg = svg.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  svg = svg.replace(/(xlink:href|href)\s*=\s*("[^"]*"|'[^']*')/gi, (m) =>
    /data:image\//i.test(m) ? m : ''
  )
  if (!/xmlns=/.test(svg)) {
    svg = svg.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"')
  }
  return svg
}

export async function POST(request: NextRequest) {
  // --- Auth: only a logged-in admin may generate/upload ---
  const cookieStore = await cookies()
  const userClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(c) { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    }
  )
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server' }, { status: 500 })

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) return NextResponse.json({ error: 'Server upload key is not configured' }, { status: 500 })

  const { prompt, repoUrl } = (await request.json()) as { prompt?: string; repoUrl?: string }
  if (!prompt?.trim()) return NextResponse.json({ error: 'A prompt is required' }, { status: 400 })

  const repoContext = repoUrl?.trim() ? await fetchRepoContext(repoUrl.trim()) : ''

  const fullPrompt = [
    'You are a designer. Produce a single self-contained SVG thumbnail for a portfolio card.',
    'Output ONLY the raw SVG markup — no markdown fences, no explanation, no text before or after.',
    'Hard requirements:',
    '- Root element: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"> (strict 16:9).',
    '- First child must be a <rect> covering the whole canvas filled #ffffff (pure white background, edge to edge).',
    '- Flat, modern, minimal vector art (shapes, paths, gradients). No <script>, no external images, no <foreignObject>, no external fonts.',
    '- Keep any text minimal; if you draw text use a generic family like sans-serif.',
    '',
    `Creative direction: ${prompt.trim()}`,
    repoContext ? `\nProject context (inspiration only):\n${repoContext}` : '',
  ].join('\n')

  let geminiRes: Response
  try {
    geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }),
      }
    )
  } catch {
    return NextResponse.json({ error: 'Failed to reach Gemini' }, { status: 502 })
  }

  if (!geminiRes.ok) {
    const detail = await geminiRes.text()
    return NextResponse.json({ error: `Gemini error: ${detail.slice(0, 400)}` }, { status: 502 })
  }

  const data = await geminiRes.json()
  const parts: Array<{ text?: string }> = data?.candidates?.[0]?.content?.parts ?? []
  const rawText = parts.map((p) => p.text || '').join('')
  const svg = extractSafeSvg(rawText)
  if (!svg) {
    return NextResponse.json({ error: 'Gemini did not return a usable SVG' }, { status: 502 })
  }

  // --- Upload the generated SVG to the public "images" bucket ---
  const storageClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const filename = `ai-${Date.now()}-${Math.random().toString(36).slice(2)}.svg`
  const { error } = await storageClient.storage.from('images').upload(filename, Buffer.from(svg, 'utf8'), {
    contentType: 'image/svg+xml',
    upsert: false,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = storageClient.storage.from('images').getPublicUrl(filename)
  return NextResponse.json({ url: publicUrl })
}
