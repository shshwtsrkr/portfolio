import Image from 'next/image'
import { MdCode, MdOpenInNew, MdOutlineLaunch } from 'react-icons/md'
import { Md, MdInline } from '@/components/Markdown'
import { shortDate } from '@/lib/format'
import type { Project } from '@/types'

const tags = (s?: string) => (s || '').split(/\s*[,·|]\s*/).map(t => t.trim()).filter(Boolean)

/* Projects share the bibliography's rhythm: optional preview, then date, title, stack, description, links. */
export default function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <ol className="pub-list">
      {projects.map(project => {
        const links = [
          ...(project.show_code_button && project.github_url ? [{ label: 'Code', href: project.github_url, icon: MdCode }] : []),
          ...(project.show_live_demo_button && project.live_url ? [{ label: 'Live demo', href: project.live_url, icon: MdOutlineLaunch }] : []),
        ]
        const status = project.status && !/^completed$/i.test(project.status) ? project.status : ''
        return (
          <li key={project.id} id={`proj-${project.id}`} data-work={`proj-${project.id}`} className={`pub md-card${project.preview_image_url ? ' has-fig' : ''}`}>
            {project.preview_image_url && (
              <div className="pub-fig is-static"><Image src={project.preview_image_url} alt="" width={360} height={220} sizes="(max-width: 720px) 100vw, 180px" /></div>
            )}
            <div className="pub-body">
              <p className="pub-venue">
                {project.completed_date && <span>{shortDate(project.completed_date)}</span>}
                {status && <span className="pub-status">{status}</span>}
              </p>
              <h3 className="pub-title"><MdInline>{project.title}</MdInline></h3>
              {project.technologies && <ul className="chip-set small" aria-label="Stack">{tags(project.technologies).map(t => <li key={t} className="md-chip static">{t}</li>)}</ul>}
              {project.description && <div className="pub-desc prose"><Md>{project.description}</Md></div>}
              {links.length > 0 && <div className="pub-links">
                {links.map((link, i) => { const Icon = link.icon; return <a key={link.label} className={`md-btn ${i === 0 ? 'tonal' : 'outlined'} ripple`} href={link.href} target="_blank" rel="noopener noreferrer"><Icon size={18} aria-hidden="true" />{link.label}<MdOpenInNew className="trail" size={14} aria-hidden="true" /></a> })}
              </div>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
