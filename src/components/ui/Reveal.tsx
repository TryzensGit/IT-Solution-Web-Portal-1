import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import { revealVariants, staggerContainer, staticVariants } from '../../lib/motion'

type Props = HTMLMotionProps<'div'> & {
  /** Stagger children that are also Reveal items. */
  stagger?: number
  delay?: number
  as?: 'div' | 'section' | 'ul' | 'ol' | 'li'
}

/**
 * Scroll-triggered reveal used for whole sections, not individual
 * elements. Renders fully visible when reduced motion is preferred.
 */
export function Reveal({ stagger, delay = 0, as = 'div', children, ...rest }: Props) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  const variants = reduce ? staticVariants : stagger !== undefined ? staggerContainer(stagger, delay) : revealVariants
  return (
    <Tag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      variants={variants}
      {...(rest as object)}
    >
      {children}
    </Tag>
  )
}

export function RevealItem({ as = 'div', children, ...rest }: Omit<Props, 'stagger' | 'delay'>) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  return (
    <Tag variants={reduce ? staticVariants : revealVariants} {...(rest as object)}>
      {children}
    </Tag>
  )
}
