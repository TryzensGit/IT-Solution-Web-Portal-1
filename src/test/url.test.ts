import { describe, expect, it } from 'vitest'
import { validateDestination } from '../lib/url'

describe('validateDestination', () => {
  it('rejects empty values as missing', () => {
    expect(validateDestination(undefined, 'external')).toEqual({ ok: false, reason: 'missing' })
    expect(validateDestination('   ', 'external')).toEqual({ ok: false, reason: 'missing' })
  })

  it('accepts https external destinations', () => {
    const r = validateDestination('https://users.example.com/app', 'external')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.href).toBe('https://users.example.com/app')
  })

  it('accepts Teams deep links over https', () => {
    expect(validateDestination('https://teams.microsoft.com/l/app/abc', 'external').ok).toBe(true)
  })

  it('allows plain http only for localhost', () => {
    expect(validateDestination('http://localhost:5173/x', 'external').ok).toBe(true)
    expect(validateDestination('http://example.com', 'external')).toEqual({ ok: false, reason: 'invalid' })
  })

  it('rejects dangerous schemes', () => {
    expect(validateDestination('javascript:alert(1)', 'external').ok).toBe(false)
    expect(validateDestination('data:text/html,hi', 'external').ok).toBe(false)
    expect(validateDestination('//evil.example.com', 'external').ok).toBe(false)
    expect(validateDestination('not a url', 'external').ok).toBe(false)
  })

  it('only accepts root-relative paths for internal destinations', () => {
    expect(validateDestination('/tools/x', 'internal').ok).toBe(true)
    expect(validateDestination('//evil.example.com', 'internal').ok).toBe(false)
    expect(validateDestination('https://example.com', 'internal').ok).toBe(false)
  })
})
