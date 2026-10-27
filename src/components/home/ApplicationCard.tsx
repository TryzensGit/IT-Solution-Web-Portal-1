import { useId, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ExternalLink, Info, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCategory, type AppDefinition } from '../../config/applications'
import { resolveLaunch, useLaunchFeedback } from '../../lib/launch'
import { AppIcon } from '../ui/AppIcon'
import { StatusBadge } from '../ui/StatusBadge'
import { buttonClasses } from '../ui/Button'

interface Props {
  app: AppDefinition
  /** Hide the "Details" link, e.g. when already on the launch page. */
  hideDetails?: boolean
}

/**
 * Launcher card. The primary action is a real link (or a button when the
 * destination is unusable) stretched over the card, so the whole surface
 * is clickable without nesting interactive elements. The secondary
 * "Details" link sits above the stretched area with its own focus stop.
 */
export function ApplicationCard({ app, hideDetails = false }: Props) {
  const reduce = useReducedMotion()
  const launch = resolveLaunch(app)
  const { state, onLaunch } = useLaunchFeedback(app)
  const [showMessage, setShowMessage] = useState(false)
  const messageId = useId()
  const launching = state === 'launching'
  const category = getCategory(app.category)

  return (
    <motion.article
      className="surface-card surface-card-interactive group relative flex h-full flex-col p-6"
      data-launching={launching || undefined}
      animate={launching && !reduce ? { scale: [1, 0.985, 1] } : { scale: 1 }}
      transition={{ duration: 0.32 }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex size-11 items-center justify-center rounded-lg border border-line bg-accent-soft text-accent transition-colors duration-200 group-hover:border-accent/40">
          <AppIcon name={app.icon} className="size-5" />
        </span>
        {app.status && <StatusBadge status={app.status} />}
      </div>

      <p className="mt-5 text-xs font-medium text-faint">{category.label}</p>
      <h3 className="mt-1 text-lg font-semibold tracking-tight">{app.name}</h3>
      <p className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-muted">{app.summary}</p>

      <div className="mt-6 flex items-center justify-between gap-3">
        {/*
          The link is stretched over the card with an absolutely positioned
          ::after. It must not get the press transform: a transform makes the
          link the containing block for that pseudo-element, which shrinks the
          hit area between mousedown and mouseup so the click never fires.
          The card itself animates on launch instead.
        */}
        {launch.href ? (
          <a
            href={launch.href}
            target={launch.external ? '_blank' : undefined}
            rel={launch.external ? 'noopener noreferrer' : undefined}
            onClick={onLaunch}
            className={buttonClasses('primary', 'md', 'after:absolute after:inset-0 after:rounded-xl after:content-[""]', {
              press: false,
            })}
            aria-describedby={app.launchNote ? `${messageId}-note` : undefined}
          >
            {launching ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Opening
              </>
            ) : (
              <>
                {app.launchLabel}
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </>
            )}
          </a>
        ) : (
          <button
            type="button"
            className={buttonClasses('secondary', 'md')}
            aria-expanded={showMessage}
            aria-controls={messageId}
            onClick={() => setShowMessage((v) => !v)}
          >
            <Info className="size-4" aria-hidden="true" />
            {launch.blocked === 'coming-soon' ? 'Not yet available' : 'Not configured'}
          </button>
        )}

        {!hideDetails && (
          <Link
            to={`/applications/${app.id}`}
            className="relative z-10 rounded-md px-2 py-1 text-sm font-medium text-muted transition-colors hover:text-text"
          >
            Details
          </Link>
        )}
      </div>

      {app.launchNote && launch.href && (
        <p id={`${messageId}-note`} className="mt-3 inline-flex items-center gap-1.5 text-xs text-faint">
          {launch.external && <ExternalLink className="size-3" aria-hidden="true" />}
          {app.launchNote}
        </p>
      )}

      <div id={messageId} role="status" aria-live="polite">
        {showMessage && launch.message && (
          <p className="mt-3 rounded-md border border-line bg-elevated p-3 text-sm leading-relaxed text-muted">
            {launch.message}
          </p>
        )}
      </div>
    </motion.article>
  )
}
