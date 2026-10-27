import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { applications } from '../../config/applications'
import { ApplicationGrid } from './ApplicationGrid'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal } from '../ui/Reveal'

export function LauncherSection() {
  return (
    <section className="container-x py-16 sm:py-20" aria-labelledby="applications">
      <Reveal>
        <SectionHeading
          id="applications"
          title="Your applications"
          lead="Open the tools your team already uses. Each one runs in its own application with its own sign-in."
          aside={
            <Link
              to="/applications"
              className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-accent hover:text-accent-strong"
            >
              All applications
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          }
        />
      </Reveal>
      <ApplicationGrid apps={applications} aria-label="Applications" />
    </section>
  )
}
