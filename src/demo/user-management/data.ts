import { addDays, nowIso, todayIso, uid } from '../shared/format'
import type { Tone } from '../shared/ui'

/**
 * Sample data for the User Management demo. All people, accounts, groups
 * and tickets are fictional. Shapes follow the real application's records
 * (local user record, on-prem AD user, Entra ID user, groups, licenses,
 * scheduled tasks and audit log).
 */

export type EntraState = 'synced' | 'cloud' | 'pending'

export interface PortalUser {
  id: string
  fullName: string
  upn: string
  department: string
  jobTitle: string
  manager: string
  location: string
  license: string
  startDate: string
  endDate?: string
  ticket?: string
  reason?: string
  notes?: string
  status: 'active' | 'offboarded'
  createdAt: string
  updatedAt: string
  entra: EntraState
}

export interface AdUser {
  sam: string
  displayName: string
  givenName: string
  surname: string
  upn: string
  department: string
  jobTitle: string
  ou: string
  enabled: boolean
  description?: string
}

export interface EntraUser {
  id: string
  displayName: string
  upn: string
  mail: string
  department: string
  jobTitle: string
  accountEnabled: boolean
  createdAt: string
}

export interface AdGroup {
  sam: string
  name: string
  type: 'Security' | 'Distribution'
  scope: 'Global' | 'Universal' | 'Domain local'
  description: string
  members: string[]
}

export interface M365Group {
  id: string
  name: string
  type: 'Microsoft 365' | 'Security' | 'Mail-enabled security'
  mailEnabled: boolean
  description: string
  members: string[]
}

export interface LicenseSku {
  skuId: string
  name: string
  total: number
}

export type TaskAction = 'onboard' | 'offboard' | 'ad_edit' | 'reenable' | 'license'
export type TaskStatus = 'pending' | 'done' | 'failed' | 'cancelled'

export interface ScheduledTask {
  id: string
  runAt: string
  action: TaskAction
  target: string
  status: TaskStatus
  detail: string
  payload?: OnboardInput | { userId: string; input: OffboardInput } | { upn: string; skuId: string }
}

export interface AuditRow {
  id: string
  timestamp: string
  fullName: string
  action: string
  details: string
  ticket: string
  actor: string
}

export interface OnboardInput {
  fullName: string
  upn: string
  department: string
  jobTitle: string
  manager: string
  location: string
  phone?: string
  mobile?: string
  country: string
  startDate: string
  contractEnd?: string
  license: string
  description?: string
  notes?: string
  ad: {
    displayName: string
    sam: string
    givenName: string
    surname: string
    ou: string
    mustChange: boolean
    groups: string[]
    /** Only held in the form; never stored. */
    password?: string
  }
}

export interface OffboardInput {
  ticket: string
  endDate: string
  reason: string
  notes?: string
  disableAd: boolean
  removeLicenses: boolean
}

export const taskActionLabels: Record<TaskAction, string> = {
  onboard: 'Onboard user',
  offboard: 'Offboard user',
  ad_edit: 'Edit AD account',
  reenable: 'Re-enable account',
  license: 'Assign license',
}

export const taskStatusTone: Record<TaskStatus, Tone> = { pending: 'warning', done: 'good', failed: 'critical', cancelled: 'neutral' }

export const entraTone: Record<EntraState, { label: string; tone: Tone }> = {
  synced: { label: 'Synced', tone: 'good' },
  cloud: { label: 'Cloud only', tone: 'blue' },
  pending: { label: 'Not yet synced', tone: 'warning' },
}

export const offboardReasons = ['Resignation', 'Contract End', 'Termination', 'Retirement', 'Transfer', 'Other']

export const defaultSuffixes = ['demo.example.com', 'eu.demo.example.com']

export const ous = ['OU=Staff,DC=demo,DC=example', 'OU=Contractors,DC=demo,DC=example', 'OU=Service Accounts,DC=demo,DC=example']

