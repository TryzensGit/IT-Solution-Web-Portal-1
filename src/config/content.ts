import type { IconName } from '../components/ui/AppIcon'

/** Service categories. These describe what the platform covers, not live features. */
export const solutions: { id: string; title: string; description: string; icon: IconName }[] = [
  {
    id: 'ai-support',
    title: 'AI-powered IT support',
    description:
      'Answer common questions and guide people through fixes in chat, so the service desk spends its time on what needs a person.',
    icon: 'message',
  },
  {
    id: 'process-automation',
    title: 'IT process automation',
    description:
      'Turn repeatable requests such as onboarding, access changes and device setup into reliable, auditable workflows.',
    icon: 'workflow',
  },
  {
    id: 'user-management',
    title: 'Intelligent user management',
    description:
      'Onboard and offboard people consistently, with the accounts, devices and services each person needs.',
    icon: 'users',
  },
  {
    id: 'asset-lifecycle',
    title: 'IT asset lifecycle management',
    description:
      'Track laptops, servers, workstations, mobile devices, virtual machines and storage from purchase to retirement.',
    icon: 'monitor',
  },
  {
    id: 'm365-endpoint',
    title: 'Microsoft 365 and endpoint automation',
    description:
      'Standardise configuration and routine administration across Microsoft 365 and managed devices.',
    icon: 'cloud',
  },
  {
    id: 'ai-integrations',
    title: 'Support assistant in Microsoft Teams',
    description:
      'First-line IT help where people already work: knowledge base answers, screenshot understanding and Jira tickets raised when a person is needed.',
    icon: 'plug',
  },
]

export const capabilities: { title: string; description: string; icon: IconName }[] = [
  {
    title: 'People stay in control',
    description: 'Automation prepares and routes work. Sensitive changes still need an authorised person to approve them.',
    icon: 'shield',
  },
  {
    title: 'Works where people are',
    description: 'The support assistant works inside Microsoft Teams, and every tool is reachable from one portal rather than another inbox.',
    icon: 'layout',
  },
  {
    title: 'Built to extend',
    description: 'New applications are added through configuration, so the portal grows with your IT estate.',
    icon: 'layers',
  },
  {
    title: 'Access stays with the app',
    description: 'Each application enforces its own sign-in and permissions. The portal never bypasses them.',
    icon: 'lock',
  },
]

/**
 * Services shown as the inner ring of the hero visual. These are
 * illustrative nodes, not launchable applications: add an application to
 * src/config/applications.ts instead if it has its own destination.
 * Six to eight entries fit comfortably; fewer is fine.
 */
export const heroServices: { label: string; icon: IconName }[] = [
  { label: 'Security', icon: 'shield' },
  { label: 'Enterprise apps', icon: 'layout' },
  { label: 'Virtual machines', icon: 'server' },
  { label: 'App services', icon: 'cloud' },
  { label: 'Storage', icon: 'database' },
  { label: 'Automation', icon: 'workflow' },
]

/** A real sequence, so numbering is appropriate here. */
export const howItWorks: { title: string; description: string }[] = [
  {
    title: 'Start from the portal',
    description: 'One address for everything IT. Find the application or service you need without hunting for links.',
  },
  {
    title: 'Open the right tool',
    description: 'Launch user management, asset management or the support assistant. Each opens in its own secure application.',
  },
  {
    title: 'Let automation carry the routine',
    description: 'Common questions are answered in chat from the knowledge base, tickets are raised when needed, and people step in where it matters.',
  },
]
