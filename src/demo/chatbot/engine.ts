/**
 * Scripted engine for the support assistant demo.
 *
 * Mirrors how the real TISA bot behaves in Microsoft Teams: acknowledge the
 * message first, search the knowledge base, triage the issue (category,
 * priority, summary, suggested fix), reply with a card offering Resolved,
 * Create ticket or Escalate, and report ticket updates on request. Here the
 * knowledge base is a handful of fictional articles, the "LLM" is keyword
 * matching and Jira is a counter. Pure functions, so it is easy to test.
 */

export type Role = 'user' | 'bot'
export type Priority = 'Low' | 'Medium' | 'High'
export type AttachmentKind = 'vpn-error' | 'outlook-error'
export type TriageStatus = 'open' | 'resolved' | 'ticketed' | 'escalated'
export type TicketStatus = 'To Do' | 'In Progress' | 'Done'

export interface KbArticle {
  id: string
  title: string
  category: string
  keywords: string[]
  priority: Priority
  steps: string[]
}

export interface Triage {
  id: string
  category: string
  priority: Priority
  summary: string
  /** True when the suggested fix is expected to resolve the issue without a ticket. */
  resolved: boolean
  article?: KbArticle
  steps: string[]
  imageNote?: string
  status: TriageStatus
  ticketKey?: string
}

export interface TicketUpdate {
  at: string
  author: string
  status: TicketStatus
  comment: string
}

export interface Ticket {
  key: string
  summary: string
  status: TicketStatus
  createdAt: string
  updates: TicketUpdate[]
  /** How many updates have been reported back to the user. */
  reported: number
}

export interface Message {
  id: string
  role: Role
  text: string
  kind?: 'ack' | 'triage' | 'ticket' | 'update' | 'text'
  triageId?: string
  ticketKey?: string
  attachment?: AttachmentKind
}

export interface ChatState {
  messages: Message[]
  triages: Record<string, Triage>
  tickets: Ticket[]
  suggestions: string[]
  nextTicketNumber: number
}

let seq = 0
const nextId = (prefix: string) => `${prefix}-${++seq}`
const now = () => new Date().toISOString()

export const attachmentLabels: Record<AttachmentKind, { label: string; transcription: string }> = {
  'vpn-error': {
    label: 'Screenshot: VPN error dialog',
    transcription: 'A dialog titled "VPN connection failed" with the text "Authentication failed. Check your credentials or contact your administrator."',
  },
  'outlook-error': {
    label: 'Screenshot: Outlook error',
    transcription: 'An Outlook window with the banner "Disconnected. Trying to connect..." and an empty inbox.',
  },
}

