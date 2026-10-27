import { Bot, Laptop, Monitor, Smartphone, UserRound } from 'lucide-react'
import type { AppDefinition } from '../../config/applications'
import { brand } from '../../config/brand'

/**
 * A minimal illustration for each launch page. Chosen by icon so a new
 * catalog entry gets a sensible picture without new code. Everything here
 * is static and clearly presentational.
 */
export function AppVisual({ app }: { app: AppDefinition }) {
  switch (app.icon) {
    case 'users':
      return <UsersVisual />
    case 'monitor':
      return <AssetsVisual />
    case 'bot':
      return <AssistantVisual />
    default:
      return <GenericVisual />
  }
}

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <figure className="surface-card relative overflow-hidden p-5 sm:p-6" aria-label={label}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(70% 60% at 100% 0%, var(--hero-glow-a), transparent 70%)' }}
        aria-hidden="true"
      />
      <div className="relative">{children}</div>
      <figcaption className="relative mt-4 text-xs text-faint">{label}</figcaption>
    </figure>
  )
}

function UsersVisual() {
  const rows = ['Directory', 'Roles', 'Access requests', 'Lifecycle events']
  return (
    <Frame label="Illustration of a user record list">
      <ul className="space-y-2.5">
        {rows.map((r, i) => (
          <li key={r} className="flex items-center gap-3 rounded-md border border-line bg-elevated px-3 py-2.5">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-accent-soft text-accent">
              <UserRound className="size-3.5" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium">{r}</span>
            <span className="ml-auto h-1.5 rounded-full bg-line" style={{ width: `${34 + i * 12}px` }} aria-hidden="true" />
          </li>
        ))}
      </ul>
    </Frame>
  )
}

function AssetsVisual() {
  const devices = [
    { icon: Laptop, label: 'Laptops' },
    { icon: Monitor, label: 'Displays' },
    { icon: Smartphone, label: 'Phones' },
  ]
  return (
    <Frame label="Illustration of asset categories and their lifecycle">
      <div className="grid grid-cols-3 gap-3">
        {devices.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 rounded-md border border-line bg-elevated p-4">
            <Icon className="size-6 text-accent" aria-hidden="true" />
            <span className="text-xs font-medium">{label}</span>
          </div>
        ))}
      </div>
      <ol className="mt-4 flex items-center justify-between text-[0.7rem] font-medium text-muted" aria-label="Lifecycle stages">
        {['Procured', 'Assigned', 'In use', 'Retired'].map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${i < 3 ? 'bg-ai' : 'bg-line-strong'}`} aria-hidden="true" />
            {s}
          </li>
        ))}
      </ol>
    </Frame>
  )
}

function AssistantVisual() {
  return (
    <Frame label={`Example of how a conversation with ${brand.assistantName} can look. This is an illustration, not the assistant.`}>
      <div className="space-y-3 text-sm">
        <Bubble side="user">My laptop keeps disconnecting from the VPN. Anything I can try first?</Bubble>
        <Bubble side="bot">
          Let us check two things: whether the VPN client is up to date, and whether the same thing happens on a
          different network. I can send you the update steps.
        </Bubble>
        <Bubble side="user">Send them please.</Bubble>
        <Bubble side="bot">Sent. If it keeps happening, I can raise a ticket with the details we have gathered.</Bubble>
      </div>
    </Frame>
  )
}

function Bubble({ side, children }: { side: 'user' | 'bot'; children: React.ReactNode }) {
  const isBot = side === 'bot'
  return (
    <div className={`flex gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}>
      <span
        className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full ${isBot ? 'bg-ai-soft text-ai' : 'bg-accent-soft text-accent'}`}
      >
        {isBot ? <Bot className="size-3.5" aria-hidden="true" /> : <UserRound className="size-3.5" aria-hidden="true" />}
      </span>
      <p
        className={`max-w-[85%] rounded-lg border border-line px-3 py-2 leading-relaxed ${isBot ? 'bg-elevated' : 'bg-accent-soft'}`}
      >
        {children}
      </p>
    </div>
  )
}

function GenericVisual() {
  return (
    <Frame label="Illustration">
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-md border border-line bg-elevated" />
        ))}
      </div>
    </Frame>
  )
}
