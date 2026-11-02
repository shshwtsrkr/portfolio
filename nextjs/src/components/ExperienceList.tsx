import { Md, MdInline } from '@/components/Markdown'
import { shortDate } from '@/lib/format'
import type { Experience } from '@/types'

const isCurrent = (e: Experience) => !!e.is_current || !e.end_date
const range = (e: Experience) => `${shortDate(e.start_date)} – ${isCurrent(e) ? 'now' : shortDate(e.end_date)}`
const companyKey = (c: string) => c.trim().toLowerCase()

/* Roles at the same company are one card, so a promotion reads as a career at one place rather than
   two jobs. Cards keep the admin's order (by each company's first entry); roles inside run newest first. */
function groupByCompany(experiences: Experience[]): Experience[][] {
  const groups = new Map<string, Experience[]>()
  for (const e of experiences) {
    const k = companyKey(e.company)
    groups.set(k, [...(groups.get(k) ?? []), e])
  }
  return [...groups.values()].map(g => g.sort((a, b) => (b.start_date || '').localeCompare(a.start_date || '')))
}

/* CV rows: dates in a narrow left column, role then organisation, then what was done. */
export default function ExperienceList({ experiences }: { experiences: Experience[] }) {
  return (
    <ol className="cv-list">
      {groupByCompany(experiences).map(roles => {
        const [latest] = roles
        const first = roles[roles.length - 1]
        const current = isCurrent(latest)
        const now = current && <span className="cv-now"><i aria-hidden="true" />Current</span>

        if (roles.length === 1) return (
          <li key={latest.id} className="cv-item md-card">
            <p className="cv-dates"><span>{range(latest)}</span></p>
            <div>
              <h3 className="cv-role"><MdInline>{latest.role}</MdInline></h3>
              <p className="cv-org"><MdInline>{latest.company}</MdInline>{now}</p>
              {latest.description && <div className="cv-desc prose"><Md>{latest.description}</Md></div>}
            </div>
          </li>
        )

        // Several roles at one company: the company heads the card and each role is a stage on a rail.
        return (
          <li key={latest.id} className="cv-item md-card">
            <p className="cv-dates"><span>{shortDate(first.start_date)} – {current ? 'now' : shortDate(latest.end_date)}</span></p>
            <div>
              <h3 className="cv-role"><MdInline>{latest.company}</MdInline></h3>
              <ol className="cv-stages">
                {roles.map((r, i) => (
                  <li key={r.id} className="cv-stage" data-latest={i === 0 || undefined}>
                    <p className="cv-stage-role"><MdInline>{r.role}</MdInline>{i === 0 && now}</p>
                    <p className="cv-stage-dates">{range(r)}</p>
                    {r.description && <div className="cv-desc prose"><Md>{r.description}</Md></div>}
                  </li>
                ))}
              </ol>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
