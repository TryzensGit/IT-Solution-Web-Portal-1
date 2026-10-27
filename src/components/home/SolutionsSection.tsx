import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { solutions } from '../../config/content'
import { AppIcon } from '../ui/AppIcon'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal, RevealItem } from '../ui/Reveal'

interface Props {
  /** Show all solutions, or the first few with a link to the rest. */
  compact?: boolean
  headingLevel?: 'h1' | 'h2'
}

export function SolutionsSection({ compact = false, headingLevel = 'h2' }: Props) {
  const items = compact ? solutions.slice(0, 6) : solutions

  return (
    <section className="border-y border-line bg-surface" aria-labelledby="solutions">
      <div className="container-x py-16 sm:py-20">
        <Reveal>
          <SectionHeading
            id="solutions"
            as={headingLevel}
            title="AI-driven IT, in practical pieces"
            lead="Six areas where intelligent automation takes the routine out of IT work. These are the services we build around; the applications above are where they show up today."
            aside={
              compact ? (
                <Link
                  to="/solutions"
                  className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-accent hover:text-accent-strong"
                >
                  About our solutions
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              ) : undefined
            }
          />
        </Reveal>

        <Reveal as="ul" stagger={0.06} className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <RevealItem as="li" key={s.id} className="group flex gap-4">
              <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas text-ai">
                <AppIcon name={s.icon} className="size-5" />
              </span>
              <div>
                <h3 className="text-[1.02rem] font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{s.description}</p>
              </div>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
