import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap select-none ' +
  'transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-[var(--ease-standard)] ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

/**
 * Press feedback. Kept separate because a transform turns the element into
 * the containing block for its own pseudo-elements, which breaks links that
 * are stretched over a card with an absolutely positioned ::after.
 */
const press = 'active:scale-[0.98] disabled:active:scale-100'

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-on-accent shadow-[0_1px_0_rgba(255,255,255,0.12)_inset] hover:bg-accent-strong hover:shadow-glow',
  secondary:
    'border border-line-strong bg-surface text-text hover:border-accent/60 hover:bg-elevated',
  ghost: 'text-muted hover:text-text hover:bg-accent-soft',
}

const sizes: Record<Size, string> = {
  md: 'h-10 px-4 text-[0.9rem]',
  lg: 'h-11 px-5 text-[0.95rem]',
}

export function buttonClasses(
  variant: Variant = 'primary',
  size: Size = 'md',
  extra = '',
  options: { press?: boolean } = {},
) {
  const { press: withPress = true } = options
  return `${base} ${withPress ? press : ''} ${variants[variant]} ${sizes[size]} ${extra}`.replace(/\s+/g, ' ').trim()
}

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined }
type LinkProps = CommonProps & { to: string; href?: undefined } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>
type AnchorProps = CommonProps & { href: string; to?: undefined } & AnchorHTMLAttributes<HTMLAnchorElement>

export type Props = ButtonProps | LinkProps | AnchorProps

/**
 * One button component for the three kinds of action in the portal:
 * a router link (`to`), an external anchor (`href`), or a plain button.
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, Props>(function Button(props, ref) {
  const { variant = 'primary', size = 'md', className = '', children } = props
  const cls = buttonClasses(variant, size, className)

  if ('to' in props && props.to !== undefined) {
    const { to, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props
    return (
      <Link ref={ref as React.Ref<HTMLAnchorElement>} to={to} className={cls} {...rest}>
        {children}
      </Link>
    )
  }
  if ('href' in props && props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={cls} {...rest}>
        {children}
      </a>
    )
  }
  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as ButtonProps
  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} type="button" className={cls} {...rest}>
      {children}
    </button>
  )
})
