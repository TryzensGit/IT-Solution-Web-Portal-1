import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ChatbotPromo } from '../components/home/ChatbotPromo'
import { getApplication } from '../config/applications'
import { brand } from '../config/brand'

function renderPromo() {
  return render(
    <MemoryRouter>
      <ChatbotPromo />
    </MemoryRouter>,
  )
}

describe('ChatbotPromo', () => {
  it('promotes the assistant as first-line IT support in Teams', () => {
    renderPromo()
    const section = screen.getByRole('region', { name: /first-line it support, inside microsoft teams/i })
    expect(within(section).getAllByText(brand.assistantName, { exact: false }).length).toBeGreaterThan(0)
    expect(within(section).getAllByText(/knowledge base/i).length).toBeGreaterThan(0)
    expect(within(section).getByRole('link', { name: /meet the assistant/i })).toHaveAttribute('href', '/applications/tisa-assistant')
    expect(within(section).getByRole('link', { name: /try the chat demo/i })).toHaveAttribute('href', '/demo/tisa-assistant')
    expect(within(section).getByRole('figure', { name: /illustration/i })).toBeInTheDocument()
  })

  it('shows the end-to-end flow the real bot follows', () => {
    renderPromo()
    for (const step of ['Message in Teams', 'Instant acknowledgement', 'Knowledge base and triage', 'Fix, ticket or escalate']) {
      expect(screen.getByText(step)).toBeInTheDocument()
    }
  })

  it('names the assistant consistently and truthfully', () => {
    expect(brand.assistantName).toMatch(/support assistant/i)
    const app = getApplication('tisa-assistant')!
    expect(app.name).toMatch(/support assistant/i)
    expect(app.capabilities.map((c) => c.title).join(' ')).toMatch(/knowledge base/i)
    expect(app.capabilities.map((c) => c.title).join(' ')).toMatch(/jira/i)
    expect(app.description).not.toMatch(/azure/i)
  })
})
