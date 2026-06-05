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
