import { validateDestination } from '../lib/url'

/**
 * Contact details for IT solution setup enquiries. Everything comes from
 * environment variables so the portal never shows invented contact
 * information. Leave a value empty to hide that channel.
 */
export interface ContactConfig {
  /** Team or person name shown on the card. */
  name: string
  /** Validated mailto address, or undefined. */
  email?: string
  /** Display phone number and a tel: href, or undefined. */
  phone?: { display: string; href: string }
  /** Validated HTTPS link such as a booking page, LinkedIn profile or Teams chat, or undefined. */
  bookingUrl?: string
  /** Label for the booking link. */
  bookingLabel: string
  /** What kind of destination the link is, used to pick its icon and default label. */
  bookingKind: BookingKind
}

export type BookingKind = 'linkedin' | 'teams' | 'link'

function detectKind(href: string | undefined): BookingKind {
  if (!href) return 'link'
  try {
    const host = new URL(href).hostname.toLowerCase()
    if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) return 'linkedin'
    if (host === 'teams.microsoft.com' || host.endsWith('.teams.microsoft.com')) return 'teams'
  } catch {
    /* already validated; fall through */
  }
  return 'link'
}

const defaultLabels: Record<BookingKind, string> = {
  linkedin: 'Connect on LinkedIn',
  teams: 'Chat in Microsoft Teams',
  link: 'Book a conversation',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function readEmail(value: string | undefined): string | undefined {
  const v = value?.trim()
  return v && EMAIL_PATTERN.test(v) ? v : undefined
}

function readPhone(value: string | undefined): ContactConfig['phone'] | undefined {
  const display = value?.trim()
  if (!display) return undefined
  const digits = display.replace(/[^\d+]/g, '')
  if (digits.replace('+', '').length < 6) return undefined
  return { display, href: `tel:${digits}` }
}

function readLink(value: string | undefined): string | undefined {
  const check = validateDestination(value, 'external')
  return check.ok ? check.href : undefined
}

export function buildContact(env: {
  name?: string
  email?: string
  phone?: string
  url?: string
  urlLabel?: string
}): ContactConfig {
  const bookingUrl = readLink(env.url)
  const bookingKind = detectKind(bookingUrl)
  return {
    name: env.name?.trim() || 'IT solutions team',
    email: readEmail(env.email),
    phone: readPhone(env.phone),
    bookingUrl,
    bookingLabel: env.urlLabel?.trim() || defaultLabels[bookingKind],
    bookingKind,
  }
}

export const contact: ContactConfig = buildContact({
  name: import.meta.env.VITE_CONTACT_NAME,
  email: import.meta.env.VITE_CONTACT_EMAIL,
  phone: import.meta.env.VITE_CONTACT_PHONE,
  url: import.meta.env.VITE_CONTACT_URL,
  urlLabel: import.meta.env.VITE_CONTACT_URL_LABEL,
})

export function hasContactChannel(c: ContactConfig): boolean {
  return Boolean(c.email || c.phone || c.bookingUrl)
}

/** Audiences the setup service is aimed at. Shown on the contact card. */
export const setupAudiences: { title: string; description: string; points: string[] }[] = [
  {
    title: 'New and existing enterprises',
    description: 'Standardise how people, devices and services are set up and run across the organisation.',
    points: [
      'Onboarding and offboarding for users and devices',
      'Microsoft 365, endpoint and security baselines',
      'Virtual machines, app services and storage',
      'Automation and the support assistant in Microsoft Teams',
    ],
  },
  {
    title: 'Small startups',
    description: 'Get a sound IT foundation early, without hiring a full IT function on day one.',
    points: [
      'Accounts, laptops and mobile devices ready for new hires',
      'Secure-by-default workspace setup',
      'Asset records from the first purchase',
      'A clear path to grow into the full platform',
    ],
  },
]
