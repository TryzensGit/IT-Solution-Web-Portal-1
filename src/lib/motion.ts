import type { Transition, Variants } from 'framer-motion'

/** Shared motion vocabulary. Durations follow the brief's guidance. */
export const easing = [0.2, 0, 0, 1] as const

export const durations = {
  press: 0.14,
  hover: 0.22,
  menu: 0.2,
  page: 0.24,
  section: 0.42,
} as const

export const pageTransition: Transition = { duration: durations.page, ease: easing }

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6, transition: { duration: 0.16, ease: easing } },
}

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: durations.section, ease: easing } },
}

export const staggerContainer = (stagger = 0.07, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
})

/** Used when the visitor prefers reduced motion: everything is simply visible. */
export const staticVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
  initial: { opacity: 1, y: 0 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 1, y: 0 },
}
