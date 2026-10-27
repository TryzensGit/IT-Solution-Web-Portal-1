import { applications } from '../../config/applications'
import { AppIcon } from '../ui/AppIcon'

/**
 * The hero's visual: an AI core with the portal's applications attached by
 * thin lines. Pure SVG and CSS. Satellite positions are in viewBox units
 * (0..520 x 0..440) and mirrored as percentages for the HTML chips so the
 * composition scales with its container.
 */
const W = 520
const H = 440
const CORE = { x: 260, y: 220 }

const satellites = [
  { x: 86, y: 104 },
  { x: 440, y: 136 },
  { x: 372, y: 356 },
]

const faint = [
  { x: 118, y: 332 },
  { x: 458, y: 290 },
  { x: 300, y: 56 },
  { x: 52, y: 230 },
]

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]" style={{ aspectRatio: `${W} / ${H}` }} aria-hidden="true">
      {/* Glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side at 50% 50%, var(--hero-glow-a), transparent 70%), radial-gradient(closest-side at 70% 70%, var(--hero-glow-b), transparent 70%)',
        }}
      />

      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible">
        <defs>
          <radialGradient id="core-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--c-ai)" stopOpacity="0.9" />
            <stop offset="55%" stopColor="var(--c-accent)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--c-accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Faint secondary services */}
        {faint.map((p, i) => (
          <g key={`f${i}`}>
            <line x1={CORE.x} y1={CORE.y} x2={p.x} y2={p.y} stroke="var(--c-border-strong)" strokeWidth="1" strokeDasharray="3 6" />
            <circle cx={p.x} cy={p.y} r="3.5" fill="var(--c-surface)" stroke="var(--c-border-strong)" strokeWidth="1" />
          </g>
        ))}

        {/* Primary connections with flowing dashes */}
        {satellites.map((p, i) => (
          <g key={`s${i}`}>
            <line x1={CORE.x} y1={CORE.y} x2={p.x} y2={p.y} stroke="var(--c-border-strong)" strokeWidth="1.2" />
            <line
              x1={CORE.x}
              y1={CORE.y}
              x2={p.x}
              y2={p.y}
              stroke="var(--c-ai)"
              strokeWidth="2"
              strokeLinecap="round"
              className="hero-flow"
              style={{ animationDelay: `${i * -1.1}s` }}
            />
          </g>
        ))}

        {/* Core */}
        <circle cx={CORE.x} cy={CORE.y} r="64" fill="url(#core-fill)" className="hero-core" />
        <circle cx={CORE.x} cy={CORE.y} r="46" fill="none" stroke="var(--c-accent)" strokeOpacity="0.35" strokeWidth="1" />
        <circle cx={CORE.x} cy={CORE.y} r="30" fill="var(--c-surface)" stroke="var(--c-accent)" strokeWidth="1.5" />
        <circle cx={CORE.x} cy={CORE.y} r="9" fill="var(--c-ai)" />
        <circle cx={CORE.x} cy={CORE.y} r="18" fill="none" stroke="var(--c-ai)" strokeOpacity="0.5" strokeWidth="1" />
      </svg>

      {/* Application chips */}
      {applications.slice(0, 3).map((app, i) => {
        const p = satellites[i]
        return (
          <div
            key={app.id}
            className="hero-node absolute flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-2 shadow-card"
            style={{
              left: `${(p.x / W) * 100}%`,
              top: `${(p.y / H) * 100}%`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${i * -2}s`,
            }}
          >
            <span className="inline-flex size-7 items-center justify-center rounded-md bg-accent-soft text-accent">
              <AppIcon name={app.icon} className="size-4" />
            </span>
            <span className="hidden whitespace-nowrap text-xs font-medium sm:inline">{app.name}</span>
          </div>
        )
      })}
    </div>
  )
}
