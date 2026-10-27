/**
 * Destination URL validation.
 *
 * External destinations must be absolute HTTPS URLs. Plain HTTP is only
 * tolerated for localhost so local development works. Internal
 * destinations must be root-relative paths. Anything else is rejected,
 * which prevents javascript:, data: and protocol-relative redirects.
 */

export type DestinationCheck =
  | { ok: true; href: string; kind: 'external' | 'internal' }
  | { ok: false; reason: 'missing' | 'invalid' }

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

export function validateDestination(
  url: string | undefined,
  type: 'external' | 'internal',
): DestinationCheck {
  const value = url?.trim()
  if (!value) return { ok: false, reason: 'missing' }

  if (type === 'internal') {
    if (value.startsWith('/') && !value.startsWith('//')) {
      return { ok: true, href: value, kind: 'internal' }
    }
    return { ok: false, reason: 'invalid' }
  }

  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    return { ok: false, reason: 'invalid' }
  }

  if (parsed.protocol === 'https:') {
    return { ok: true, href: parsed.toString(), kind: 'external' }
  }
  if (parsed.protocol === 'http:' && LOCAL_HOSTS.has(parsed.hostname)) {
    return { ok: true, href: parsed.toString(), kind: 'external' }
  }
  return { ok: false, reason: 'invalid' }
}
