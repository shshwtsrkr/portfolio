// Shared formatting helpers

import type { EmptyMessages, SectionLabels } from '@/types'

/** Parse profile.empty_messages (JSON string or object) into a typed object. */
export function parseEmptyMessages(v: unknown): EmptyMessages {
  if (v && typeof v === 'object') return v as EmptyMessages
  if (typeof v === 'string') { try { return JSON.parse(v) } catch { return {} } }
  return {}
}

/** Parse profile.section_labels (JSON string or object) into a typed object. */
export function parseSectionLabels(v: unknown): SectionLabels {
  if (v && typeof v === 'object') return v as SectionLabels
  if (typeof v === 'string') { try { return JSON.parse(v) } catch { return {} } }
  return {}
}

/** "01 entry" / "02 entries" — zero-padded count with correct pluralization. */
export function entryCount(n: number): string {
  return `${n.toString().padStart(2, '0')} ${n === 1 ? 'entry' : 'entries'}`
}

/** Generic singular/plural with zero-pad. */
export function pluralize(n: number, singular: string, plural = singular + 's'): string {
  return `${n} ${n === 1 ? singular : plural}`
}

// Status accent colors — all tuned to the same muted intensity as Claude orange
// so green/blue read as siblings of the orange, not neon.
export const STATUS_COLORS: Record<string, string> = {
  Accepted: '#7DA46B',          // muted green
  Submitted: '#D97757',         // claude orange
  'Under Review': '#6E92C4',    // muted blue
  'Under Preparation': '#A89A86', // warm gray
  Completed: '#7DA46B',         // (projects) muted green
  'Active Development': '#D97757',
  'On Hold': '#A89A86',
  Archived: '#A89A86',
}

export function statusColor(status?: string | null): string {
  if (!status) return '#A89A86'
  return STATUS_COLORS[status] ?? '#A89A86'
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

/** "2024-11-20" -> "nov 2024" */
export function monthYear(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d.getTime())) return dateStr
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

const ABBR_STOPWORDS = new Set(['on', 'of', 'the', 'and', 'in', 'for', 'to', 'a', 'an', 'at', 'with', 'from', 'by', 'international', 'conference', 'journal', 'proceedings', 'workshop', 'transactions', 'annual', 'ieee', 'acm', 'cvf'])

/** Well-known venues: short pill label -> full name shown in the italic "In …" line. */
const KNOWN_VENUES: Record<string, [abbr: string, full: string]> = {
  icpr: ['ICPR', 'International Conference on Pattern Recognition'],
  icdar: ['ICDAR', 'International Conference on Document Analysis and Recognition'],
  'icdar wml': ['ICDAR WML', 'ICDAR Workshop on Machine Learning'],
  eaai: ['EAAI', 'Engineering Applications of Artificial Intelligence'],
  sncs: ['SNCS', 'SN Computer Science'],
  'sn computer science': ['SNCS', 'SN Computer Science'],
  cvpr: ['CVPR', 'IEEE/CVF Conference on Computer Vision and Pattern Recognition'],
  iccv: ['ICCV', 'IEEE/CVF International Conference on Computer Vision'],
  eccv: ['ECCV', 'European Conference on Computer Vision'],
  wacv: ['WACV', 'IEEE/CVF Winter Conference on Applications of Computer Vision'],
  bmvc: ['BMVC', 'British Machine Vision Conference'],
  neurips: ['NeurIPS', 'Conference on Neural Information Processing Systems'],
  nips: ['NeurIPS', 'Conference on Neural Information Processing Systems'],
  icml: ['ICML', 'International Conference on Machine Learning'],
  iclr: ['ICLR', 'International Conference on Learning Representations'],
  aaai: ['AAAI', 'AAAI Conference on Artificial Intelligence'],
  ijcai: ['IJCAI', 'International Joint Conference on Artificial Intelligence'],
  acl: ['ACL', 'Annual Meeting of the Association for Computational Linguistics'],
  emnlp: ['EMNLP', 'Conference on Empirical Methods in Natural Language Processing'],
  naacl: ['NAACL', 'Conference of the North American Chapter of the ACL'],
  miccai: ['MICCAI', 'International Conference on Medical Image Computing and Computer Assisted Intervention'],
  kdd: ['KDD', 'ACM SIGKDD Conference on Knowledge Discovery and Data Mining'],
  tpami: ['TPAMI', 'IEEE Transactions on Pattern Analysis and Machine Intelligence'],
  tip: ['TIP', 'IEEE Transactions on Image Processing'],
  tmi: ['TMI', 'IEEE Transactions on Medical Imaging'],
  icip: ['ICIP', 'IEEE International Conference on Image Processing'],
  icassp: ['ICASSP', 'IEEE International Conference on Acoustics, Speech and Signal Processing'],
  interspeech: ['Interspeech', 'Interspeech'],
}

