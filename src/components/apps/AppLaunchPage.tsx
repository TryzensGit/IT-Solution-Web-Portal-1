import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ExternalLink, FlaskConical, Info, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCategory, type AppDefinition } from '../../config/applications'
import { demoCredentials, demoNotice } from '../../config/demo'
import { resolveLaunch, useLaunchFeedback } from '../../lib/launch'
import { AppIcon } from '../ui/AppIcon'
import { Button } from '../ui/Button'
import { StatusBadge } from '../ui/StatusBadge'
import { Reveal } from '../ui/Reveal'
import { AppVisual } from './AppVisual'

/**
 * Overview and launch page for one catalog entry. Driven entirely by
 * configuration, so a new application gets this page for free.
 */
export function AppLaunchPage({ app }: { app: AppDefinition }) {
  const launch = resolveLaunch(app)
  const { state, onLaunch } = useLaunchFeedback(app)
  const [showMessage, setShowMessage] = useState(false)
  const launching = state === 'launching'
  const category = getCategory(app.category)

  return (
    <div className="container-x py-10 sm:py-14">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted transition-colors hover:text-text"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to portal
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex size-12 items-center justify-center rounded-lg border border-line bg-accent-soft text-accent">
              <AppIcon name={app.icon} className="size-6" />
            </span>
            <span className="text-sm font-medium text-faint">{category.label}</span>
            {app.status && <StatusBadge status={app.status} />}
          </div>

          <h1 className="mt-6 text-balance text-[2.1rem] font-semibold leading-tight tracking-[-0.025em] sm:text-[2.75rem]">
            {app.name}
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-[1.05rem] leading-relaxed text-muted">{app.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {launch.href ? (
              launch.external ? (
                <Button href={launch.href} size="lg" target="_blank" rel="noopener noreferrer" onClick={onLaunch}>
                  <LaunchLabel app={app} launching={launching} />
                </Button>
              ) : (
                <Button to={launch.href} size="lg" onClick={onLaunch}>
                  <LaunchLabel app={app} launching={launching} />
                </Button>
              )
            ) : (
              <Button
                size="lg"
                variant="secondary"
                aria-expanded={showMessage}
                aria-controls="launch-message"
                onClick={() => setShowMessage((v) => !v)}
              >
                <Info className="size-4" aria-hidden="true" />
                {launch.blocked === 'coming-soon' ? 'Not yet available' : 'Destination not configured'}
              </Button>
            )}
            {app.launchNote && launch.href && (
              <span className="inline-flex items-center gap-1.5 text-sm text-faint">
                {launch.external ? <ExternalLink className="size-3.5" aria-hidden="true" /> : <FlaskConical className="size-3.5" aria-hidden="true" />}
                {app.demo.signIn ? 'Sample data only. Sign in with the demo accounts listed on this page.' : app.launchNote}
              </span>
            )}
          </div>

          <div id="launch-message" role="status" aria-live="polite">
            {showMessage && launch.message && (
              <p className="mt-4 max-w-xl rounded-md border border-line bg-surface p-4 text-sm leading-relaxed text-muted">
                {launch.message}
              </p>
            )}
          </div>

          {app.status === 'maintenance' && (
            <p className="mt-4 max-w-xl rounded-md border border-warning/40 bg-surface p-4 text-sm leading-relaxed text-muted">
              {app.name} is under maintenance. You can still open it, but some features may be unavailable.
            </p>
          )}

          <h2 className="mt-12 text-lg font-semibold tracking-tight">What you can do</h2>
          <ul className="mt-4 space-y-4">
            {app.capabilities.map((c) => (
              <li key={c.title} className="flex gap-3">
                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-ai-soft text-ai">
                  <Check className="size-3" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="mt-0.5 text-[0.95rem] leading-relaxed text-muted">{c.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <Reveal className="lg:pt-6">
            <AppVisual app={app} />
            {app.icon === 'bot' && (
              <p className="mt-4 text-sm leading-relaxed text-muted">
                This page is an overview. The launch button opens a simulated chat; the real assistant runs inside
                Microsoft Teams.
              </p>
            )}
          </Reveal>
          <DemoCard app={app} />
        </div>
      </div>
    </div>
  )
}

function LaunchLabel({ app, launching }: { app: AppDefinition; launching: boolean }) {
  if (launching) {
    return (
      <>
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Opening
      </>
    )
  }
  return (
    <>
      {app.launchLabel}
      <ArrowRight className="size-4" aria-hidden="true" />
    </>
  )
}

/** Explains the demo environment and, where the demo has a sign-in, lists the public demo accounts. */
function DemoCard({ app }: { app: AppDefinition }) {
  return (
    <Reveal>
      <section className="surface-card p-5 sm:p-6" aria-labelledby={`demo-${app.id}`}>
        <div className="flex items-start gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-ai-soft text-ai">
            <FlaskConical className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 id={`demo-${app.id}`} className="text-base font-semibold tracking-tight">
              Try {app.name} in a demo
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{app.demo.summary}</p>
          </div>
        </div>

        {app.demo.signIn ? (
          <>
            <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-faint">Demo accounts</h3>
            <ul className="mt-2 divide-y divide-line rounded-md border border-line">
              {demoCredentials.map((c) => (
            <li key={c.role} className="grid gap-x-4 gap-y-1 p-3 text-sm sm:grid-cols-[7.5rem_1fr]">
              <span className="font-medium">{c.label}</span>
              <span className="space-y-1">
                <span className="flex flex-wrap gap-x-4 gap-y-1">
                  <span>
                    <span className="text-faint">Username </span>
                    <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[0.8rem]">{c.username}</code>
                  </span>
                  <span>
                    <span className="text-faint">Password </span>
                    <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[0.8rem]">{c.password}</code>
                  </span>
                </span>
                <span className="block text-xs leading-relaxed text-muted">{c.access}</span>
              </span>
            </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted">No sign-in is needed. The chat opens straight away.</p>
        )}

        <p className="mt-4 text-xs leading-relaxed text-faint">
          {demoNotice} Use the {app.launchLabel.toLowerCase()} button above to start.
        </p>
      </section>
    </Reveal>
  )
}
