import { useState, type CSSProperties } from 'react'
import { useReducedMotion } from 'framer-motion'
import {
  Calculator,
  Coffee,
  Cpu,
  DraftingCompass,
  Feather,
  Hexagon,
  Palette,
  Pause,
  PawPrint,
  Play,
  Scale,
  Sparkles,
  Stethoscope,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import {
  trustedCompanies,
  trustedHeading,
  trustedLead,
  type TrustedCompany,
  type TrustedIcon,
  type Wordmark,
} from '../../config/trusted'
import { Reveal } from '../ui/Reveal'

const icons: Record<TrustedIcon, LucideIcon> = {
  truck: Truck,
  stethoscope: Stethoscope,
  coffee: Coffee,
  sparkles: Sparkles,
  calculator: Calculator,
  feather: Feather,
  compass: DraftingCompass,
  cpu: Cpu,
  paw: PawPrint,
  scale: Scale,
  palette: Palette,
  hexagon: Hexagon,
}

const wordmarks: Record<Wordmark, string> = {
  caps: 'text-[0.78rem] font-semibold uppercase tracking-[0.16em]',
  tight: 'text-[1.02rem] font-bold tracking-[-0.03em]',
  light: 'text-[1rem] font-light tracking-[0.02em]',
  italic: 'text-[1rem] font-medium italic tracking-[-0.01em]',
}

/** Seconds per company, so the speed stays the same however many are listed. */
const SECONDS_PER_ITEM = 3.2

function Logo({ company }: { company: TrustedCompany }) {
  const Icon = icons[company.icon]
  return (
    <li
      className="flex items-center gap-2.5 whitespace-nowrap text-muted transition-colors duration-200 hover:text-text"
      title={company.sector}
    >
      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-line bg-surface">
        <Icon className="size-3.5" aria-hidden="true" />
      </span>
      <span className={wordmarks[company.wordmark]}>{company.name}</span>
      <span className="sr-only">, {company.sector}</span>
    </li>
  )
}

/**
 * Horizontal logo strip. Two copies of the list scroll by -50% to loop
 * seamlessly; the second copy is hidden from assistive technology. It pauses
 * on hover, on keyboard focus and via the toggle, and is laid out as a static
 * wrapping row when reduced motion is requested.
 */
export function TrustedBy() {
  const reduce = useReducedMotion()
  const [paused, setPaused] = useState(false)
  if (trustedCompanies.length === 0) return null

  const style = { '--marquee-duration': `${trustedCompanies.length * SECONDS_PER_ITEM}s` } as CSSProperties

  return (
    <section className="border-y border-line bg-elevated/40 py-10 sm:py-12" aria-labelledby="trusted-heading">
      <Reveal className="container-x flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
        <div className="shrink-0 lg:max-w-[15rem]">
          <h2 id="trusted-heading" className="text-sm font-semibold tracking-tight">
            {trustedHeading}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">{trustedLead}</p>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="marquee min-w-0 flex-1" data-paused={paused || undefined} style={style}>
            <div className="marquee-track">
              <ul aria-label="Customers">
                {trustedCompanies.map((c) => (
                  <Logo key={c.name} company={c} />
                ))}
              </ul>
              {!reduce && (
                <ul aria-hidden="true">
                  {trustedCompanies.map((c) => (
                    <Logo key={c.name} company={c} />
                  ))}
                </ul>
              )}
            </div>
          </div>

          {!reduce && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              aria-label={paused ? 'Resume logo scrolling' : 'Pause logo scrolling'}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:border-accent/60 hover:text-text"
            >
              {paused ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
            </button>
          )}
        </div>
      </Reveal>
    </section>
  )
}
