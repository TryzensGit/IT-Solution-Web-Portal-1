import { applications, type AppDefinition } from '../../config/applications'
import { heroServices } from '../../config/content'
import { AppIcon, type IconName } from '../ui/AppIcon'

/**
 * The hero's visual: an AI core with the portal's applications and
 * supporting services arranged around it. Nodes are generated from
 * configuration, so adding an application (catalog) or a service
 * (heroServices in content.ts) adds a node without touching coordinates.
 *
 * Applications and services share one ring and are interleaved so that a
 * service never sits on the same ray as an application chip. Positions are
 * in viewBox units (0..520 x 0..440) and mirrored as percentages for the
 * HTML chips so the composition scales with its container.
 */
const W = 520
const H = 440
const CORE = { x: W / 2, y: H / 2 }
const RX = 190
const RY = 165
const START_DEG = -150

/** Up to this many applications are drawn; the rest still live in the launcher. */
const MAX_APPS = 6

type Node =
  | { kind: 'app'; key: string; label: string; icon: IconName; app: AppDefinition }
  | { kind: 'service'; key: string; label: string; icon: IconName }

function interleave(apps: AppDefinition[], services: { label: string; icon: IconName }[]): Node[] {
  const nodes: Node[] = []
  const perApp = apps.length ? services.length / apps.length : 0
  let s = 0
  apps.forEach((app, i) => {
    nodes.push({ kind: 'app', key: app.id, label: app.name, icon: app.icon, app })
    const target = Math.round((i + 1) * perApp)
    while (s < target && s < services.length) {
      nodes.push({ kind: 'service', key: `svc-${services[s].label}`, ...services[s] })
      s++
    }
  })
  while (s < services.length) {
    nodes.push({ kind: 'service', key: `svc-${services[s].label}`, ...services[s] })
    s++
  }
  return nodes
}

function position(index: number, count: number) {
  const angle = ((START_DEG + (360 / count) * index) * Math.PI) / 180
  return { x: CORE.x + RX * Math.cos(angle), y: CORE.y + RY * Math.sin(angle) }
}

export function HeroVisual() {
  const nodes = interleave(applications.slice(0, MAX_APPS), heroServices)
  const points = nodes.map((_, i) => position(i, nodes.length))

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

        {nodes.map((node, i) => {
          const p = points[i]
          return node.kind === 'service' ? (
            /* Service connection: quiet dashed line */
            <line
              key={node.key}
              x1={CORE.x}
              y1={CORE.y}
              x2={p.x}
              y2={p.y}
              stroke="var(--c-border-strong)"
              strokeWidth="1"
              strokeDasharray="3 6"
            />
          ) : (
            /* Application connection: flowing teal pulses */
            <g key={node.key}>
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
                style={{ animationDelay: `${i * -0.7}s` }}
              />
            </g>
          )
        })}

        {/* Core */}
        <circle cx={CORE.x} cy={CORE.y} r="64" fill="url(#core-fill)" className="hero-core" />
        <circle cx={CORE.x} cy={CORE.y} r="46" fill="none" stroke="var(--c-accent)" strokeOpacity="0.35" strokeWidth="1" />
        <circle cx={CORE.x} cy={CORE.y} r="30" fill="var(--c-surface)" stroke="var(--c-accent)" strokeWidth="1.5" />
        <circle cx={CORE.x} cy={CORE.y} r="9" fill="var(--c-ai)" />
        <circle cx={CORE.x} cy={CORE.y} r="18" fill="none" stroke="var(--c-ai)" strokeOpacity="0.5" strokeWidth="1" />
      </svg>

      {nodes.map((node, i) => {
        const p = points[i]
        const style = {
          left: `${(p.x / W) * 100}%`,
          top: `${(p.y / H) * 100}%`,
          transform: 'translate(-50%, -50%)',
          animationDelay: `${i * -1.4}s`,
        }
        return node.kind === 'app' ? (
          /* Application chip: prominent */
          <div
            key={node.key}
            className="hero-node absolute flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-2 shadow-card"
            style={style}
          >
            <span className="inline-flex size-7 items-center justify-center rounded-md bg-accent-soft text-accent">
              <AppIcon name={node.icon} className="size-4" />
            </span>
            <span className="hidden whitespace-nowrap text-xs font-medium sm:inline">{node.label}</span>
          </div>
        ) : (
          /* Service chip: compact and muted */
          <div
            key={node.key}
            className="hero-node absolute flex items-center gap-1.5 rounded-full border border-line bg-surface/90 py-1 pl-1 pr-2.5"
            style={style}
          >
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-ai-soft text-ai">
              <AppIcon name={node.icon} className="size-3" />
            </span>
            <span className="hidden whitespace-nowrap text-[0.68rem] font-medium text-muted md:inline">{node.label}</span>
          </div>
        )
      })}
    </div>
  )
}
