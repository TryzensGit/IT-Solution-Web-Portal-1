import { howItWorks } from '../../config/content'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal, RevealItem } from '../ui/Reveal'

export function HowItWorks() {
  return (
    <section className="border-y border-line bg-surface" aria-labelledby="how-it-works">
      <div className="container-x py-16 sm:py-20">
        <Reveal>
          <SectionHeading id="how-it-works" title="How it works" lead="Three steps from a question to a resolved request." />
        </Reveal>
        <Reveal as="ol" stagger={0.1} className="grid gap-6 md:grid-cols-3">
          {howItWorks.map((step, i) => (
            <RevealItem as="li" key={step.title} className="relative flex gap-4 md:flex-col md:gap-5">
              <div className="flex items-center gap-3 md:w-full">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-accent/50 bg-accent-soft text-sm font-semibold text-accent">
                  {i + 1}
                </span>
                <span className="hidden h-px flex-1 bg-line md:block" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{step.description}</p>
              </div>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
