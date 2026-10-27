import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Scrolls to the top on new navigations, to the hash target when one is
 * present, and leaves the browser's own restoration alone on back/forward.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation()
  const navType = useNavigationType()

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1))
      // Wait a frame so the page transition has mounted the target.
      const frame = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: 'start' })
      })
      return () => cancelAnimationFrame(frame)
    }
    if (navType !== 'POP') {
      window.scrollTo({ top: 0, left: 0 })
    }
  }, [pathname, hash, navType])

  return null
}
