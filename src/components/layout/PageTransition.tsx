import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { pageTransition, pageVariants, staticVariants } from '../../lib/motion'

/** Wraps each route element with a short fade-and-rise entrance. */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <motion.main
      id="main"
      variants={reduce ? staticVariants : pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      transition={pageTransition}
      className="flex-1"
    >
      {children}
    </motion.main>
  )
}
