import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppDefinition } from '../config/applications'
import { validateDestination } from './url'
import { recordRecentApp } from './recent'

export type LaunchState = 'idle' | 'launching'

export interface LaunchResolution {
  /** Validated destination, or undefined if missing/invalid. */
  href?: string
  external: boolean
  /** Why the destination is unusable, if it is. */
  blocked?: 'missing' | 'invalid' | 'coming-soon'
  message?: string
}

export function resolveLaunch(app: AppDefinition): LaunchResolution {
  const external = app.destination.type === 'external'
  if (app.status === 'coming-soon') {
    return {
      external,
      blocked: 'coming-soon',
      message: `${app.name} is not available yet. Check back once it has been released.`,
    }
  }
  const check = validateDestination(app.destination.url, app.destination.type)
  if (!check.ok) {
    return {
      external,
      blocked: check.reason,
      message:
        check.reason === 'missing'
          ? `${app.name} does not have a destination configured yet. Ask your portal administrator to set its URL.`
          : `The configured address for ${app.name} is not a valid HTTPS URL, so it cannot be opened safely. Ask your portal administrator to correct it.`,
    }
  }
  return { href: check.href, external: check.kind === 'external' }
}

/**
 * Gives a card or button short-lived "launching" feedback. Navigation is
 * never delayed: for external links the browser follows the anchor in the
 * same gesture, which also keeps popup blockers happy.
 */
export function useLaunchFeedback(app: AppDefinition) {
  const [state, setState] = useState<LaunchState>('idle')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const onLaunch = useCallback(() => {
    recordRecentApp(app.id)
    setState('launching')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setState('idle'), 900)
  }, [app.id])

  return { state, onLaunch }
}
