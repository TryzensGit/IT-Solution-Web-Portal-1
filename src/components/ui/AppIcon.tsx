import {
  Bot,
  Cloud,
  Layers,
  LayoutGrid,
  Lock,
  MessageCircle,
  Monitor,
  Plug,
  ShieldCheck,
  Users,
  Workflow,
  type LucideProps,
} from 'lucide-react'

/**
 * Icons are referenced by name in configuration so that catalog entries
 * stay plain data. Add to this map when a new application needs an icon.
 */
const icons = {
  users: Users,
  monitor: Monitor,
  bot: Bot,
  message: MessageCircle,
  workflow: Workflow,
  cloud: Cloud,
  plug: Plug,
  shield: ShieldCheck,
  layout: LayoutGrid,
  layers: Layers,
  lock: Lock,
} as const

export type IconName = keyof typeof icons

export function AppIcon({ name, ...props }: { name: IconName } & LucideProps) {
  const Icon = icons[name]
  return <Icon aria-hidden="true" {...props} />
}
