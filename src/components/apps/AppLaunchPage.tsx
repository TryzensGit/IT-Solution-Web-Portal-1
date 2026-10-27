import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ExternalLink, Info, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCategory, type AppDefinition } from '../../config/applications'
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
              <Button href={launch.href} size="lg" target={launch.external ? '_blank' : undefined} rel={launch.external ? 'noopener noreferrer' : undefined} onClick={onLaunch}>
                {launching ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Opening
                  </>
                ) : (
                  <>
                    {app.launchLabel}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </>
                )}
              </Button>
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
                {launch.external && <ExternalLink className="size-3.5" aria-hidden="true" />}
                {app.launchNote}
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

        <Reveal className="lg:pt-6">
          <AppVisual app={app} />
          {app.icon === 'bot' && (
            <p className="mt-4 text-sm leading-relaxed text-muted">
              This page is an overview. The assistant itself runs inside Microsoft Teams and opens from the launch
              button above.
            </p>
          )}
        </Reveal>
      </div>
    </div>
  )
}
