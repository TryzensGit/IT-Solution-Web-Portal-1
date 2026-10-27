import { ArrowRight } from 'lucide-react'
import { brand } from '../../config/brand'
import { Button } from '../ui/Button'
import { Reveal } from '../ui/Reveal'

export function FinalCta() {
  return (
    <section className="container-x py-16 sm:py-24">
      <Reveal className="relative overflow-hidden rounded-xl border border-line bg-surface px-6 py-12 text-center sm:px-12 sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            background:
              'radial-gradient(60% 80% at 50% 0%, var(--hero-glow-a), transparent 70%), radial-gradient(40% 60% at 80% 100%, var(--hero-glow-b), transparent 70%)',
          }}
          aria-hidden="true"
        />
        <div className="relative">
          <h2 className="text-balance text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] sm:text-[2.25rem]">
            {brand.tagline}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-[1.02rem] leading-relaxed text-muted">
            {brand.description}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/applications" size="lg">
              Open an application
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button to="/applications/tisa-assistant" size="lg" variant="secondary">
              Meet the AI assistant
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
