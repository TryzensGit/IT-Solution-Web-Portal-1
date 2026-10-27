import { capabilities } from '../../config/content'
import { AppIcon } from '../ui/AppIcon'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal, RevealItem } from '../ui/Reveal'

export function CapabilitiesSection() {
  return (
    <section className="container-x py-16 sm:py-20" aria-labelledby="capabilities">
      <Reveal>
        <SectionHeading
          id="capabilities"
          title="Automation that respects how IT actually works"
          lead="Speed matters, but so does control. The portal and the services behind it are designed around a few principles."
        />
      </Reveal>
      <Reveal as="ul" stagger={0.07} className="grid gap-5 sm:grid-cols-2">
        {capabilities.map((c) => (
          <RevealItem as="li" key={c.title} className="surface-card flex gap-4 p-6">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <AppIcon name={c.icon} className="size-5" />
            </span>
            <div>
              <h3 className="font-semibold tracking-tight">{c.title}</h3>
              <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{c.description}</p>
            </div>
          </RevealItem>
        ))}
      </Reveal>
    </section>
  )
}
