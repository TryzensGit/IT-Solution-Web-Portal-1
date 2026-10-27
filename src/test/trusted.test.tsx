import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { TrustedBy } from '../components/home/TrustedBy'
import { trustedCompanies } from '../config/trusted'

describe('TrustedBy', () => {
  it('lists every company once for assistive technology', () => {
    render(<TrustedBy />)
    expect(screen.getByRole('heading', { name: /trusted by growing businesses/i })).toBeInTheDocument()
    const list = screen.getByRole('list', { name: /customers/i })
    expect(within(list).getAllByRole('listitem')).toHaveLength(trustedCompanies.length)
    // The visual duplicate exists but is hidden from the accessibility tree.
    expect(screen.getAllByText(trustedCompanies[0].name)).toHaveLength(2)
    expect(screen.getAllByRole('list')).toHaveLength(1)
  })

  it('can be paused and resumed', () => {
    const { container } = render(<TrustedBy />)
    const toggle = screen.getByRole('button', { name: /pause logo scrolling/i })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: /resume logo scrolling/i })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('.marquee')).toHaveAttribute('data-paused')
  })

  it('every entry has a sector label and a known icon', () => {
    for (const c of trustedCompanies) {
      expect(c.sector.length).toBeGreaterThan(0)
      expect(c.name.length).toBeGreaterThan(0)
    }
    const names = new Set(trustedCompanies.map((c) => c.name))
    expect(names.size).toBe(trustedCompanies.length)
  })
})
