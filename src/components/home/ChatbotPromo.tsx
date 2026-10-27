import { ArrowRight, Bot, Check, Cloud, Loader2, MessageSquare, UserRound } from 'lucide-react'
import { brand } from '../../config/brand'
import { getApplication } from '../../config/applications'
import { Button } from '../ui/Button'
import { Reveal } from '../ui/Reveal'

const plan: { group: string; icon: typeof Cloud; steps: { label: string; state: 'done' | 'running' | 'pending' }[] }[] = [
  {
    group: 'Azure',
    icon: Cloud,
    steps: [
      { label: 'Resource group rg-bristol in UK South', state: 'done' },
      { label: 'Two virtual machines with managed disks', state: 'running' },
      { label: 'Storage account with a shared file share', state: 'pending' },
    ],
  },
  {
    group: 'Microsoft Teams',
    icon: MessageSquare,
    steps: [
      { label: 'Team "Bristol Office" with General and IT Support', state: 'done' },
      { label: 'Meeting and messaging policies applied', state: 'done' },
      { label: 'Approvals app installed for the team', state: 'pending' },
    ],
  },
]

/**
 * Home page promotion for the AI chatbot. The capability bullets come from
 * the catalog entry so this section and the launch page never disagree.
 */
export function ChatbotPromo() {
  const app = getApplication('tisa-assistant')
  if (!app) return null

  return (
    <section id="chatbot" className="relative overflow-hidden border-y border-line bg-surface/60" aria-labelledby="chatbot-heading">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(50% 70% at 85% 30%, var(--hero-glow-b), transparent 70%)' }}
        aria-hidden="true"
      />
      <div className="container-x relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-ai/30 bg-ai-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-ai">
            <Bot className="size-3.5" aria-hidden="true" />
            AI chatbot
          </p>
          <h2 id="chatbot-heading" className="mt-5 text-balance text-[1.9rem] font-semibold leading-tight tracking-[-0.025em] sm:text-[2.4rem]">
            Set up enterprise Azure and Microsoft Teams by describing what you need
          </h2>
          <p className="mt-4 max-w-xl text-pretty text-[1.05rem] leading-relaxed text-muted">
            {brand.assistantName} is a chatbot that does the work, not just an assistant that answers questions. Tell it
            about the organisation, review the plan it proposes, approve it, and watch the Azure resources and Teams
            workspaces get configured and installed.
          </p>
          <ul className="mt-7 grid gap-4 sm:grid-cols-2">
            {app.capabilities.map((c) => (
              <li key={c.title} className="flex gap-3">
                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-ai-soft text-ai">
                  <Check className="size-3" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{c.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">{c.detail}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to={`/applications/${app.id}`} size="lg">
              Meet the chatbot
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button to="/solutions" size="lg" variant="secondary">
              See all solutions
            </Button>
          </div>
        </Reveal>

        <Reveal>
          <figure
            className="surface-card relative overflow-hidden p-5 sm:p-6"
            aria-label="Illustration of the chatbot proposing and carrying out an Azure and Teams setup plan. This is an illustration, not the chatbot."
          >
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-ai-soft text-ai">
                <Bot className="size-4" aria-hidden="true" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">{brand.assistantName}</p>
                <p className="text-xs text-muted">Microsoft Teams chat</p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-line bg-elevated px-2.5 py-1 text-xs font-medium text-muted">
                <span className="status-dot bg-success status-dot-live" aria-hidden="true" />
                Approved, deploying
              </span>
            </div>

            <div className="mt-4 flex flex-row-reverse gap-2.5 text-sm">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <UserRound className="size-3.5" aria-hidden="true" />
              </span>
              <p className="max-w-[85%] rounded-lg border border-line bg-accent-soft px-3 py-2 leading-relaxed">
                Set up the Bristol office: an Azure environment with two VMs and shared storage, plus a Teams team for
                the office.
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-line bg-elevated p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-faint">Deployment plan</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {plan.map((g) => (
                  <div key={g.group}>
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <g.icon className="size-4 text-ai" aria-hidden="true" />
                      {g.group}
                    </p>
                    <ol className="mt-2 space-y-2">
                      {g.steps.map((s) => (
                        <li key={s.label} className="flex items-start gap-2 text-sm text-muted">
                          {s.state === 'done' ? (
                            <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                              <Check className="size-2.5" aria-hidden="true" />
                            </span>
                          ) : s.state === 'running' ? (
                            <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-accent" aria-hidden="true" />
                          ) : (
                            <span className="mt-1 ml-1 inline-block size-2 shrink-0 rounded-full border border-line-strong" aria-hidden="true" />
                          )}
                          <span className={s.state === 'done' ? 'text-text' : ''}>{s.label}</span>
                          <span className="sr-only">
                            {s.state === 'done' ? ' (done)' : s.state === 'running' ? ' (in progress)' : ' (waiting)'}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>

            <figcaption className="mt-4 text-xs text-faint">
              Illustration of a chatbot session. Every change waits for an authorised person to approve the plan first.
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  )
}
