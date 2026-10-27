import type { AppStatus } from '../../config/applications'

const config: Record<AppStatus, { label: string; dot: string; text: string; live: boolean }> = {
  available: { label: 'Available', dot: 'bg-success', text: 'text-success', live: true },
  maintenance: { label: 'Under maintenance', dot: 'bg-warning', text: 'text-warning', live: false },
  'coming-soon': { label: 'Coming soon', dot: 'bg-faint', text: 'text-muted', live: false },
}

/**
 * Configured availability label. The text always accompanies the colour
 * so the status is never communicated by colour alone.
 */
export function StatusBadge({ status, className = '' }: { status: AppStatus; className?: string }) {
  const c = config[status]
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-line bg-elevated px-2.5 py-1 text-xs font-medium ${c.text} ${className}`}
    >
      <span className={`status-dot ${c.dot} ${c.live ? 'status-dot-live' : ''}`} aria-hidden="true" />
      {c.label}
    </span>
  )
}
