import type { AppDefinition } from '../../config/applications'
import { ApplicationCard } from './ApplicationCard'
import { Reveal, RevealItem } from '../ui/Reveal'

interface Props {
  apps: AppDefinition[]
  'aria-label'?: string
}

/** Three columns on desktop, two on tablet, one on mobile. */
export function ApplicationGrid({ apps, ...rest }: Props) {
  return (
    <Reveal as="ul" stagger={0.08} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" {...rest}>
      {apps.map((app) => (
        <RevealItem as="li" key={app.id} className="h-full">
          <ApplicationCard app={app} />
        </RevealItem>
      ))}
    </Reveal>
  )
}
