import { ArrowRight, Bot, BookOpen, Check, Mail, Ticket, UserRound } from 'lucide-react'
import { brand } from '../../config/brand'
import { getApplication } from '../../config/applications'
import { Button } from '../ui/Button'
import { Reveal } from '../ui/Reveal'
import { SampleScreenshot } from '../ui/SampleScreenshot'

const flow = [
  { step: 'Message in Teams', detail: 'Describe the problem, attach a screenshot if you have one.' },
  { step: 'Instant acknowledgement', detail: 'The assistant replies within about a second while it works.' },
  { step: 'Knowledge base and triage', detail: 'Matching articles and the screenshot feed a local model that classifies and summarises the issue.' },
  { step: 'Fix, ticket or escalate', detail: 'A card with the suggested fix, or a Jira ticket raised for you, with updates on request.' },
]

/**
 * Home page promotion for the support assistant. The capability bullets
 * come from the catalog entry so this section and the launch page agree.
 */
export function ChatbotPromo() {
  const app = getApplication('tisa-assistant')
  if (!app) return null

  return (
    <section id="chatbot" className="relative overflow-hidden border-y border-line bg-surface/60" aria-labelledby="chatbot-heading">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(50% 70% at 85% 30%, var(--hero-glow-b), transparent 70%)' }} aria-hidden="true" />
      <div className="container-x relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-ai/30 bg-ai-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-ai">
            <Bot className="size-3.5" aria-hidden="true" />
            Support assistant
          </p>
          <h2 id="chatbot-heading" className="mt-5 text-balance text-[1.9rem] font-semibold leading-tight tracking-[-0.025em] sm:text-[2.4rem]">
            First-line IT support, inside Microsoft Teams
          </h2>
          <p className="mt-4 max-w-xl text-pretty text-[1.05rem] leading-relaxed text-muted">
            {brand.assistantName} answers everyday IT questions from the internal knowledge base, reads the screenshot you
            send, and raises a Jira ticket when something needs a person. Later, ask it for an update and it tells you
            what changed.
          </p>
          <ol className="mt-7 space-y-3">
            {flow.map((f, i) => (
              <li key={f.step} className="flex gap-3">
                <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-ai-soft text-xs font-semibold text-ai">{i + 1}</span>
                <div>
                  <p className="text-sm font-semibold">{f.step}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">{f.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to={`/applications/${app.id}`} size="lg">
              Meet the assistant
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button to={app.demo.path} size="lg" variant="secondary">
              Try the chat demo
            </Button>
          </div>
        </Reveal>

        <Reveal>
          <figure className="surface-card relative overflow-hidden p-5 sm:p-6" aria-label="Illustration of a support conversation in Teams: a question with a screenshot, the triage card with a suggested fix, and a ticket raised. This is an illustration, not the assistant.">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-ai-soft text-ai">
                <Bot className="size-4" aria-hidden="true" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">{brand.assistantName}</p>
                <p className="text-xs text-muted">Microsoft Teams chat</p>
              </div>
            </div>

            <div className="mt-4 flex flex-row-reverse gap-2.5 text-sm">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <UserRound className="size-3.5" aria-hidden="true" />
              </span>
              <div className="flex max-w-[85%] flex-col items-end gap-2">
                <SampleScreenshot className="w-40" />
                <p className="rounded-lg border border-line bg-accent-soft px-3 py-2 leading-relaxed">VPN keeps failing since this morning's update. Screenshot attached.</p>
              </div>
            </div>

            <div className="mt-3 flex gap-2.5 text-sm">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-ai-soft text-ai">
                <Bot className="size-3.5" aria-hidden="true" />
              </span>
              <p className="rounded-lg border border-line bg-elevated px-3 py-2 leading-relaxed text-muted">Thanks, reading the screenshot and checking the knowledge base now.</p>
            </div>

            <div className="mt-3 ml-9 rounded-lg border border-line bg-elevated p-4">
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-full border border-accent/30 bg-accent-soft px-2 py-0.5 text-accent">Network</span>
                <span className="rounded-full border border-warning/30 bg-warning/12 px-2 py-0.5 text-warning">Priority: Medium</span>
              </div>
              <p className="mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-faint">
                <BookOpen className="size-3.5 text-ai" aria-hidden="true" />
                Suggested fix from "VPN will not connect"
              </p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted marker:text-faint">
                <li>Disconnect, wait ten seconds, connect again.</li>
                <li>Restart the laptop so the updated VPN adapter loads.</li>
                <li>Try a phone hotspot to rule out the local Wi-Fi.</li>
              </ol>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3 text-xs font-medium" aria-hidden="true">
                <span className="inline-flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-on-accent">
                  <Check className="size-3" /> Resolved
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-line-strong px-2.5 py-1">
                  <Ticket className="size-3" /> Create ticket
                </span>
                <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-muted">
                  <Mail className="size-3" /> Escalate
                </span>
              </div>
            </div>

            <p className="mt-3 ml-9 inline-flex items-center gap-2 rounded-md border border-line bg-elevated px-3 py-1.5 text-xs">
              <Ticket className="size-3.5 text-accent" aria-hidden="true" />
              <span className="font-mono font-semibold">TBTH-1042</span>
              <span className="text-muted">raised in Jira, updates on request</span>
            </p>

            <figcaption className="mt-4 text-xs text-faint">Illustration of a support conversation. Articles, tickets and names are examples.</figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  )
}
