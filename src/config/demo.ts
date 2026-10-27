/**
 * Demo environments for the catalog applications.
 *
 * The demos are self-contained copies of the application UIs that run inside
 * the portal with sample data. They never contact the real applications.
 * The credentials below are public demo values by design: they are shown on
 * each application's page so visitors can try the demo. They grant nothing
 * outside the demo.
 */
export type DemoRole = 'admin' | 'user'

export interface DemoCredential {
  role: DemoRole
  label: string
  username: string
  password: string
  /** What the role can do, shown next to the credentials. */
  access: string
}

export const demoCredentials: DemoCredential[] = [
  {
    role: 'admin',
    label: 'Administrator',
    username: 'admin',
    password: 'Admin@1234',
    access: 'Full access: settings, audit log, deletes, scheduling and reference data.',
  },
  {
    role: 'user',
    label: 'Standard user',
    username: 'user',
    password: 'User@1234',
    access: 'Day-to-day work: view records, add and edit. No settings, audit log or deletes.',
  },
]

export const demoNotice =
  'Demo environment with sample data only. Nothing here connects to a real system, and changes are discarded when the browser tab is closed.'

export function demoPath(appId: string): string {
  return `/demo/${appId}`
}

/** Display names for the two demo accounts. */
export const demoDisplayName: Record<DemoRole, string> = {
  admin: 'Demo Administrator',
  user: 'Demo User',
}
