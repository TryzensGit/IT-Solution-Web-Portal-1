import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../theme/ThemeProvider'
import { App } from '../App'
import { demoCredentials } from '../config/demo'
import { authenticate } from '../demo/shared/session'
import { seedAssets } from '../demo/asset-management/data'

function renderAt(path: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

const admin = demoCredentials.find((c) => c.role === 'admin')!
const user = demoCredentials.find((c) => c.role === 'user')!

async function signIn(username: string, password: string) {
  const u = userEvent.setup()
  await u.type(screen.getByLabelText(/username/i), username)
  await u.type(screen.getByLabelText(/password/i), password)
  await u.click(screen.getByRole('button', { name: /^sign in$/i }))
  return u
}

beforeEach(() => {
  sessionStorage.clear()
})

describe('demo credentials', () => {
  it('accepts both demo accounts and rejects anything else', () => {
    expect(authenticate(admin.username, admin.password)?.role).toBe('admin')
    expect(authenticate(user.username.toUpperCase(), user.password)?.role).toBe('user')
    expect(authenticate(admin.username, 'wrong')).toBeNull()
    expect(authenticate('', '')).toBeNull()
  })

  it('are listed on the application pages that have a demo', () => {
    renderAt('/applications/asset-management')
    const card = screen.getByRole('region', { name: /try asset management in a demo/i })
    expect(within(card).getByText(admin.username)).toBeInTheDocument()
    expect(within(card).getByText(admin.password)).toBeInTheDocument()
    expect(within(card).getByText(user.username)).toBeInTheDocument()
    expect(within(card).getByRole('link', { name: /open the demo/i })).toHaveAttribute('href', '/demo/asset-management')
  })

  it('are not shown for applications without a demo', () => {
    renderAt('/applications/tisa-assistant')
    expect(screen.queryByRole('region', { name: /in a demo/i })).not.toBeInTheDocument()
  })
})

describe('Asset Management demo', () => {
  it('shows a login page without a company logo and rejects bad credentials', async () => {
    renderAt('/demo/asset-management')
    expect(await screen.findByRole('heading', { level: 1, name: /it asset inventory/i })).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    await signIn(admin.username, 'nope')
    expect(screen.getByRole('alert')).toHaveTextContent(/invalid username or password/i)
  })

  it('signs in as admin with the audit log and lets you add an asset', async () => {
    renderAt('/demo/asset-management')
    await screen.findByRole('heading', { level: 1 })
    const u = await signIn(admin.username, admin.password)
    expect(screen.getByRole('tab', { name: /audit log/i })).toBeInTheDocument()
    expect(screen.getByText(/demo environment with sample data only/i)).toBeInTheDocument()

    await u.click(screen.getByRole('tab', { name: /^assets$/i }))
    expect(screen.getByText(`${seedAssets().length} of ${seedAssets().length} assets`)).toBeInTheDocument()

    await u.click(screen.getByRole('button', { name: /add asset/i }))
    const dialog = screen.getByRole('dialog', { name: /add asset/i })
    await u.type(within(dialog).getByLabelText(/device \/ display name/i), 'LT-TEST-99')
    await u.type(within(dialog).getByLabelText(/make \/ model/i), 'Test Laptop 1')
    await u.type(within(dialog).getByLabelText(/serial number/i), 'TEST-SERIAL-99')
    await u.click(within(dialog).getByRole('button', { name: /save asset/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('LT-TEST-99')).toBeInTheDocument()
    expect(screen.getByText(`${seedAssets().length + 1} of ${seedAssets().length + 1} assets`)).toBeInTheDocument()
  })

  it('hides the audit log and settings from a standard user', async () => {
    renderAt('/demo/asset-management')
    await screen.findByRole('heading', { level: 1 })
    const u = await signIn(user.username, user.password)
    expect(screen.queryByRole('tab', { name: /audit log/i })).not.toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: /demo user/i }))
    expect(screen.queryByRole('menuitem', { name: /settings/i })).not.toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /sign out/i })).toBeInTheDocument()
  })
})

describe('User Management demo', () => {
  it('signs in and shows the lifecycle tabs, with audit for admins only', async () => {
    renderAt('/demo/user-management')
    expect(await screen.findByRole('heading', { level: 1, name: /user management/i })).toBeInTheDocument()
    const u = await signIn(admin.username, admin.password)
    for (const tab of ['Active', 'Offboarded', 'AD Users', 'Entra ID Users', 'Groups', 'Licenses', 'Scheduled', 'Audit']) {
      expect(screen.getByRole('tab', { name: tab })).toBeInTheDocument()
    }
    expect(screen.getByText('Priya Natarajan')).toBeInTheDocument()

    await u.click(screen.getByRole('button', { name: /offboard priya natarajan/i }))
    const dialog = screen.getByRole('dialog', { name: /offboard user/i })
    await u.type(within(dialog).getByLabelText(/ticket number/i), 'INC0099999')
    await u.click(within(dialog).getByRole('button', { name: /confirm offboard/i }))
    expect(screen.queryByText('Priya Natarajan')).not.toBeInTheDocument()

    await u.click(screen.getByRole('tab', { name: 'Offboarded' }))
    expect(screen.getByText('Priya Natarajan')).toBeInTheDocument()
    expect(screen.getByText('INC0099999')).toBeInTheDocument()
  })

  it('limits a standard user to AD-only onboarding', async () => {
    renderAt('/demo/user-management')
    await screen.findByRole('heading', { level: 1 })
    const u = await signIn(user.username, user.password)
    expect(screen.queryByRole('tab', { name: 'Audit' })).not.toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: /onboard user/i }))
    expect(screen.getByRole('dialog', { name: /onboard new user/i })).toHaveTextContent(/creates the on-prem ad account only/i)
  })
})