export const licenseSkus: LicenseSku[] = [
  { skuId: 'SPE_E3', name: 'Microsoft 365 E3', total: 40 },
  { skuId: 'SPB', name: 'Microsoft 365 Business Premium', total: 25 },
  { skuId: 'POWER_BI_PRO', name: 'Power BI Pro', total: 10 },
  { skuId: 'VISIOCLIENT', name: 'Visio Plan 2', total: 5 },
]

const t = todayIso()
const d = (days: number) => addDays(t, days)
const stamp = (daysAgo: number) => new Date(Date.now() - daysAgo * 86_400_000).toISOString()

interface PersonSeed {
  first: string
  last: string
  department: string
  jobTitle: string
  manager: string
  location: string
  license: string
  start: number
  entra: EntraState
  skus: string[]
}

const people: PersonSeed[] = [
  { first: 'Priya', last: 'Natarajan', department: 'Engineering', jobTitle: 'Senior Developer', manager: 'daniel.mehta', location: 'Bengaluru', license: 'Microsoft 365 E3', start: -610, entra: 'synced', skus: ['SPE_E3'] },
  { first: 'Oliver', last: 'Grant', department: 'Design', jobTitle: 'Product Designer', manager: 'hannah.reyes', location: 'London HQ', license: 'Microsoft 365 E3', start: -300, entra: 'synced', skus: ['SPE_E3', 'VISIOCLIENT'] },
  { first: 'Mira', last: 'Petrova', department: 'Finance', jobTitle: 'Finance Analyst', manager: 'james.okafor', location: 'Sofia', license: 'Microsoft 365 Business Premium', start: -1_080, entra: 'synced', skus: ['SPB', 'POWER_BI_PRO'] },
  { first: 'James', last: 'Okafor', department: 'Sales', jobTitle: 'Head of Sales', manager: 'ceo', location: 'London HQ', license: 'Microsoft 365 E3', start: -960, entra: 'synced', skus: ['SPE_E3', 'POWER_BI_PRO'] },
  { first: 'Daniel', last: 'Mehta', department: 'Engineering', jobTitle: 'Engineering Manager', manager: 'ceo', location: 'Bengaluru', license: 'Microsoft 365 E3', start: -1_400, entra: 'synced', skus: ['SPE_E3'] },
  { first: 'Sofia', last: 'Lindqvist', department: 'Marketing', jobTitle: 'Content Lead', manager: 'james.okafor', location: 'London HQ', license: 'Microsoft 365 Business Premium', start: -500, entra: 'synced', skus: ['SPB'] },
  { first: 'Arun', last: 'Krishnan', department: 'Sales', jobTitle: 'Account Executive', manager: 'james.okafor', location: 'Bengaluru', license: 'Microsoft 365 Business Premium', start: -398, entra: 'synced', skus: ['SPB'] },
  { first: 'Lucy', last: 'Adebayo', department: 'Support', jobTitle: 'Support Engineer', manager: 'daniel.mehta', location: 'London HQ', license: 'Microsoft 365 E3', start: -248, entra: 'synced', skus: ['SPE_E3'] },
  { first: 'Tomasz', last: 'Nowak', department: 'Engineering', jobTitle: 'Engineering Intern', manager: 'daniel.mehta', location: 'Sofia', license: 'Microsoft 365 Business Premium', start: -110, entra: 'synced', skus: ['SPB'] },
  { first: 'Hannah', last: 'Reyes', department: 'Design', jobTitle: 'Design Lead', manager: 'ceo', location: 'London HQ', license: 'Microsoft 365 E3', start: -1_250, entra: 'synced', skus: ['SPE_E3', 'VISIOCLIENT'] },
  { first: 'Elena', last: 'Marsh', department: 'People', jobTitle: 'HR Business Partner', manager: 'ceo', location: 'London HQ', license: 'Microsoft 365 E3', start: -12, entra: 'pending', skus: [] },
  { first: 'Ravi', last: 'Shankar', department: 'Engineering', jobTitle: 'DevOps Engineer', manager: 'daniel.mehta', location: 'Bengaluru', license: 'Microsoft 365 E3', start: -5, entra: 'pending', skus: [] },
]

