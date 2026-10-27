import type { ReactNode } from 'react'

interface Props {
  id?: string
  title: string
  lead?: ReactNode
  /** Right-hand slot on wide screens, e.g. a link. */
  aside?: ReactNode
  align?: 'left' | 'center'
  as?: 'h1' | 'h2'
}

export function SectionHeading({ id, title, lead, aside, align = 'left', as: Tag = 'h2' }: Props) {
  const centered = align === 'center'
  return (
    <div
      className={`mb-10 flex flex-col gap-4 sm:mb-12 ${centered ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'}`}
    >
      <div className={`max-w-2xl ${centered ? 'mx-auto' : ''}`}>
        <Tag id={id} className="text-balance text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] sm:text-[2.1rem]">
          {title}
        </Tag>
        {lead && <p className="mt-3 text-pretty text-[1.02rem] leading-relaxed text-muted">{lead}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  )
}
