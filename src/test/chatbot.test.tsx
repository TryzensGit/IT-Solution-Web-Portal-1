import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ChatbotPromo } from '../components/home/ChatbotPromo'
import { getApplication } from '../config/applications'
import { brand } from '../config/brand'

describe('ChatbotPromo', () => {
  it('promotes the chatbot as a configuration tool for Azure and Teams', () => {
    render(
      <MemoryRouter>
        <ChatbotPromo />
      </MemoryRouter>,
    )
    const section = screen.getByRole('region', { name: /set up enterprise azure and microsoft teams/i })
    expect(within(section).getAllByText(brand.assistantName, { exact: false }).length).toBeGreaterThan(0)
    expect(within(section).getByRole('link', { name: /meet the chatbot/i })).toHaveAttribute('href', '/applications/tisa-assistant')
    expect(within(section).getByRole('figure', { name: /illustration/i })).toBeInTheDocument()
  })

  it('shows the same capabilities as the catalog entry', () => {
    render(
      <MemoryRouter>
        <ChatbotPromo />
      </MemoryRouter>,
    )
    for (const c of getApplication('tisa-assistant')!.capabilities) {
      expect(screen.getByText(c.title)).toBeInTheDocument()
    }
  })

  it('names the chatbot consistently', () => {
    expect(brand.assistantName).toMatch(/chatbot/i)
    expect(getApplication('tisa-assistant')?.name).toMatch(/chatbot/i)
  })
})
