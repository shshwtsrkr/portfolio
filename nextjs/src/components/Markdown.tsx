import ReactMarkdown, { type Components } from 'react-markdown'
import type { ReactNode } from 'react'

/* Shared Markdown renderers so every text field on the site behaves the same: links are blue + underlined and
   open in a new tab when external. `Md` renders blocks (paragraphs, lists, code); `MdInline` renders a single
   line without a wrapping paragraph — for titles, subtitles, taglines and other one-liners. */
const link: Components['a'] = ({ href, children }) => (
  <a href={href} className="md-link" target={href?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{children}</a>
)

export function Md({ children, components }: { children: string; components?: Components }) {
  return <ReactMarkdown components={{ a: link, ...components }}>{children}</ReactMarkdown>
}

const inlineComponents: Components = { a: link, p: ({ children }: { children?: ReactNode }) => <>{children}</> }

export function MdInline({ children }: { children: string }) {
  return <ReactMarkdown components={inlineComponents} allowedElements={['p', 'a', 'em', 'strong', 'code', 'del', 'br']} unwrapDisallowed>{children}</ReactMarkdown>
}
