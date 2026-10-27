import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, ExternalLink, FlaskConical, LogOut, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '../../components/ui/ThemeToggle'
import { demoNotice } from '../../config/demo'
import type { DemoSession } from './session'
import { TabBar, type TabDef } from './ui'
import { initials } from './format'

/**
 * Application chrome shared by the demos: top bar with mark, tabs, status
 * area, theme toggle and user menu, a demo banner, and the content area.
 */
export function DemoShell({
  appName,
  appSub,
  mark,
  tabs,
  activeTab,
  onTabChange,
  session,
  onSignOut,
  onOpenSettings,
  status,
  actions,
  children,
}: {
  appName: string
  appSub: string
  mark: ReactNode
  tabs: TabDef[]
  activeTab: string
  onTabChange: (id: string) => void
  session: DemoSession
  onSignOut: () => void
  onOpenSettings?: () => void
  status?: ReactNode
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line bg-overlay backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-ai text-on-accent">
              {mark}
            </span>
            <div className="leading-tight">
              <p className="text-[0.95rem] font-semibold tracking-tight">{appName}</p>
              <p className="text-xs text-muted">{appSub}</p>
            </div>
          </div>
          <div className={`order-last w-full ${tabs.length <= 4 ? 'lg:order-none lg:w-auto lg:flex-1' : '2xl:order-none 2xl:w-auto 2xl:flex-1'}`}>
            <TabBar tabs={tabs} active={activeTab} onChange={onTabChange} />
          </div>
          <div className="ml-auto flex items-center gap-3">
            {status}
            {actions}
            <ThemeToggle />
            <UserMenu session={session} onSignOut={onSignOut} onOpenSettings={onOpenSettings} />
          </div>
        </div>
      </header>

      <div className="border-b border-line bg-ai-soft/60">
        <p className="mx-auto flex max-w-[1400px] items-center gap-2 px-4 py-1.5 text-xs text-muted sm:px-6">
          <FlaskConical className="size-3.5 shrink-0 text-ai" aria-hidden="true" />
          {demoNotice}
        </p>
      </div>

      <main id="main" className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  )
}

function UserMenu({ session, onSignOut, onOpenSettings }: { session: DemoSession; onSignOut: () => void; onOpenSettings?: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface pl-1.5 pr-2.5 text-sm font-medium hover:border-line-strong"
      >
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-accent-soft text-[0.65rem] font-semibold text-accent">
          {initials(session.name)}
        </span>
        <span className="hidden sm:inline">{session.name}</span>
        <ChevronDown className="size-3.5 text-muted" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="surface-card absolute right-0 z-50 mt-2 w-64 p-2 shadow-card-hover">
          <div className="px-2 py-1.5">
            <p className="text-sm font-semibold">{session.name}</p>
            <p className="text-xs text-muted">{session.username}@demo.example</p>
          </div>
          <dl className="grid grid-cols-2 gap-2 px-2 py-2 text-xs">
            <div>
              <dt className="text-faint">Role</dt>
              <dd className="font-medium">{session.role === 'admin' ? 'Administrator' : 'User'}</dd>
            </div>
            <div>
              <dt className="text-faint">Signed in via</dt>
              <dd className="font-medium">Demo account</dd>
            </div>
          </dl>
          <div className="my-1 h-px bg-line" />
          {onOpenSettings && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onOpenSettings()
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-elevated"
            >
              <Settings className="size-4 text-muted" aria-hidden="true" />
              Settings
            </button>
          )}
          <Link to="/" role="menuitem" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-elevated">
            <ExternalLink className="size-4 text-muted" aria-hidden="true" />
            Back to portal
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={onSignOut}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-elevated"
          >
            <LogOut className="size-4 text-muted" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
