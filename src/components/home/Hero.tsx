import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { HeroVisual } from './HeroVisual'
import { easing, staticVariants } from '../../lib/motion'

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.46, ease: easing } },
}

const visual: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: easing } },
}

export function Hero() {
  const reduce = useReducedMotion()
  const v = (variants: Variants) => (reduce ? staticVariants : variants)

  return (
    <section className="relative overflow-hidden">
      {/* Background: restrained grid fading toward the centre */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(var(--c-border) 1px, transparent 1px), linear-gradient(90deg, var(--c-border) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      <motion.div
        className="container-x grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-28"
        variants={v(container)}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-xl">
          <motion.h1
            variants={v(item)}
            className="text-balance text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[3.25rem] lg:text-[3.75rem]"
          >
            Intelligent IT.
            <br />
            Simplified.
          </motion.h1>
          <motion.p variants={v(item)} className="mt-6 max-w-lg text-pretty text-[1.08rem] leading-relaxed text-muted">
            Discover AI-powered IT solutions that streamline operations, simplify management, and make support more
            intelligent.
          </motion.p>
          <motion.div variants={v(item)} className="mt-8 flex flex-wrap items-center gap-3">
            <Button to="/#solutions" size="lg">
              Explore solutions
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button to="/#applications" size="lg" variant="secondary">
              View applications
            </Button>
          </motion.div>
        </div>

        <motion.div variants={v(visual)} className="hidden sm:block">
          <HeroVisual />
        </motion.div>
      </motion.div>
    </section>
  )
}
