import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useReducedMotion } from 'framer-motion'
import { ArrowLeft, Bot, BookOpen, Check, FlaskConical, Image, Mail, RotateCcw, Send, Ticket, UserRound, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { SampleScreenshot } from '../../components/ui/SampleScreenshot'
import { ThemeToggle } from '../../components/ui/ThemeToggle'
import { brand } from '../../config/brand'
import { usePageTitle } from '../../lib/usePageTitle'
import { Chip, type Tone } from '../shared/ui'
import { acknowledge, addUserMessage, applyAction, attachmentLabels, createInitialState, generateReply, type AttachmentKind, type ChatState, type Priority, type Triage } from './engine'

const priorityTone: Record<Priority, Tone> = { Low: 'neutral', Medium: 'warning', High: 'critical' }

/**
 * Simulated Teams chat with the support assistant. The engine decides what
 * to say; this component adds the acknowledge-then-answer timing and the UI.
 */
export function ChatbotDemo() {
  usePageTitle(`${brand.assistantName} demo`)
  const reduce = useReducedMotion()
  const [state, setState] = useState<ChatState>(createInitialState)
  const [draft, setDraft] = useState('')
  const [attachment, setAttachment] = useState<AttachmentKind | undefined>()
  const [thinking, setThinking] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const timers = useRef<number[]>([])

  const later = useCallback(
    (ms: number, fn: () => void) => {
      timers.current.push(window.setTimeout(fn, reduce ? Math.min(ms, 200) : ms))
    },
    [reduce],
  )

  const send = useCallback(
    (text: string, attach?: AttachmentKind) => {
      const clean = text.trim()
      if (!clean || thinking) return
      setDraft('')
      setAttachment(undefined)
      setState((s) => addUserMessage(s, clean, attach))
      setThinking(true)
      later(500, () => setState((s) => acknowledge(s)))
      later(1700, () => {
        setState((s) => generateReply(s))
        setThinking(false)
      })
    },
    [thinking, later],
  )

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: reduce ? 'auto' : 'smooth' })
  }, [state.messages.length, thinking, reduce])

  function act(triageId: string, action: 'resolved' | 'ticket' | 'escalate') {
    setState((s) => applyAction(s, triageId, action))
  }

  function reset() {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    setThinking(false)
    setAttachment(undefined)
    setDraft('')
    setState(createInitialState())
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    send(draft, attachment)
    inputRef.current?.focus()
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(draft, attachment)
    }
  }

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <header className="border-b border-line bg-overlay backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted hover:text-text">
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Back to portal</span>
          </Link>
          <div className="ml-2 flex items-center gap-3 border-l border-line pl-4">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-ai-soft text-ai">
              <Bot className="size-5" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <h1 className="text-[0.95rem] font-semibold tracking-tight">{brand.assistantName}</h1>
              <p className="text-xs text-muted">Microsoft Teams chat, simulated</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="secondary" onClick={reset}>
              <RotateCcw className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Reset chat</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
        <p className="border-t border-line bg-ai-soft/60">
          <span className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-1.5 text-xs text-muted sm:px-6">
            <FlaskConical className="size-3.5 shrink-0 text-ai" aria-hidden="true" />
            Demo with scripted replies and a fictional knowledge base. No Teams tenant, Jira project or real conversation is involved.
          </span>
        </p>
      </header>

      <div ref={logRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6 sm:px-6" role="log" aria-live="polite" aria-label="Conversation">
          {state.messages.map((m) => (
            <div key={m.id} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full ${m.role === 'bot' ? 'bg-ai-soft text-ai' : 'bg-accent-soft text-accent'}`} aria-hidden="true">
                {m.role === 'bot' ? <Bot className="size-4" /> : <UserRound className="size-4" />}
              </span>
              <div className={`flex max-w-[88%] flex-col gap-2 sm:max-w-[78%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                {m.attachment && <SampleScreenshot kind={m.attachment} className="w-56" />}
                <p className={`whitespace-pre-line rounded-xl border border-line px-3.5 py-2.5 text-sm leading-relaxed ${m.role === 'bot' ? (m.kind === 'ack' ? 'bg-surface text-muted' : 'bg-surface') : 'bg-accent-soft'}`}>
                  <span className="sr-only">{m.role === 'bot' ? 'Assistant: ' : 'You: '}</span>
                  {m.text}
                </p>
                {m.triageId && state.triages[m.triageId] && <TriageCard triage={state.triages[m.triageId]} onAction={(a) => act(m.triageId!, a)} />}
                {m.ticketKey && <TicketChip state={state} ticketKey={m.ticketKey} />}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex gap-2.5">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-ai-soft text-ai" aria-hidden="true">
                <Bot className="size-4" />
              </span>
              <p className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-muted" aria-label="Assistant is typing">
                <span className="size-1.5 animate-bounce rounded-full bg-faint [animation-delay:-0.2s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-faint [animation-delay:-0.1s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-faint" />
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6">
          {state.suggestions.length > 0 && !thinking && (
            <ul className="mb-3 flex flex-wrap gap-2" aria-label="Suggestions">
              {state.suggestions.map((s) => (
                <li key={s}>
                  <button type="button" onClick={() => send(s)} className="rounded-full border border-line bg-elevated px-3 py-1.5 text-left text-xs font-medium text-muted transition-colors hover:border-accent/60 hover:text-text">
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {attachment && (
            <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-line bg-elevated px-2.5 py-1.5 text-xs">
              <Image className="size-3.5 text-accent" aria-hidden="true" />
              {attachmentLabels[attachment].label}
              <button type="button" onClick={() => setAttachment(undefined)} aria-label="Remove attachment" className="text-muted hover:text-text">
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
          <form onSubmit={onSubmit} className="flex items-end gap-2">
            <label className="sr-only" htmlFor="chat-input">
              Message the assistant
            </label>
            <textarea
              id="chat-input"
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              rows={1}
              placeholder="Describe the problem, for example: my VPN keeps disconnecting"
              className="max-h-40 min-h-[2.75rem] w-full resize-y rounded-md border border-line bg-canvas px-3 py-2.5 text-sm placeholder:text-faint focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            />
            <AttachMenu current={attachment} onPick={setAttachment} />
            <Button type="submit" size="lg" disabled={!draft.trim() || thinking} aria-label="Send message">
              <Send className="size-4" aria-hidden="true" />
            </Button>
          </form>
          <p className="mt-2 text-xs text-faint">Enter to send, Shift+Enter for a new line. Attach a sample screenshot to see the image step.</p>
        </div>
      </footer>
    </div>
  )
}

function AttachMenu({ current, onPick }: { current?: AttachmentKind; onPick: (k: AttachmentKind) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Attach a sample screenshot"
        title="Attach a sample screenshot"
        className={`inline-flex h-11 items-center justify-center rounded-md border px-3 transition-colors ${current ? 'border-accent text-accent' : 'border-line text-muted hover:border-line-strong hover:text-text'}`}
      >
        <Image className="size-4" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="surface-card absolute bottom-full right-0 z-30 mb-2 w-60 p-1.5 shadow-card-hover">
          {(Object.keys(attachmentLabels) as AttachmentKind[]).map((k) => (
            <button
              key={k}
              type="button"
              role="menuitem"
              onClick={() => {
                onPick(k)
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-elevated"
            >
              <Image className="size-4 text-muted" aria-hidden="true" />
              {attachmentLabels[k].label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** The Adaptive Card the real bot sends: triage summary, suggested fix and the three actions. */
function TriageCard({ triage, onAction }: { triage: Triage; onAction: (a: 'resolved' | 'ticket' | 'escalate') => void }) {
  const open = triage.status === 'open'
  const statusLabel = { open: undefined, resolved: 'Marked resolved', ticketed: `Ticket ${triage.ticketKey} raised`, escalated: 'Escalated to IT' }[triage.status]
  return (
    <section className="surface-card w-full p-4" aria-label={`Triage: ${triage.summary}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="blue">{triage.category}</Chip>
        <Chip tone={priorityTone[triage.priority]}>Priority: {triage.priority}</Chip>
        {statusLabel && <Chip tone="good">{statusLabel}</Chip>}
      </div>
      <p className="mt-3 text-sm">
        <span className="font-semibold">Summary:</span> {triage.summary}
      </p>
      {triage.imageNote && <p className="mt-2 text-sm text-muted">{triage.imageNote}</p>}
      {triage.article && (
        <div className="mt-3 rounded-md border border-line bg-elevated p-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-faint">
            <BookOpen className="size-3.5 text-ai" aria-hidden="true" />
            Suggested fix from "{triage.article.title}"
          </p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-muted marker:text-faint">
            {triage.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
      )}
      {!triage.article && (
        <p className="mt-3 text-sm text-muted">No article matched well enough to suggest a fix. Raising a ticket gets a person on it.</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
        <Button onClick={() => onAction('resolved')} disabled={!open}>
          <Check className="size-4" aria-hidden="true" />
          Resolved
        </Button>
        <Button variant="secondary" onClick={() => onAction('ticket')} disabled={!open}>
          <Ticket className="size-4" aria-hidden="true" />
          Create ticket
        </Button>
        <Button variant="ghost" onClick={() => onAction('escalate')} disabled={!open}>
          <Mail className="size-4" aria-hidden="true" />
          Escalate
        </Button>
      </div>
    </section>
  )
}

function TicketChip({ state, ticketKey }: { state: ChatState; ticketKey: string }) {
  const t = state.tickets.find((x) => x.key === ticketKey)
  if (!t) return null
  const tone: Tone = t.status === 'Done' ? 'good' : t.status === 'In Progress' ? 'blue' : 'warning'
  return (
    <p className="inline-flex items-center gap-2 rounded-md border border-line bg-elevated px-3 py-1.5 text-xs">
      <Ticket className="size-3.5 text-accent" aria-hidden="true" />
      <span className="font-mono font-semibold">{t.key}</span>
      <span className="text-muted">Task, project TBTH</span>
      <Chip tone={tone}>{t.status}</Chip>
    </p>
  )
}
