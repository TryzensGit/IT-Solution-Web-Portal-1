import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { buildContact, hasContactChannel } from '../config/contact'
import { ContactCard } from '../components/home/ContactSection'

function renderCard(contact: ReturnType<typeof buildContact>) {
  return render(
    <MemoryRouter>
      <ContactCard contact={contact} />
    </MemoryRouter>,
  )
}

describe('buildContact', () => {
  it('keeps only valid channels', () => {
    const c = buildContact({
      name: 'Setup team',
      email: 'setup@example.com',
      phone: '+44 20 7946 0000',
      url: 'https://outlook.office.com/book/example',
      urlLabel: 'Book a call',
    })
    expect(c.email).toBe('setup@example.com')
    expect(c.phone).toEqual({ display: '+44 20 7946 0000', href: 'tel:+442079460000' })
    expect(c.bookingUrl).toBe('https://outlook.office.com/book/example')
    expect(c.bookingLabel).toBe('Book a call')
    expect(hasContactChannel(c)).toBe(true)
  })

  it('recognises LinkedIn and Teams links and picks a default label', () => {
    const li = buildContact({ url: 'https://www.linkedin.com/in/example/' })
    expect(li.bookingKind).toBe('linkedin')
    expect(li.bookingLabel).toBe('Connect on LinkedIn')
    const teams = buildContact({ url: 'https://teams.microsoft.com/l/chat/0/0?users=x' })
    expect(teams.bookingKind).toBe('teams')
    expect(buildContact({ url: 'https://outlook.office.com/book/x' }).bookingKind).toBe('link')
  })

  it('drops malformed values', () => {
    const c = buildContact({ email: 'not-an-email', phone: '12', url: 'javascript:alert(1)' })
    expect(c.email).toBeUndefined()
    expect(c.phone).toBeUndefined()
    expect(c.bookingUrl).toBeUndefined()
    expect(hasContactChannel(c)).toBe(false)
    expect(c.name).toBe('IT solutions team')
  })
})

describe('ContactCard', () => {
  it('renders both audiences', () => {
    renderCard(buildContact({}))
    expect(screen.getByRole('heading', { name: /new and existing enterprises/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /small startups/i })).toBeInTheDocument()
  })

  it('shows a not-configured message when no channel is set', () => {
    renderCard(buildContact({}))
    expect(screen.getByRole('status')).toHaveTextContent(/have not been added yet/i)
    expect(screen.queryByRole('link', { name: /email/i })).not.toBeInTheDocument()
  })

  it('renders the configured channels as safe links', () => {
    renderCard(
      buildContact({
        email: 'setup@example.com',
        phone: '+44 20 7946 0000',
        url: 'https://outlook.office.com/book/example',
      }),
    )
    expect(screen.getByRole('link', { name: /email/i })).toHaveAttribute(
      'href',
      'mailto:setup@example.com?subject=IT%20solution%20setup%20enquiry',
    )
    expect(screen.getByRole('link', { name: /phone/i })).toHaveAttribute('href', 'tel:+442079460000')
    const booking = screen.getByRole('link', { name: /book a conversation/i })
    expect(booking).toHaveAttribute('target', '_blank')
    expect(booking).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows the LinkedIn mark on a LinkedIn link', () => {
    renderCard(buildContact({ url: 'https://www.linkedin.com/in/example/', urlLabel: 'Chat via LinkedIn' }))
    const link = screen.getByRole('link', { name: /chat via linkedin/i })
    expect(link.querySelector('[data-icon="linkedin"]')).not.toBeNull()
  })
})
