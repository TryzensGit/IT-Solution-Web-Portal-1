import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { brand } from '../../config/brand'
import { BrandMark } from '../ui/BrandMark'
import { Button } from '../ui/Button'
import { ThemeToggle } from '../ui/ThemeToggle'
import { durations, easing } from '../../lib/motion'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/solutions', label: 'Solutions' },
  { to: '/applications', label: 'Applications', end: true },
  { to: '/applications/tisa-assistant', label: 'AI Assistant' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const reduce = useReducedMotion()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  // Close the menu after navigation.
  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.hash])

  // Escape closes the menu and returns focus to the toggle.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    firstLinkRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-overlay backdrop-blur-md supports-[backdrop-filter]:bg-overlay">
      <nav className="container-x flex h-16 items-center justify-between gap-4" aria-label="Primary">
        <Link to="/" className="flex items-center gap-2.5 rounded-md" aria-label={`${brand.fullName} home`}>
          <BrandMark />
          <span className="text-[0.95rem] font-semibold tracking-tight">{brand.name}</span>
          <span className="hidden whitespace-nowrap text-[0.95rem] text-muted lg:inline">Intelligent IT Solutions</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="link-nav whitespace-nowrap">
              {l.label}
            </NavLink>
          ))}
          <Link to="/#contact" className="link-nav whitespace-nowrap">
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden lg:block">
            <Button to="/applications">Open an application</Button>
          </div>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:text-text md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={reduce ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduce ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
            transition={{ duration: durations.menu, ease: easing }}
            className="overflow-hidden border-t border-line bg-surface md:hidden"
          >
            <div className="container-x flex flex-col gap-1 py-3">
              {links.map((l, i) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  ref={i === 0 ? firstLinkRef : undefined}
                  className="link-nav py-3 text-base"
                >
                  {l.label}
                </NavLink>
              ))}
              <Link to="/#contact" className="link-nav py-3 text-base">
                Contact
              </Link>
              <Button to="/applications" size="lg" className="mt-2">
                Open an application
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
