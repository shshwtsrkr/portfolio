import { Md, MdInline } from '@/components/Markdown'
import { shortDate } from '@/lib/format'
import type { Experience } from '@/types'

/* CV-style rows: dates in a mono column on the left, role @ company and description on the right. */
export default function ExperienceList({ experiences, compact }: { experiences: Experience[]; compact?: boolean }) {
  return (
    <div className="work-list">
      {experiences.map((exp, i) => {
        const current = exp.is_current || !exp.end_date
        return (
          <div key={exp.id} className={`work-item${compact ? ' compact' : ''}`} style={{ '--i': i } as React.CSSProperties}>
            <div className="work-dates">
              {shortDate(exp.start_date)} – {current ? 'Present' : shortDate(exp.end_date)}
              {current && !compact && <><br /><span className="current">Current</span></>}
            </div>
            <div>
              <h3 className="work-position"><span className="work-role"><MdInline>{exp.role}</MdInline></span> <span className="work-company">@ <MdInline>{exp.company}</MdInline></span></h3>
              {!compact && exp.description && <div className="work-desc prose"><Md>{exp.description}</Md></div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
