/**
 * Recently opened applications. Only application ids are stored, never
 * user data. Reads and writes are wrapped because storage can be
 * unavailable (private windows, blocked storage).
 */
export const RECENT_STORAGE_KEY = 'tisa-recent-apps'
const LIMIT = 3

export function getRecentApps(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

export function recordRecentApp(id: string): string[] {
  const next = [id, ...getRecentApps().filter((v) => v !== id)].slice(0, LIMIT)
  try {
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* storage unavailable; ignore */
  }
  return next
}