/** Fictional knowledge base. Titles and tags resemble the real articles, the content is generic. */
export const knowledgeBase: KbArticle[] = [
  {
    id: 'kb-password-reset',
    title: 'Reset or change your password',
    category: 'Accounts',
    keywords: ['password', 'reset', 'locked', 'lockout', 'expired', 'forgot', 'change password', 'sign in', 'login'],
    priority: 'Medium',
    steps: [
      'Go to the self-service reset page and sign in with your work email.',
      'Verify with the Authenticator app or a text code.',
      'Choose a new password with at least 14 characters that you have not used before.',
      'Lock and unlock your laptop so the new password syncs to Windows.',
    ],
  },
  {
    id: 'kb-vpn',
    title: 'VPN will not connect or keeps dropping',
    category: 'Network',
    keywords: ['vpn', 'connect', 'disconnect', 'dropping', 'tunnel', 'remote', 'authentication failed'],
    priority: 'Medium',
    steps: [
      'Check you are signed in to Windows with your work account and the time on the laptop is correct.',
      'Open the VPN client, choose Disconnect, wait ten seconds and connect again.',
      'If it still fails, restart the laptop. Updates often need a restart before the VPN adapter works.',
      'Try a different network, such as a phone hotspot, to rule out the local Wi-Fi.',
    ],
  },
  {
    id: 'kb-slow-computer',
    title: 'Computer is slow or freezing',
    category: 'Hardware',
    keywords: ['slow', 'freezing', 'freeze', 'hang', 'laggy', 'performance', 'fan', 'hot', 'crash'],
    priority: 'Low',
    steps: [
      'Restart the laptop fully (Start, Power, Restart) rather than closing the lid.',
      'Open Task Manager and close anything using most of the CPU or memory that you are not working in.',
      'Check Windows Update and install anything pending, then restart again.',
      'If it stays slow for more than a day, raise a ticket so IT can check the disk and memory.',
    ],
  },
  {
    id: 'kb-teams',
    title: 'Microsoft Teams audio, video or sign-in problems',
    category: 'Collaboration',
    keywords: ['teams', 'microphone', 'camera', 'audio', 'video', 'meeting', 'call', 'echo'],
    priority: 'Medium',
    steps: [
      'In Teams go to Settings, Devices and pick the correct microphone, speaker and camera.',
      'Quit Teams completely from the system tray and open it again.',
      'Check Windows privacy settings allow Teams to use the microphone and camera.',
      'Run the Teams test call from Settings, Devices to confirm.',
    ],
  },
  {
    id: 'kb-outlook',
    title: 'Outlook disconnected or not receiving email',
    category: 'Email',
    keywords: ['outlook', 'email', 'mail', 'disconnected', 'not receiving', 'sending', 'mailbox', 'calendar'],
    priority: 'Medium',
    steps: [
      'Check the status bar at the bottom of Outlook. If it says Working Offline, click Send/Receive, Work Offline to turn it off.',
      'Close Outlook and open it again. Sign in if prompted.',
      'Try Outlook on the web. If that works, the mailbox is fine and the desktop profile needs repairing.',
      'If web mail also fails, raise a ticket: the mailbox itself may need attention.',
    ],
  },
  {
    id: 'kb-wifi',
    title: 'Office Wi-Fi not connecting',
    category: 'Network',
    keywords: ['wifi', 'wi-fi', 'wireless', 'internet', 'no connection', 'network'],
    priority: 'Medium',
    steps: [
      'Forget the office network in Wi-Fi settings and join it again with your work account.',
      'Toggle aeroplane mode on and off.',
      'Check whether colleagues nearby are affected. If everyone is, it is likely an outage and IT already knows.',
    ],
  },
  {
    id: 'kb-printer',
    title: 'Printing problems',
    category: 'Hardware',
    keywords: ['print', 'printer', 'printing', 'scan', 'scanner', 'paper'],
    priority: 'Low',
    steps: [
      'Open Settings, Printers and check the office printer is not paused or offline.',
      'Remove the printer and add it again from the company printer list.',
      'Print a test page. If it fails on the printer itself, report the printer name in a ticket.',
    ],
  },
  {
    id: 'kb-mfa',
    title: 'Authenticator or MFA prompts not arriving',
    category: 'Accounts',
    keywords: ['mfa', 'authenticator', 'two-factor', '2fa', 'approve', 'code', 'new phone'],
    priority: 'High',
    steps: [
      'Open the Authenticator app and pull down to refresh; prompts sometimes wait for a sync.',
      'Check notifications are allowed for the app and the phone has internet access.',
      'If you have a new phone, you need IT to re-register the device. Raise a ticket and we will call you to verify.',
    ],
  },
  {
    id: 'kb-software',
    title: 'Installing approved software',
    category: 'Software',
    keywords: ['install', 'software', 'application', 'company portal', 'licence', 'license', 'app'],
    priority: 'Low',
    steps: [
      'Open Company Portal from the Start menu and search for the application.',
      'Click Install. Most apps appear within ten minutes.',
      'If the app is not listed, raise a ticket with the name and the reason you need it.',
    ],
  },
]

const defaultSuggestions = [
  'My VPN keeps disconnecting after the latest update',
  'I forgot my password and I am locked out',
  'Outlook says disconnected and no new mail arrives',
  'Any update on my ticket?',
]

const GREETING =
  'Hi, I am TISA, the Technical Information Support Assistant. Tell me what is going wrong, attach a screenshot if you have one, and I will check the knowledge base. If I cannot fix it, I can raise a ticket with IT and keep you posted.'

