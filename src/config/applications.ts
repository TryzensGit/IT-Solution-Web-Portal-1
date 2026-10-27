import type { IconName } from '../components/ui/AppIcon'

/**
 * Application catalog.
 *
 * To add a new application, add an entry here. The launcher grid, the
 * /applications index and the /applications/:slug launch page are all
 * generated from this list.
 *
 * Every application launches its in-portal demo (`demo.path`), so visitors
 * never leave the portal or reach a real system. To point an entry at a
 * live application instead, set `destination` to
 * `{ type: 'external', url: 'https://...' }`; the URL is validated in
 * src/lib/url.ts and opens in a new tab.
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

export interface AppDemo {
  /** Root-relative route of the demo. */
  path: string
  /** What the demo contains, shown on the launch page. */
  summary: string
  /** Whether the demo starts with a sign-in page using the public demo accounts. */
  signIn: boolean
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
  /** Self-contained demo of the application inside the portal. */
  demo: AppDemo
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

const SIGN_IN_NOTE = 'Sample data only. Sign in with the demo accounts on the details page.'

export const applications: AppDefinition[] = [
  {
    id: 'user-management',
    name: 'User Management',
    summary: 'Onboard and offboard people, and manage the IT services they depend on.',
    description:
      'One place for the joiner and leaver work that keeps IT running: bringing new people on, giving them what they need, and closing everything down cleanly when they leave. Open the demo to work with a fictional organisation using the demo accounts below.',
    icon: 'users',
    category: 'identity-access',
    destination: { type: 'internal', url: '/demo/user-management' },
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
    launchLabel: 'Open demo',
    launchNote: SIGN_IN_NOTE,
    demo: {
      path: '/demo/user-management',
      signIn: true,
      summary:
        'A working copy of the User Management screens with a fictional organisation: onboarding and offboarding, AD and Entra ID users, groups, licenses, scheduled tasks and the audit log.',
    },
  },
  {
    id: 'asset-management',
    name: 'Asset Management',
    summary: 'Track laptops, servers, workstations, mobile devices and the services behind them.',
    description:
      'The inventory of what your organisation runs on, from the laptop on a desk to the servers, virtual machines and storage behind the scenes. Open the demo to onboard, assign, track and retire a sample fleet using the demo accounts below.',
    icon: 'monitor',
    category: 'endpoint-management',
    destination: { type: 'internal', url: '/demo/asset-management' },
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
    launchLabel: 'Open demo',
    launchNote: SIGN_IN_NOTE,
    demo: {
      path: '/demo/asset-management',
      signIn: true,
      summary:
        'A working copy of the IT Asset Inventory with a sample fleet: dashboard, searchable asset table with colour flags, add and edit forms, audit log and settings.',
    },
  },
  {
    id: 'tisa-assistant',
    name: 'TISA Support Assistant',
    summary: 'First-line IT support in Microsoft Teams: answers from the knowledge base, raises Jira tickets, reports updates.',
    description:
      'TISA, the Technical Information Support Assistant, is a Microsoft Teams bot that gives employees first-line IT support. Message it in Teams, optionally with a screenshot, and it answers from the internal knowledge base, raises a Jira ticket when it cannot resolve the issue, and reports ticket updates when you ask. Open the demo to talk to a simulated version with a fictional knowledge base.',
    icon: 'bot',
    category: 'ai-automation',
    destination: { type: 'internal', url: '/demo/tisa-assistant' },
    status: readStatus(import.meta.env.VITE_TISA_TEAMS_STATUS),
    capabilities: [
      {
        title: 'Answers from the knowledge base',
        detail: 'Finds the matching internal article for password resets, VPN, slow computers, Teams, Outlook and more, and replies with the steps to try.',
      },
      {
        title: 'Understands screenshots',
        detail: 'Reads the error you send. A repeat of a known screen reuses the earlier reading, so answers stay consistent.',
      },
      {
        title: 'Triage with category and priority',
        detail: 'A locally hosted model classifies the issue, sets a priority and writes a short summary before it replies.',
      },
      {
        title: 'Raises Jira tickets',
        detail: 'When the fix does not work, one tap creates a ticket in the IT project with the conversation and screenshot attached.',
      },
      {
        title: 'Ticket updates on request',
        detail: 'Ask "any update on my ticket?" and it reports the latest comment and status for tickets it raised for you.',
      },
      {
        title: 'Escalate to a person',
        detail: 'A pre-filled email to IT is always one tap away for anything the assistant should not handle.',
      },
    ],
    launchLabel: 'Start chatting',
    launchNote: 'Simulated chat with a fictional knowledge base. No sign-in needed.',
    demo: {
      path: '/demo/tisa-assistant',
      signIn: false,
      summary:
        'A simulated Teams chat with the assistant. Describe an IT problem, attach a sample screenshot, get a triage card with the suggested fix, raise a ticket and ask for updates on it. Replies are scripted against a fictional knowledge base; nothing reaches Teams or Jira.',
    },
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