const leavers: (PersonSeed & { end: number; ticket: string; reason: string })[] = [
  { first: 'Sam', last: 'Whitfield', department: 'Sales', jobTitle: 'Account Executive', manager: 'james.okafor', location: 'Sydney', license: 'Microsoft 365 Business Premium', start: -900, entra: 'synced', skus: [], end: -40, ticket: 'INC0012871', reason: 'Resignation' },
  { first: 'Grace', last: 'Oduya', department: 'Marketing', jobTitle: 'Campaign Manager', manager: 'james.okafor', location: 'London HQ', license: 'Microsoft 365 E3', start: -1_500, entra: 'synced', skus: [], end: -120, ticket: 'INC0011904', reason: 'Transfer' },
  { first: 'Felix', last: 'Bauer', department: 'Engineering', jobTitle: 'Contract Developer', manager: 'daniel.mehta', location: 'Sofia', license: 'Microsoft 365 Business Premium', start: -400, entra: 'synced', skus: [], end: -9, ticket: 'INC0013120', reason: 'Contract End' },
]

const upnOf = (p: PersonSeed) => `${p.first.toLowerCase()}.${p.last.toLowerCase()}@demo.example.com`
const samOf = (p: PersonSeed) => `${p.first[0].toLowerCase()}${p.last.toLowerCase()}`

export function seedUsers(): PortalUser[] {
  const active: PortalUser[] = people.map((p, i) => ({
    id: `u-${i + 1}`,
    fullName: `${p.first} ${p.last}`,
    upn: upnOf(p),
    department: p.department,
    jobTitle: p.jobTitle,
    manager: p.manager,
    location: p.location,
    license: p.license,
    startDate: d(p.start),
    status: 'active',
    createdAt: stamp(-p.start + 2),
    updatedAt: stamp(Math.max(1, -p.start - 10)),
    entra: p.entra,
  }))
  const off: PortalUser[] = leavers.map((p, i) => ({
    id: `u-off-${i + 1}`,
    fullName: `${p.first} ${p.last}`,
    upn: upnOf(p),
    department: p.department,
    jobTitle: p.jobTitle,
    manager: p.manager,
    location: p.location,
    license: p.license,
    startDate: d(p.start),
    endDate: d(p.end),
    ticket: p.ticket,
    reason: p.reason,
    status: 'offboarded',
    createdAt: stamp(-p.start + 2),
    updatedAt: stamp(-p.end),
    entra: p.entra,
  }))
  return [...active, ...off]
}

export function seedAdUsers(): AdUser[] {
  const staff: AdUser[] = [...people, ...leavers].map((p) => ({
    sam: samOf(p),
    displayName: `${p.first} ${p.last}`,
    givenName: p.first,
    surname: p.last,
    upn: upnOf(p),
    department: p.department,
    jobTitle: p.jobTitle,
    ou: p.jobTitle.includes('Contract') || p.jobTitle.includes('Intern') ? ous[1] : ous[0],
    enabled: !('end' in p),
  }))
  staff.push(
    { sam: 'svc-backup', displayName: 'Backup Service', givenName: 'Backup', surname: 'Service', upn: 'svc-backup@demo.example.com', department: 'IT', jobTitle: 'Service account', ou: ous[2], enabled: true, description: 'Runs nightly backup jobs' },
    { sam: 'svc-scanner', displayName: 'Scanner Service', givenName: 'Scanner', surname: 'Service', upn: 'svc-scanner@demo.example.com', department: 'IT', jobTitle: 'Service account', ou: ous[2], enabled: true, description: 'Scan-to-email on office MFPs' },
  )
  return staff
}

