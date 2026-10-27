import { Bot, Laptop, Monitor, Server, Smartphone, UserRound } from 'lucide-react'
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
  const rows = ['Onboarding', 'Offboarding', 'Services', 'Access and security']
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
    { icon: Server, label: 'Servers' },
    { icon: Monitor, label: 'Workstations' },
    { icon: Smartphone, label: 'Mobile' },
  ]
  return (
    <Frame label="Illustration of asset categories and their lifecycle">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
        <Bubble side="user">My VPN keeps dropping since this morning's update. Screenshot attached.</Bubble>
        <Bubble side="bot">Thanks, reading the screenshot and checking the knowledge base now.</Bubble>
        <Bubble side="bot">
          The screenshot shows "Authentication failed". The article "VPN will not connect" suggests: disconnect and
          reconnect, restart the laptop so the updated adapter loads, then try a phone hotspot. Did that fix it?
        </Bubble>
        <Bubble side="user">Still failing after the restart.</Bubble>
        <Bubble side="bot">
          Ticket TBTH-1042 created in Jira with your message and the screenshot. Ask me for an update any time.
        </Bubble>
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
