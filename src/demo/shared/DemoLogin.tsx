import { useState, type FormEvent, type ReactNode } from 'react'
import { ArrowLeft, KeyRound, LogIn, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ThemeToggle } from '../../components/ui/ThemeToggle'
import { demoNotice } from '../../config/demo'
import { Field, Input, Notice } from './ui'

/**
 * Sign-in page for a demo application. Deliberately carries no company
 * logo: just a neutral mark and the application name, the way the real
 * login pages look before an organisation uploads branding.
 */
export function DemoLogin({
  appId,
  appName,
  appSub,
  mark,
  onSignIn,
}: {
  appId: string
  appName: string
  appSub: string
  mark: ReactNode
  onSignIn: (username: string, password: string) => boolean
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ssoNote, setSsoNote] = useState(false)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (onSignIn(username, password)) return
    setError('Invalid username or password.')
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-canvas px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(40% 40% at 12% 18%, var(--hero-glow-a), transparent 65%), radial-gradient(36% 36% at 88% 82%, var(--hero-glow-b), transparent 65%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(var(--c-border) 1px, transparent 1px), linear-gradient(90deg, var(--c-border) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
        <Link to="/" className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted hover:text-text">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to portal
        </Link>
      </div>
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <main className="surface-card relative w-full max-w-sm p-7 sm:p-8">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-ai text-on-accent shadow-glow">
          {mark}
        </div>
        <h1 className="mt-4 text-center text-lg font-semibold tracking-tight">{appName}</h1>
        <p className="mt-0.5 text-center text-sm text-muted">{appSub}</p>

        <form onSubmit={submit} className="mt-6 space-y-4" autoComplete="off">
          <Field label="Username">
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden="true" />
              <Input
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                autoFocus
                className="pl-9"
              />
            </div>
          </Field>
          <Field label="Password">
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden="true" />
              <Input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="pl-9"
              />
            </div>
          </Field>
          {error && (
            <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full">
            <LogIn className="size-4" aria-hidden="true" />
            Sign in
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.12em] text-faint">
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
          or
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
        </div>

        <Button variant="secondary" className="w-full" onClick={() => setSsoNote(true)} aria-describedby="sso-note">
          <MicrosoftMark />
          Sign in with Microsoft
        </Button>
        <div id="sso-note" role="status" className="mt-3">
          {ssoNote && <Notice tone="neutral">Microsoft sign-in is not available in the demo. Use the demo accounts instead.</Notice>}
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-faint">
          Demo accounts are listed on the{' '}
          <Link to={`/applications/${appId}`} className="font-medium text-muted underline-offset-2 hover:text-text hover:underline">
            application page
          </Link>
          . {demoNotice}
        </p>
      </main>
    </div>
  )
}

function MicrosoftMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  )
}
