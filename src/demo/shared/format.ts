/** Small helpers shared by the demo applications. All dates are ISO yyyy-mm-dd strings. */

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function daysUntil(iso: string | undefined): number | undefined {
  if (!iso) return undefined
  const target = new Date(iso + 'T00:00:00Z').getTime()
  const now = new Date(todayIso() + 'T00:00:00Z').getTime()
  return Math.round((target - now) / 86_400_000)
}

export function yearsSince(iso: string | undefined): number | undefined {
  const d = daysUntil(iso)
  return d === undefined ? undefined : -d / 365.25
}

export function fmtDate(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00Z' : ''))
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export function fmtDateTime(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function nowIso(): string {
  return new Date().toISOString()
}

let counter = 0
export function uid(prefix = 'id'): string {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter}`
}

/** Builds a CSV file and triggers a download. Values are quoted safely. */
export function downloadCsv(filename: string, headers: string[], rows: (string | number | undefined)[][]) {
  const esc = (v: string | number | undefined) => {
    const s = v === undefined || v === null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const text = [headers, ...rows].map((r) => r.map(esc).join(',')).join('\n')
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}
