import { FiArrowUpRight } from 'react-icons/fi'
import { Md, MdInline } from '@/components/Markdown'
import { shortDate } from '@/lib/format'
import type { Project } from '@/types'

function Row({ project, index }: { project: Project; index: number }) {
  const links = [
    ...(project.show_code_button && project.github_url ? [{ label: 'Code', href: project.github_url }] : []),
    ...(project.show_live_demo_button && project.live_url ? [{ label: 'Live demo', href: project.live_url }] : []),
  ]
  return (
    <li className="bib-entry" style={{ '--i': index } as React.CSSProperties}>
      <div className="bib-abbr">
        {project.status && <span className="badge outline">{project.status}</span>}
        {project.completed_date && <span className="bib-date">{shortDate(project.completed_date)}</span>}
        {project.preview_image_url && <img className="bib-thumb" src={project.preview_image_url} alt="" loading="lazy" width={208} height={117} />}
      </div>
      <div className="bib-main">
        <div className="bib-title"><MdInline>{project.title}</MdInline></div>
        {project.technologies && <div className="bib-periodical mono-meta"><MdInline>{project.technologies}</MdInline></div>}
        {project.description && <div className="bib-desc prose"><Md>{project.description}</Md></div>}
        {links.length > 0 && <div className="bib-links">
          {links.map(link => <a key={link.label} className="btn" href={link.href} target="_blank" rel="noopener noreferrer">{link.label} <FiArrowUpRight aria-hidden="true" /></a>)}
        </div>}
      </div>
    </li>
  )
}

/* Projects in the same row layout as the bibliography: status column left, title / stack / description / links right. */
export default function ProjectList({ projects }: { projects: Project[] }) {
  return <ol className="bibliography">{projects.map((p, i) => <Row key={p.id} project={p} index={i} />)}</ol>
}
