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
    summary: 'Manage user-related IT operations through a centralized application.',
    description:
      'A single place for the day-to-day work of managing people in your IT estate. Open the application to view and administer user records according to the permissions you already have.',
    icon: 'users',
    category: 'identity-access',
    destination: { type: 'external', url: readUrl(import.meta.env.VITE_USER_MANAGEMENT_URL) },
    status: readStatus(import.meta.env.VITE_USER_MANAGEMENT_STATUS),
    capabilities: [
      { title: 'Centralized user records', detail: 'Find and review user information from one application.' },
      { title: 'Operational workflows', detail: 'Carry out routine user-related IT tasks in a consistent way.' },
      { title: 'Role-aware access', detail: 'The application enforces its own authentication and permissions.' },
    ],
    launchLabel: 'Open User Management',
    launchNote: 'Opens in a new tab',
  },
  {
    id: 'asset-management',
    name: 'Asset Management',
    summary: 'Access tools for managing and tracking IT assets.',
    description:
      'Track hardware, software and the people they belong to across their lifecycle. Open the application to work with the asset inventory your team already maintains.',
    icon: 'monitor',
    category: 'endpoint-management',
    destination: { type: 'external', url: readUrl(import.meta.env.VITE_ASSET_MANAGEMENT_URL) },
    status: readStatus(import.meta.env.VITE_ASSET_MANAGEMENT_STATUS),
    capabilities: [
      { title: 'Asset inventory', detail: 'See what devices and licences exist and who they are assigned to.' },
      { title: 'Lifecycle tracking', detail: 'Follow assets from procurement through assignment to retirement.' },
      { title: 'Reporting', detail: "Use the application's own views to answer questions about your estate." },
    ],
    launchLabel: 'Open Asset Management',
    launchNote: 'Opens in a new tab',
  },
  {
    id: 'tisa-assistant',
    name: 'TISA AI Assistant',
    summary: 'Explore AI-powered IT assistance through Microsoft Teams.',
    description:
      'A conversational assistant that lives inside Microsoft Teams, so colleagues can ask IT questions where they already work. The launch button opens the configured Teams destination; this page is an overview, not the assistant itself.',
    icon: 'bot',
    category: 'ai-automation',
    destination: { type: 'external', url: readUrl(import.meta.env.VITE_TISA_TEAMS_URL) },
    status: readStatus(import.meta.env.VITE_TISA_TEAMS_STATUS),
    capabilities: [
      { title: 'Conversational IT help', detail: 'Ask questions in plain language from a Teams chat.' },
      { title: 'Guided troubleshooting', detail: 'Work through common issues step by step before raising a ticket.' },
      { title: 'Routing to IT support', detail: 'Hand off to the IT team when a question needs a person.' },
    ],
    launchLabel: 'Launch in Microsoft Teams',
    launchNote: 'Opens in Microsoft Teams',
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
