import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../theme/ThemeProvider'
import { App } from '../App'

function renderAt(path: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('routing', () => {
  it('renders the home page with hero and the three application cards', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1, name: /intelligent it/i })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3, name: 'User Management' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('heading', { level: 3, name: 'Asset Management' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('heading', { level: 3, name: 'TISA AI Assistant' }).length).toBeGreaterThan(0)
  })

  it('renders the solutions page', () => {
    renderAt('/solutions')
    expect(screen.getByRole('heading', { level: 1, name: /ai-driven it/i })).toBeInTheDocument()
  })

  it('renders the applications index', () => {
    renderAt('/applications')
    expect(screen.getByRole('heading', { level: 1, name: 'Applications' })).toBeInTheDocument()
  })

  it.each(['user-management', 'asset-management', 'tisa-assistant'])('renders the launch page for %s', (slug) => {
    renderAt(`/applications/${slug}`)
    expect(screen.getByRole('link', { name: /back to portal/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('shows a not-found page for unknown applications and routes', () => {
    renderAt('/applications/does-not-exist')
    expect(screen.getByRole('heading', { level: 1, name: /does not exist/i })).toBeInTheDocument()
  })
})
