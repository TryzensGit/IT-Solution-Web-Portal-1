import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { AppDefinition } from '../config/applications'
import { ApplicationCard } from '../components/home/ApplicationCard'
import { resolveLaunch } from '../lib/launch'
import { getRecentApps } from '../lib/recent'

const base: AppDefinition = {
  id: 'demo',
  name: 'Demo App',
  summary: 'A demo.',
  description: 'A longer demo.',
  icon: 'users',
  category: 'identity-access',
  destination: { type: 'external', url: 'https://demo.example.com' },
  capabilities: [{ title: 'x', detail: 'y' }],
  launchLabel: 'Open Demo',
  launchNote: 'Opens in a new tab',
  demo: { path: '/demo/demo', summary: 'A demo.', signIn: false },
}

function renderCard(app: AppDefinition) {
  return render(
    <MemoryRouter>
      <ApplicationCard app={app} />
    </MemoryRouter>,
  )
}

describe('resolveLaunch', () => {
  it('returns a safe href for a valid destination', () => {
    expect(resolveLaunch(base)).toEqual({ href: 'https://demo.example.com/', external: true })
  })
  it('blocks missing, invalid and coming-soon destinations with a message', () => {
    expect(resolveLaunch({ ...base, destination: { type: 'external', url: undefined } }).blocked).toBe('missing')
    expect(resolveLaunch({ ...base, destination: { type: 'external', url: 'ftp://x' } }).blocked).toBe('invalid')
    expect(resolveLaunch({ ...base, status: 'coming-soon' }).blocked).toBe('coming-soon')
  })
})

describe('ApplicationCard', () => {
  beforeEach(() => localStorage.clear())

  it('renders the configured URL as a new-tab link with safe rel', async () => {
    renderCard(base)
    const link = screen.getByRole('link', { name: /open demo/i })
    expect(link).toHaveAttribute('href', 'https://demo.example.com/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByText('Opens in a new tab')).toBeInTheDocument()
  })

  it('records the app as recently opened on launch', async () => {
    const user = userEvent.setup()
    renderCard(base)
    const link = screen.getByRole('link', { name: /open demo/i })
    // jsdom does not navigate; prevent the default to keep the test quiet.
    link.addEventListener('click', (e) => e.preventDefault())
    await user.click(link)
    expect(getRecentApps()).toEqual(['demo'])
    expect(screen.getByText(/opening/i)).toBeInTheDocument()
  })

  it('shows a helpful message instead of a link when the URL is missing', async () => {
    const user = userEvent.setup()
    renderCard({ ...base, destination: { type: 'external', url: undefined } })
    expect(screen.queryByRole('link', { name: /open demo/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /not configured/i }))
    expect(screen.getByRole('status')).toHaveTextContent(/does not have a destination configured/i)
  })

  it('shows a helpful message when the URL is invalid', async () => {
    const user = userEvent.setup()
    renderCard({ ...base, destination: { type: 'external', url: 'javascript:alert(1)' } })
    await user.click(screen.getByRole('button', { name: /not configured/i }))
    expect(screen.getByRole('status')).toHaveTextContent(/not a valid https url/i)
  })

  it('does not offer a launch for coming-soon applications', async () => {
    const user = userEvent.setup()
    renderCard({ ...base, status: 'coming-soon' })
    expect(screen.getByText('Coming soon')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /not yet available/i }))
    expect(screen.getByRole('status')).toHaveTextContent(/not available yet/i)
  })
})