/** "ICPR 2024" -> "ICPR": drop years, ordinals, and stray punctuation so the year isn't repeated. */
function stripYear(venue: string): string {
  return venue.replace(/\b(19|20)\d{2}\b/g, '').replace(/\b\d{1,3}(st|nd|rd|th)\b/gi, '').replace(/\(\s*\)/g, '').replace(/[\-–—,]+\s*$/g, '').replace(/\s{2,}/g, ' ').trim()
}

function knownVenue(venue: string) {
  const key = stripYear(venue).toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
  return KNOWN_VENUES[key] ?? Object.values(KNOWN_VENUES).find(([, full]) => full.toLowerCase() === key)
}

/** Short venue label for a bibliography badge: known venues map directly, "ICLR" stays, long names collapse to
 *  initials — where an all-caps word (SN, IEEE) contributes whole, so "SN Computer Science" -> "SNCS". */
export function venueAbbr(venue?: string | null): string {
  if (!venue) return '—'
  const known = knownVenue(venue)
  if (known) return known[0]
  const v = stripYear(venue)
  const paren = v.match(/\(([A-Za-z0-9-]{2,10})\)/)
  if (paren) return paren[1].toUpperCase()
  if (v.length <= 9) return v.toUpperCase()
  const initials = v.split(/[\s/]+/).filter(w => w && !ABBR_STOPWORDS.has(w.toLowerCase().replace(/[^a-z]/g, ''))).map(w => /^[A-Z0-9]{2,}$/.test(w) ? w : w[0]).join('')
  return (initials.length >= 2 ? initials : v.slice(0, 6)).toUpperCase()
}

/** Full venue name for the italic line: known abbreviations expand, and the year is removed (it's shown separately). */
export function venueName(venue?: string | null): string {
  if (!venue) return ''
  const known = knownVenue(venue)
  return known ? known[1] : stripYear(venue)
}

/** "2024-11-20" -> "Nov 2024"; unparsable input is returned unchanged. */
export function shortDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr.length <= 10 ? dateStr + 'T00:00:00' : dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

/** Split an author string so the site owner's name can be marked up. Matches the full name and "S. Sarkar" /
 *  "Sarkar, S." style abbreviations, case-insensitively. */
export function markAuthor(authors: string, name: string): Array<{ text: string; me: boolean }> {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return [{ text: authors, me: false }]
  const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const first = parts[0], last = parts[parts.length - 1]
  const patterns = [esc(name.trim())]
  if (parts.length > 1) patterns.push(`${esc(first[0])}\\.?\\s*${esc(last)}`, `${esc(last)},?\\s*${esc(first[0])}\\.?(?=[\\s,;]|$)`)
  const re = new RegExp(`(${patterns.join('|')})`, 'gi')
  return authors.split(re).filter(Boolean).map(text => ({ text, me: re.test(text) && (re.lastIndex = 0) === 0 }))
}

const fold = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

/* Every word of the query has to appear somewhere in the entry's fields (any field, any order). */
export function matches(query: string, ...fields: Array<string | number | null | undefined>) {
  const terms = fold(query).split(/\s+/).filter(Boolean)
  if (!terms.length) return true
  const hay = fold(fields.filter(v => v !== null && v !== undefined && v !== '').join(' '))
  return terms.every(t => hay.includes(t))
}


/** Cache-busting resume link: /api/resume is cached for an hour, so the URL carries a hash of the source link —
 *  change the link in the admin and every browser/CDN sees a brand-new URL immediately. */
export function resumeHref(resumeUrl?: string | null): string | null {
  if (!resumeUrl) return null
  let h = 5381
  for (const ch of resumeUrl) h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0
  return `/api/resume?v=${h.toString(36)}`
}
