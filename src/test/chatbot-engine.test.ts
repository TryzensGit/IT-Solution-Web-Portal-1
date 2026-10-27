import { describe, expect, it } from 'vitest'
import {
  acknowledge,
  addUserMessage,
  applyAction,
  createInitialState,
  detectIntent,
  generateReply,
  searchKnowledgeBase,
  triage,
  type ChatState,
} from '../demo/chatbot/engine'

function say(state: ChatState, text: string, attachment?: 'vpn-error' | 'outlook-error'): ChatState {
  return generateReply(acknowledge(addUserMessage(state, text, attachment)))
}

function lastTriage(state: ChatState) {
  const msg = [...state.messages].reverse().find((m) => m.triageId)
  return msg ? state.triages[msg.triageId!] : undefined
}

describe('support assistant engine', () => {
  it('greets and offers suggestions', () => {
    const s = createInitialState()
    expect(s.messages[0].text).toMatch(/Technical Information Support Assistant/)
    expect(s.suggestions.length).toBeGreaterThan(0)
  })

  it('detects intents', () => {
    expect(detectIntent('hi there')).toBe('greeting')
    expect(detectIntent('thanks, that worked')).toBe('thanks')
    expect(detectIntent('Any update on my ticket?')).toBe('ticket-update')
    expect(detectIntent('what is the status of my jira ticket')).toBe('ticket-update')
    expect(detectIntent('My VPN keeps disconnecting')).toBe('issue')
  })

  it('matches knowledge base articles by keywords', () => {
    const hits = searchKnowledgeBase('I forgot my password and I am locked out')
    expect(hits[0].article.id).toBe('kb-password-reset')
    expect(searchKnowledgeBase('my pet goldfish is sad')).toHaveLength(0)
  })

  it('acknowledges first, then replies with a triage card', () => {
    const acked = acknowledge(addUserMessage(createInitialState(), 'Outlook says disconnected and no new mail arrives'))
    expect(acked.messages.at(-1)?.kind).toBe('ack')
    const s = generateReply(acked)
    const t = lastTriage(s)!
    expect(t.category).toBe('Email')
    expect(t.article?.id).toBe('kb-outlook')
    expect(t.steps.length).toBeGreaterThan(0)
    expect(t.status).toBe('open')
  })

  it('uses the screenshot transcription and raises priority for urgent wording', () => {
    const t = triage('It fails every time, urgent, client call in ten minutes', 'vpn-error')
    expect(t.imageNote).toMatch(/VPN connection failed/)
    expect(t.article?.id).toBe('kb-vpn')
    expect(t.priority).toBe('High')
  })

  it('falls back honestly when nothing matches', () => {
    const s = say(createInitialState(), 'The coffee machine on floor two is making a noise')
    const t = lastTriage(s)!
    expect(t.category).toBe('Other')
    expect(t.article).toBeUndefined()
    expect(s.messages.at(-1)?.text).toMatch(/could not find a matching article/i)
  })

  it('creates a ticket from the card and reports updates on request', () => {
    let s = say(createInitialState(), 'My VPN keeps disconnecting after the latest update')
    const t = lastTriage(s)!
    s = applyAction(s, t.id, 'ticket')
    expect(s.tickets).toHaveLength(1)
    expect(s.tickets[0].key).toBe('TBTH-1042')
    expect(s.triages[t.id].status).toBe('ticketed')
    expect(s.messages.at(-1)?.text).toMatch(/TBTH-1042 created in Jira/)
    // Card actions are one-shot.
    expect(applyAction(s, t.id, 'resolved')).toBe(s)

    s = say(s, 'Any update on my ticket?')
    expect(s.messages.at(-1)?.text).toMatch(/In Progress/)
    s = say(s, 'Any update on my ticket?')
    expect(s.messages.at(-1)?.text).toMatch(/Done/)
    s = say(s, 'Any update on my ticket?')
    expect(s.messages.at(-1)?.text).toMatch(/no new updates/i)
  })

  it('reports when no tickets exist, and handles resolved and escalate', () => {
    let s = say(createInitialState(), 'any update on my ticket?')
    expect(s.messages.at(-1)?.text).toMatch(/not raised any tickets/i)
    s = say(s, 'Teams microphone is not working in meetings')
    const t = lastTriage(s)!
    const resolved = applyAction(s, t.id, 'resolved')
    expect(resolved.triages[t.id].status).toBe('resolved')
    const escalated = applyAction(s, t.id, 'escalate')
    expect(escalated.triages[t.id].status).toBe('escalated')
    expect(escalated.messages.at(-1)?.text).toMatch(/pre-filled email/i)
  })
})