export function seedEntraUsers(): EntraUser[] {
  return [
    { id: 'e-1', displayName: 'Nadia Hussain', upn: 'nadia.hussain@demo.example.com', mail: 'nadia.hussain@demo.example.com', department: 'Board', jobTitle: 'Non-executive Director', accountEnabled: true, createdAt: stamp(410) },
    { id: 'e-2', displayName: 'Conference Room A', upn: 'room-a@demo.example.com', mail: 'room-a@demo.example.com', department: 'Facilities', jobTitle: 'Resource mailbox', accountEnabled: true, createdAt: stamp(900) },
    { id: 'e-3', displayName: 'Payroll Shared', upn: 'payroll@demo.example.com', mail: 'payroll@demo.example.com', department: 'Finance', jobTitle: 'Shared mailbox', accountEnabled: true, createdAt: stamp(720) },
    { id: 'e-4', displayName: 'Kai Tanaka (External)', upn: 'kai.tanaka_partner.example#EXT#@demo.example.com', mail: 'kai.tanaka@partner.example', department: 'Partner', jobTitle: 'Guest', accountEnabled: true, createdAt: stamp(60) },
    { id: 'e-5', displayName: 'Old Admin', upn: 'old.admin@demo.example.com', mail: 'old.admin@demo.example.com', department: 'IT', jobTitle: 'Break-glass account', accountEnabled: false, createdAt: stamp(1_300) },
  ]
}

export function seedAdGroups(): AdGroup[] {
  const sam = (first: string, last: string) => `${first[0].toLowerCase()}${last.toLowerCase()}`
  return [
    { sam: 'GG-AllStaff', name: 'All Staff', type: 'Security', scope: 'Global', description: 'Every permanent and contract employee', members: people.map((p) => sam(p.first, p.last)) },
    { sam: 'GG-Engineering', name: 'Engineering', type: 'Security', scope: 'Global', description: 'Engineering department', members: people.filter((p) => p.department === 'Engineering').map((p) => sam(p.first, p.last)) },
    { sam: 'GG-Finance', name: 'Finance', type: 'Security', scope: 'Global', description: 'Finance department and payroll access', members: people.filter((p) => p.department === 'Finance').map((p) => sam(p.first, p.last)) },
    { sam: 'GG-VPN-Users', name: 'VPN Users', type: 'Security', scope: 'Global', description: 'Allowed to connect to the office VPN', members: ['pnatarajan', 'dmehta', 'ladebayo', 'rshankar', 'jokafor'] },
    { sam: 'DL-Managers', name: 'Managers', type: 'Distribution', scope: 'Universal', description: 'Line managers mailing list', members: ['dmehta', 'jokafor', 'hreyes'] },
    { sam: 'DL-SocialClub', name: 'Social Club', type: 'Distribution', scope: 'Universal', description: 'Opt-in social announcements', members: ['ogrant', 'slindqvist', 'ladebayo', 'tnowak'] },
  ]
}

export function seedM365Groups(): M365Group[] {
  const upn = (first: string, last: string) => `${first.toLowerCase()}.${last.toLowerCase()}@demo.example.com`
  return [
    { id: 'g-1', name: 'Engineering Team', type: 'Microsoft 365', mailEnabled: true, description: 'Teams workspace and shared mailbox for engineering', members: people.filter((p) => p.department === 'Engineering').map((p) => upn(p.first, p.last)) },
    { id: 'g-2', name: 'Leadership', type: 'Microsoft 365', mailEnabled: true, description: 'Leadership team site', members: [upn('Daniel', 'Mehta'), upn('James', 'Okafor'), upn('Hannah', 'Reyes'), 'nadia.hussain@demo.example.com'] },
    { id: 'g-3', name: 'MFA Enforced', type: 'Security', mailEnabled: false, description: 'Conditional access: require MFA', members: people.map((p) => upn(p.first, p.last)) },
    { id: 'g-4', name: 'Power BI Authors', type: 'Security', mailEnabled: false, description: 'Can publish Power BI workspaces', members: [upn('Mira', 'Petrova'), upn('James', 'Okafor')] },
    { id: 'g-5', name: 'Sales Announcements', type: 'Mail-enabled security', mailEnabled: true, description: 'Sales team broadcast list', members: people.filter((p) => p.department === 'Sales').map((p) => upn(p.first, p.last)) },
  ]
}

