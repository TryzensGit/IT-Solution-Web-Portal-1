import type { IconName } from '../components/ui/AppIcon'

/**
 * Application catalog.
 *
 * To add a new application, add an entry here. The launcher grid, the
 * /applications index and the /applications/:slug launch page are all
 * generated from this list. Destination URLs come from environment
 * variables so they are never hardcoded in components.
 */

export type AppStatus = 'available' | 'maintenance' | 'coming-soon'

export type AppCategoryId =
  | 'identity-access'
  | 'endpoint-management'
  | 'it-service-desk'
  | 'security-compliance'
  | 'ai-automation'

export interface AppCategory {
  id: AppCategoryId
  label: string
}

export interface AppDefinition {
  /** Stable identifier, also the route slug under /applications/. */
  id: string
  name: string
  /** One-line description for cards. */
  summary: string
  /** Longer description for the launch page. */
  description: string
  icon: IconName
  category: AppCategoryId
  /** Destination. `external` opens in a new tab, `internal` uses the router. */
  destination: {
    type: 'external' | 'internal'
    url: string | undefined
  }
  /** Explicitly configured static label. Omit to hide the indicator. */
  status?: AppStatus
  /** Capabilities shown on the launch page. Keep these truthful. */
  capabilities: { title: string; detail: string }[]
  /** Label for the primary action. */
  launchLabel: string
  /** Short note displayed next to the launch action, e.g. where it opens. */
  launchNote?: string
}

export const categories: AppCategory[] = [
  { id: 'identity-access', label: 'Identity and access' },
  { id: 'endpoint-management', label: 'Endpoint management' },
  { id: 'it-service-desk', label: 'IT service desk' },
  { id: 'security-compliance', label: 'Security and compliance' },
  { id: 'ai-automation', label: 'AI automation' },
]

export function readStatus(value: string | undefined): AppStatus | undefined {
  const v = value?.trim().toLowerCase()
  if (v === 'available' || v === 'maintenance' || v === 'coming-soon') return v
  return undefined
}

function readUrl(value: string | undefined): string | undefined {
  const v = value?.trim()
  return v ? v : undefined
}

export const applications: AppDefinition[] = [
  {
    id: 'user-management',
    name: 'User Management',
    summary: 'Onboard and offboard people, and manage the IT services they depend on.',
    description:
      'One place for the joiner and leaver work that keeps IT running: bringing new people on, giving them what they need, and closing everything down cleanly when they leave. Open the application to work with user records according to the permissions you already have.',
    icon: 'users',
    category: 'identity-access',
    destination: { type: 'external', url: readUrl(import.meta.env.VITE_USER_MANAGEMENT_URL) },
    status: readStatus(import.meta.env.VITE_USER_MANAGEMENT_STATUS),
    capabilities: [
      { title: 'Onboarding', detail: 'Set up new users with the accounts, devices and services they need from day one.' },
      { title: 'Offboarding', detail: 'Close access, recover equipment and retire services when someone leaves.' },
      {
        title: 'Service management',
        detail: 'Support for security, enterprise app services, automation and other services tied to a user.',
      },
      { title: 'Role-aware access', detail: 'The application enforces its own authentication and permissions.' },
    ],
    launchLabel: 'Open User Management',
    launchNote: 'Opens in a new tab',
  },
  {
    id: 'asset-management',
    name: 'Asset Management',
    summary: 'Track laptops, servers, workstations, mobile devices and the services behind them.',
    description:
      'The inventory of what your organisation runs on, from the laptop on a desk to the servers, virtual machines and storage behind the scenes. Open the application to onboard, assign, track and retire IT resources.',
    icon: 'monitor',
    category: 'endpoint-management',
    destination: { type: 'external', url: readUrl(import.meta.env.VITE_ASSET_MANAGEMENT_URL) },
    status: readStatus(import.meta.env.VITE_ASSET_MANAGEMENT_STATUS),
    capabilities: [
      {
        title: 'Devices and hardware',
        detail: 'Laptops, servers, workstations and mobile devices, with who they are assigned to.',
      },
      {
        title: 'Infrastructure services',
        detail: 'Virtual machines, app services, storage, security and automation services alongside physical assets.',
      },
      { title: 'Onboarding and offboarding', detail: 'Bring resources into service and retire them with a clear record.' },
      { title: 'Lifecycle tracking', detail: 'Follow each resource from procurement through assignment to retirement.' },
    ],
    launchLabel: 'Open Asset Management',
    launchNote: 'Opens in a new tab',
  },
  {
    id: 'tisa-assistant',
    name: 'TISA AI Assistant',
    summary: 'Explore AI-powered IT assistance through Microsoft Teams.',
    description:
      'A conversational assistant built for Microsoft Teams, so colleagues can ask IT questions where they already work. The launch button opens the configured assistant destination; this page is an overview, not the assistant itself.',
    icon: 'bot',
    category: 'ai-automation',
    destination: { type: 'external', url: readUrl(import.meta.env.VITE_TISA_TEAMS_URL) },
    status: readStatus(import.meta.env.VITE_TISA_TEAMS_STATUS),
    capabilities: [
      { title: 'Conversational IT help', detail: 'Ask questions in plain language from a Teams chat.' },
      { title: 'Guided troubleshooting', detail: 'Work through common issues step by step before raising a ticket.' },
      { title: 'Routing to IT support', detail: 'Hand off to the IT team when a question needs a person.' },
    ],
    launchLabel: 'Open TISA Assistant',
    launchNote: 'Opens in a new tab',
  },
]

export function getApplication(id: string | undefined): AppDefinition | undefined {
  return applications.find((app) => app.id === id)
}

export function getCategory(id: AppCategoryId): AppCategory {
  return categories.find((c) => c.id === id) ?? { id, label: id }
}

/** Categories that actually have applications, in declaration order. */
export function populatedCategories(): AppCategory[] {
  return categories.filter((c) => applications.some((a) => a.category === c.id))
}
