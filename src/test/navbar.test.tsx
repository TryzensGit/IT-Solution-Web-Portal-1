import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../theme/ThemeProvider'
import { App } from '../App'

function renderApp() {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('mobile navigation', () => {
  it('opens, navigates, and closes after navigation', async () => {
    const user = userEvent.setup()
    renderApp()
    const toggle = screen.getByRole('button', { name: /open menu/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)
    expect(screen.getByRole('button', { name: /close menu/i })).toHaveAttribute('aria-expanded', 'true')
    const menu = document.getElementById('mobile-menu')
    expect(menu).not.toBeNull()

    const solutionsLink = menu!.querySelector('a[href="/solutions"]') as HTMLAnchorElement
    await user.click(solutionsLink)
    expect(await screen.findByRole('heading', { level: 1, name: /ai-driven it/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /open menu/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes on Escape and returns focus to the toggle', async () => {
    const user = userEvent.setup()
    renderApp()
    const toggle = screen.getByRole('button', { name: /open menu/i })
    await user.click(toggle)
    expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    const reopened = screen.getByRole('button', { name: /open menu/i })
    expect(reopened).toHaveAttribute('aria-expanded', 'false')
    expect(reopened).toHaveFocus()
  })
})