export function seedCloudLicenses(): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const p of people) out[upnOf(p)] = p.skus
  out['nadia.hussain@demo.example.com'] = ['SPE_E3']
  return out
}

export function seedScheduled(): ScheduledTask[] {
  return [
    { id: 't-1', runAt: new Date(Date.now() + 2 * 86_400_000).toISOString(), action: 'onboard', target: 'Chloe Barnes', status: 'pending', detail: 'Starts Monday; AD account and E3 license' },
    { id: 't-2', runAt: new Date(Date.now() + 9 * 86_400_000).toISOString(), action: 'offboard', target: 'tomasz.nowak@demo.example.com', status: 'pending', detail: 'Internship ends; disable AD, remove licenses' },
    { id: 't-3', runAt: new Date(Date.now() + 30 * 60_000).toISOString(), action: 'license', target: 'elena.marsh@demo.example.com', status: 'pending', detail: 'Waiting for Entra sync, retrying every 5 minutes', payload: { upn: 'elena.marsh@demo.example.com', skuId: 'SPE_E3' } },
    { id: 't-4', runAt: stamp(1), action: 'license', target: 'lucy.adebayo@demo.example.com', status: 'done', detail: 'Assigned Microsoft 365 E3' },
    { id: 't-5', runAt: stamp(3), action: 'ad_edit', target: 'mpetrova', status: 'done', detail: 'Job title updated to Finance Analyst' },
    { id: 't-6', runAt: stamp(6), action: 'offboard', target: 'felix.bauer@demo.example.com', status: 'failed', detail: 'AD agent unreachable; retry required' },
  ]
}

export function seedAudit(): AuditRow[] {
  const rows: [number, string, string, string, string, string][] = [
    [0.1, 'Elena Marsh', 'ONBOARD', 'Created local record and AD account emarsh; license queued', 'INC0013240', 'Demo Administrator'],
    [0.5, 'Ravi Shankar', 'ONBOARD', 'Created local record and AD account rshankar', 'INC0013218', 'Demo Administrator'],
    [1, 'Lucy Adebayo', 'LICENSE_ASSIGN', 'Assigned Microsoft 365 E3', '', 'scheduler'],
    [3, 'Mira Petrova', 'AD_EDIT', 'Job title: Finance Assistant -> Finance Analyst', 'CHG0004410', 'Demo User'],
    [6, 'Felix Bauer', 'OFFBOARD_FAILED', 'AD agent unreachable', 'INC0013120', 'scheduler'],
    [9, 'Felix Bauer', 'OFFBOARD', 'Local record closed; AD disable queued', 'INC0013120', 'Demo Administrator'],
    [14, 'VPN Users', 'GROUP_MEMBER_ADD', 'Added rshankar', 'CHG0004388', 'Demo Administrator'],
    [40, 'Sam Whitfield', 'OFFBOARD', 'Disabled AD account, removed 1 license', 'INC0012871', 'Demo Administrator'],
    [41, 'Demo Administrator', 'LOGIN', 'Signed in via Microsoft', '', 'Demo Administrator'],
  ]
  return rows.map(([daysAgo, fullName, action, details, ticket, actor]) => ({ id: uid('aud'), timestamp: stamp(daysAgo), fullName, action, details, ticket, actor }))
}

export function makeAuditRow(actor: string, fullName: string, action: string, details: string, ticket = ''): AuditRow {
  return { id: uid('aud'), timestamp: nowIso(), fullName, action, details, ticket, actor }
}

export function emptyOnboard(suffix: string): OnboardInput {
  return {
    fullName: '',
    upn: `@${suffix}`,
    department: '',
    jobTitle: '',
    manager: '',
    location: '',
    country: 'GB',
    startDate: todayIso(),
    license: '',
    ad: { displayName: '', sam: '', givenName: '', surname: '', ou: '', mustChange: true, groups: [] },
  }
}
