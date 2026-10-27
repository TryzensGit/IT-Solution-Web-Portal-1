import { useCallback, useState } from 'react'
import { demoCredentials, demoDisplayName, type DemoRole } from '../../config/demo'

export interface DemoSession {
  username: string
  role: DemoRole
  name: string
}

const key = (appId: string) => `tisa-demo-session:${appId}`

export function readSession(appId: string): DemoSession | null {
  try {
    const raw = sessionStorage.getItem(key(appId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<DemoSession>
    if ((parsed.role === 'admin' || parsed.role === 'user') && typeof parsed.username === 'string') {
      return { username: parsed.username, role: parsed.role, name: demoDisplayName[parsed.role] }
    }
  } catch {
    /* storage unavailable or malformed */
  }
  return null
}

export function authenticate(username: string, password: string): DemoSession | null {
  const u = username.trim().toLowerCase()
  const match = demoCredentials.find((c) => c.username === u && c.password === password)
  return match ? { username: match.username, role: match.role, name: demoDisplayName[match.role] } : null
}

function writeSession(appId: string, session: DemoSession | null) {
  try {
    if (session) sessionStorage.setItem(key(appId), JSON.stringify({ username: session.username, role: session.role }))
    else sessionStorage.removeItem(key(appId))
  } catch {
    /* storage unavailable */
  }
}

/** Per-tab sign-in state for one demo application. */
export function useDemoSession(appId: string) {
  const [session, setSession] = useState<DemoSession | null>(() => readSession(appId))

  const signIn = useCallback(
    (username: string, password: string): boolean => {
      const s = authenticate(username, password)
      if (!s) return false
      writeSession(appId, s)
      setSession(s)
      return true
    },
    [appId],
  )

  const signOut = useCallback(() => {
    writeSession(appId, null)
    setSession(null)
  }, [appId])

  return { session, signIn, signOut }
}