export function createInitialState(): ChatState {
  return {
    messages: [{ id: nextId('m'), role: 'bot', text: GREETING, kind: 'text' }],
    triages: {},
    tickets: [],
    suggestions: defaultSuggestions,
    nextTicketNumber: 1042,
  }
}

/* ------------------------------------------------------------------
   Knowledge base matching and triage
------------------------------------------------------------------- */

export function searchKnowledgeBase(text: string): { article: KbArticle; score: number }[] {
  const t = text.toLowerCase()
  return knowledgeBase
    .map((article) => ({ article, score: article.keywords.filter((k) => t.includes(k)).length }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
}

function priorityFor(text: string, article?: KbArticle): Priority {
  const t = text.toLowerCase()
  if (/\b(urgent|asap|cannot work|can't work|everyone|whole team|outage|client call|presentation)\b/.test(t)) return 'High'
  return article?.priority ?? 'Medium'
}

function summarise(text: string): string {
  const clean = text.trim().replace(/\s+/g, ' ')
  const first = clean.split(/(?<=[.!?])\s/)[0]
  const s = first.length > 90 ? `${first.slice(0, 87)}...` : first
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function triage(text: string, attachment?: AttachmentKind): Triage {
  const hits = searchKnowledgeBase(`${text} ${attachment ? attachmentLabels[attachment].transcription : ''}`)
  const article = hits[0]?.article
  const imageNote = attachment ? `From your screenshot: ${attachmentLabels[attachment].transcription}` : undefined
  if (!article) {
    return {
      id: nextId('t'),
      category: 'Other',
      priority: priorityFor(text),
      summary: summarise(text),
      resolved: false,
      steps: [],
      imageNote,
      status: 'open',
    }
  }
  return {
    id: nextId('t'),
    category: article.category,
    priority: priorityFor(text, article),
    summary: summarise(text),
    resolved: article.priority !== 'High',
    article,
    steps: article.steps,
    imageNote,
    status: 'open',
  }
}

/* ------------------------------------------------------------------
   Intents
------------------------------------------------------------------- */

export type Intent = 'greeting' | 'thanks' | 'ticket-update' | 'issue'

export function detectIntent(text: string): Intent {
  const t = text.trim().toLowerCase()
  if (/^(hi|hello|hey|good (morning|afternoon)|help|what can you do)\b/.test(t)) return 'greeting'
  if (/^(thanks|thank you|cheers|great|perfect|that worked)\b/.test(t)) return 'thanks'
  if (/\b(update|status|news|progress)\b.*\b(ticket|request|jira|issue)\b|\b(ticket|jira)\b.*\b(update|status|news|progress)\b|^any update/.test(t)) return 'ticket-update'
  return 'issue'
}

/* ------------------------------------------------------------------
   State transitions
------------------------------------------------------------------- */

export function addUserMessage(state: ChatState, text: string, attachment?: AttachmentKind): ChatState {
  return {
    ...state,
    messages: [...state.messages, { id: nextId('m'), role: 'user', text: text.trim(), attachment }],
    suggestions: [],
  }
}

function bot(state: ChatState, text: string, extra: Partial<ChatState> = {}, msg: Partial<Message> = {}): ChatState {
  return { ...state, ...extra, messages: [...state.messages, { id: nextId('m'), role: 'bot', text, kind: 'text', ...msg }] }
}

/** The quick acknowledgement the real bot sends before triage runs. */
export function acknowledge(state: ChatState): ChatState {
  const last = [...state.messages].reverse().find((m) => m.role === 'user')
  if (!last || detectIntent(last.text) !== 'issue') return state
  const text = last.attachment ? 'Thanks, I have your message and the screenshot. Reading it and checking the knowledge base now.' : 'Thanks, checking the knowledge base now. One moment.'
  return bot(state, text, {}, { kind: 'ack' })
}

/** Produces the substantive reply to the most recent user message. */
export function generateReply(state: ChatState): ChatState {
  const last = [...state.messages].reverse().find((m) => m.role === 'user')
  if (!last) return state
  const intent = detectIntent(last.text)

  switch (intent) {
    case 'greeting':
      return bot(state, 'Hello. Describe the problem in your own words, for example "VPN keeps dropping" or "I cannot sign in to Outlook". You can attach a screenshot of any error.', { suggestions: defaultSuggestions })
    case 'thanks':
      return bot(state, 'You are welcome. Message me any time something else comes up.', { suggestions: defaultSuggestions })
    case 'ticket-update':
      return reportTickets(state)
    default: {
      const t = triage(last.text, last.attachment)
      const lead = t.article
        ? `I found a matching article, "${t.article.title}". Here is what to try.`
        : 'I could not find a matching article for this one. I can raise a ticket so IT picks it up, or you can tell me more.'
      return bot(state, lead, { triages: { ...state.triages, [t.id]: t }, suggestions: [] }, { kind: 'triage', triageId: t.id })
    }
  }
}

/** Handles a button on a triage card. */
export function applyAction(state: ChatState, triageId: string, action: 'resolved' | 'ticket' | 'escalate'): ChatState {
  const t = state.triages[triageId]
  if (!t || t.status !== 'open') return state
  if (action === 'resolved') {
    return bot(state, 'Great, I have marked this as resolved and noted which article helped so the knowledge base keeps improving.', {
      triages: { ...state.triages, [t.id]: { ...t, status: 'resolved' } },
      suggestions: defaultSuggestions,
    })
  }
  if (action === 'escalate') {
    return bot(state, 'In the real bot this opens a pre-filled email to the IT team with your message, the triage summary and the screenshot description, so you only need to press send.', {
      triages: { ...state.triages, [t.id]: { ...t, status: 'escalated' } },
      suggestions: defaultSuggestions,
    })
  }
  const key = `TBTH-${state.nextTicketNumber}`
  const ticket: Ticket = { key, summary: t.summary, status: 'To Do', createdAt: now(), updates: [], reported: 0 }
  return bot(
    state,
    `Ticket ${key} created in Jira as a Task with priority ${t.priority}, assigned to the IT queue. It includes your message${t.imageNote ? ', the screenshot' : ''} and the steps already tried. Ask me "any update on my ticket?" whenever you like.`,
    {
      triages: { ...state.triages, [t.id]: { ...t, status: 'ticketed', ticketKey: key } },
      tickets: [...state.tickets, ticket],
      nextTicketNumber: state.nextTicketNumber + 1,
      suggestions: ['Any update on my ticket?', ...defaultSuggestions.slice(0, 2)],
    },
    { kind: 'ticket', ticketKey: key },
  )
}

/**
 * Reports ticket progress. To keep the demo lively, each enquiry lets the
 * simulated Jira move an open ticket forward by one stage, the way a real
 * ticket would gain comments over time.
 */
function reportTickets(state: ChatState): ChatState {
  if (state.tickets.length === 0) {
    return bot(state, 'I have not raised any tickets for you in this session. If something is still broken, describe it and I will take a look.', { suggestions: defaultSuggestions })
  }
  const tickets = state.tickets.map((tk) => {
    if (tk.status === 'Done') return tk
    const next: TicketUpdate =
      tk.status === 'To Do'
        ? { at: now(), author: 'IT service desk', status: 'In Progress', comment: 'Picked this up. Checking the logs from the device and will update shortly.' }
        : { at: now(), author: 'IT service desk', status: 'Done', comment: 'Fixed. The client profile was reset and tested from the device. Please reply if it happens again.' }
    return { ...tk, status: next.status, updates: [...tk.updates, next] }
  })
  const lines = tickets.map((tk) => {
    const unreported = tk.updates.slice(tk.reported)
    if (unreported.length === 0) return `${tk.key} (${tk.summary}): no new updates since I last checked. Status is still ${tk.status}.`
    const u = unreported[unreported.length - 1]
    return `${tk.key} (${tk.summary}): new comment from ${u.author}: "${u.comment}" Status is now ${u.status}.`
  })
  return bot(
    state,
    lines.join('\n\n'),
    {
      tickets: tickets.map((tk) => ({ ...tk, reported: tk.updates.length })),
      suggestions: tickets.some((tk) => tk.status !== 'Done') ? ['Any update on my ticket?', ...defaultSuggestions.slice(0, 2)] : defaultSuggestions,
    },
    { kind: 'update' },
  )
}
