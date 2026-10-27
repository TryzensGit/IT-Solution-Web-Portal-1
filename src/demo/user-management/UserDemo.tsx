import { useCallback, useMemo, useState } from 'react'
import { Cloud, Clock, FolderKanban, KeyRound, ScrollText, Server, UserCheck, UserMinus, UserPlus, UserRoundX, Users } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { usePageTitle } from '../../lib/usePageTitle'
import { DemoLogin } from '../shared/DemoLogin'
import { DemoShell } from '../shared/DemoShell'
import { daysUntil, nowIso } from '../shared/format'
import { useDemoSession, type DemoSession } from '../shared/session'
import { Dot, SearchInput, StatCard, ToastProvider, type TabDef } from '../shared/ui'
import {
  defaultSuffixes,
  licenseSkus,
  makeAuditRow,
  seedAdGroups,
  seedAdUsers,
  seedAudit,
  seedCloudLicenses,
  seedEntraUsers,
  seedM365Groups,
  seedScheduled,
  seedUsers,
  type AdGroup,
  type AdUser,
  type AuditRow,
  type EntraUser,
  type M365Group,
  type OffboardInput,
  type OnboardInput,
  type PortalUser,
  type ScheduledTask,
} from './data'
import { ActiveTab, AdUsersTab, AuditTab, EntraUsersTab, GroupsTab, LicensesTab, OffboardedTab, ScheduledTab } from './tabs'
import { EditAdUserModal, GroupMembersModal, ManageLicensesModal, OffboardModal, OnboardModal, RescheduleModal, UmSettingsModal, UserDetailsModal } from './modals'

export const USER_APP_ID = 'user-management'
const APP_NAME = 'User Management'
const APP_SUB = 'IT operations'

export interface UmStore {
  session: DemoSession
  isAdmin: boolean
  users: PortalUser[]
  adUsers: AdUser[]
  entraUsers: EntraUser[]
  adGroups: AdGroup[]
  m365Groups: M365Group[]
  cloudLicenses: Record<string, string[]>
  scheduled: ScheduledTask[]
  audit: AuditRow[]
  upnSuffixes: string[]
  onboard: (input: OnboardInput, scheduleAt?: string) => void
  offboard: (userId: string, input: OffboardInput, scheduleAt?: string) => void
  reactivate: (userId: string) => void
  deleteUser: (userId: string) => void
  updateAdUser: (sam: string, patch: Partial<AdUser>, scheduleAt?: string) => void
  setAdEnabled: (sam: string, enabled: boolean) => void
  deleteAdUser: (sam: string) => void
  setGroupMembers: (kind: 'ad' | 'm365', id: string, members: string[], note: string) => void
  assignLicense: (upn: string, skuId: string) => void
  removeLicense: (upn: string, skuId: string) => void
  rescheduleTask: (id: string, runAt: string) => void
  cancelTask: (id: string) => void
  runTask: (id: string) => void
  setUpnSuffixes: (list: string[]) => void
}

export type ModalState =
  | { type: 'onboard' }
  | { type: 'offboard'; user: PortalUser }
  | { type: 'view'; user: PortalUser }
  | { type: 'editAd'; adUser: AdUser }
  | { type: 'group'; kind: 'ad'; group: AdGroup }
  | { type: 'group'; kind: 'm365'; group: M365Group }
  | { type: 'licenses'; upn: string; name: string }
  | { type: 'reschedule'; task: ScheduledTask }
  | { type: 'settings' }
  | null

export function UserDemo() {
  usePageTitle(`${APP_NAME} demo`)
  const { session, signIn, signOut } = useDemoSession(USER_APP_ID)
  if (!session) {
    return <DemoLogin appId={USER_APP_ID} appName={APP_NAME} appSub="Demo organisation IT operations" mark={<Users className="size-6" aria-hidden="true" />} onSignIn={signIn} />
  }
  return (
    <ToastProvider>
      <UserApp key={session.username} session={session} onSignOut={signOut} />
    </ToastProvider>
  )
}

function UserApp({ session, onSignOut }: { session: DemoSession; onSignOut: () => void }) {
  const isAdmin = session.role === 'admin'
  const [users, setUsers] = useState<PortalUser[]>(seedUsers)
  const [adUsers, setAdUsers] = useState<AdUser[]>(seedAdUsers)
  const [entraUsers] = useState<EntraUser[]>(seedEntraUsers)
  const [adGroups, setAdGroups] = useState<AdGroup[]>(seedAdGroups)
  const [m365Groups, setM365Groups] = useState<M365Group[]>(seedM365Groups)
  const [cloudLicenses, setCloudLicenses] = useState<Record<string, string[]>>(seedCloudLicenses)
  const [scheduled, setScheduled] = useState<ScheduledTask[]>(seedScheduled)
  const [audit, setAudit] = useState<AuditRow[]>(seedAudit)
  const [upnSuffixes, setUpnSuffixes] = useState<string[]>(defaultSuffixes)
  const [tab, setTab] = useState('active')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<ModalState>(null)

  const log = useCallback(
    (fullName: string, action: string, details: string, ticket = '') => setAudit((list) => [makeAuditRow(session.name, fullName, action, details, ticket), ...list]),
    [session.name],
  )

  const store = useMemo<UmStore>(() => {
    const applyOnboard = (input: OnboardInput) => {
      const now = nowIso()
      if (isAdmin) {
        const user: PortalUser = {
          id: `u-${Date.now().toString(36)}`,
          fullName: input.fullName,
          upn: input.upn,
          department: input.department,
          jobTitle: input.jobTitle,
          manager: input.manager,
          location: input.location,
          license: input.license,
          startDate: input.startDate,
          endDate: input.contractEnd,
          notes: input.notes,
          status: 'active',
          createdAt: now,
          updatedAt: now,
          entra: 'pending',
        }
        setUsers((list) => [user, ...list])
      }
      setAdUsers((list) => [
        {
          sam: input.ad.sam,
          displayName: input.ad.displayName || input.fullName,
          givenName: input.ad.givenName,
          surname: input.ad.surname,
          upn: input.upn,
          department: input.department,
          jobTitle: input.jobTitle,
          ou: input.ad.ou || 'OU=Staff,DC=demo,DC=example',
          enabled: true,
          description: input.description,
        },
        ...list,
      ])
      if (input.ad.groups.length) {
        setAdGroups((groups) => groups.map((g) => (input.ad.groups.includes(g.sam) ? { ...g, members: [...g.members, input.ad.sam] } : g)))
      }
      if (isAdmin && input.license) {
        const sku = licenseSkus.find((s) => s.name === input.license)
        if (sku) {
          setScheduled((list) => [
            { id: `t-${Date.now().toString(36)}`, runAt: new Date(Date.now() + 45 * 60_000).toISOString(), action: 'license', target: input.upn, status: 'pending', detail: `Assign ${sku.name} once the account syncs to Entra ID`, payload: { upn: input.upn, skuId: sku.skuId } },
            ...list,
          ])
        }
      }
      log(input.fullName, 'ONBOARD', isAdmin ? `Created local record and AD account ${input.ad.sam}${input.license ? '; license queued' : ''}` : `Created AD account ${input.ad.sam} (AD only)`)
    }

    const applyOffboard = (userId: string, input: OffboardInput) => {
      const user = users.find((u) => u.id === userId)
      if (!user) return
      setUsers((list) => list.map((u) => (u.id === userId ? { ...u, status: 'offboarded', endDate: input.endDate, ticket: input.ticket, reason: input.reason, notes: input.notes, updatedAt: nowIso() } : u)))
      if (input.disableAd) setAdUsers((list) => list.map((a) => (a.upn === user.upn ? { ...a, enabled: false } : a)))
      if (input.removeLicenses) setCloudLicenses((m) => ({ ...m, [user.upn]: [] }))
      const parts = ['Local record closed']
      if (input.disableAd) parts.push('AD account disabled')
      if (input.removeLicenses) parts.push('M365 licenses removed')
      log(user.fullName, 'OFFBOARD', parts.join('; '), input.ticket)
    }

    return {
      session,
      isAdmin,
      users,
      adUsers,
      entraUsers,
      adGroups,
      m365Groups,
      cloudLicenses,
      scheduled,
      audit,
      upnSuffixes,
      onboard: (input, scheduleAt) => {
        if (scheduleAt) {
          setScheduled((list) => [{ id: `t-${Date.now().toString(36)}`, runAt: new Date(scheduleAt).toISOString(), action: 'onboard', target: input.fullName, status: 'pending', detail: `AD account ${input.ad.sam}${input.license ? ` and ${input.license}` : ''}`, payload: input }, ...list])
          log(input.fullName, 'ONBOARD_SCHEDULED', `Scheduled for ${new Date(scheduleAt).toLocaleString()}`)
          return
        }
        applyOnboard(input)
      },
      offboard: (userId, input, scheduleAt) => {
        const user = users.find((u) => u.id === userId)
        if (!user) return
        if (scheduleAt) {
          setScheduled((list) => [{ id: `t-${Date.now().toString(36)}`, runAt: new Date(scheduleAt).toISOString(), action: 'offboard', target: user.upn, status: 'pending', detail: `${input.reason || 'Offboarding'}; ${input.disableAd ? 'disable AD' : 'keep AD'}, ${input.removeLicenses ? 'remove licenses' : 'keep licenses'}`, payload: { userId, input } }, ...list])
          log(user.fullName, 'OFFBOARD_SCHEDULED', `Scheduled for ${new Date(scheduleAt).toLocaleString()}`, input.ticket)
          return
        }
        applyOffboard(userId, input)
      },
      reactivate: (userId) => {
        const user = users.find((u) => u.id === userId)
        if (!user) return
        setUsers((list) => list.map((u) => (u.id === userId ? { ...u, status: 'active', endDate: undefined, ticket: undefined, reason: undefined, updatedAt: nowIso() } : u)))
        setAdUsers((list) => list.map((a) => (a.upn === user.upn ? { ...a, enabled: true } : a)))
        log(user.fullName, 'REACTIVATE', 'Local record reopened and AD account re-enabled')
      },
      deleteUser: (userId) => {
        const user = users.find((u) => u.id === userId)
        setUsers((list) => list.filter((u) => u.id !== userId))
        if (user) log(user.fullName, 'DELETE', 'Local record deleted')
      },
      updateAdUser: (sam, patch, scheduleAt) => {
        const a = adUsers.find((x) => x.sam === sam)
        if (!a) return
        if (scheduleAt) {
          setScheduled((list) => [{ id: `t-${Date.now().toString(36)}`, runAt: new Date(scheduleAt).toISOString(), action: 'ad_edit', target: sam, status: 'pending', detail: `Update ${Object.keys(patch).join(', ')}` }, ...list])
          log(a.displayName, 'AD_EDIT_SCHEDULED', `Scheduled for ${new Date(scheduleAt).toLocaleString()}`)
          return
        }
        setAdUsers((list) => list.map((x) => (x.sam === sam ? { ...x, ...patch } : x)))
        setUsers((list) => list.map((u) => (u.upn === a.upn ? { ...u, department: patch.department ?? u.department, jobTitle: patch.jobTitle ?? u.jobTitle, updatedAt: nowIso() } : u)))
        log(a.displayName, 'AD_EDIT', `Updated ${Object.keys(patch).join(', ')}`)
      },
      setAdEnabled: (sam, enabled) => {
        const a = adUsers.find((x) => x.sam === sam)
        setAdUsers((list) => list.map((x) => (x.sam === sam ? { ...x, enabled } : x)))
        if (a) log(a.displayName, enabled ? 'AD_ENABLE' : 'AD_DISABLE', `${enabled ? 'Enabled' : 'Disabled'} AD account ${sam}`)
      },
      deleteAdUser: (sam) => {
        const a = adUsers.find((x) => x.sam === sam)
        setAdUsers((list) => list.filter((x) => x.sam !== sam))
        setAdGroups((groups) => groups.map((g) => ({ ...g, members: g.members.filter((m) => m !== sam) })))
        if (a) log(a.displayName, 'AD_DELETE', `Deleted AD account ${sam}`)
      },
      setGroupMembers: (kind, id, members, note) => {
        if (kind === 'ad') {
          setAdGroups((groups) => groups.map((g) => (g.sam === id ? { ...g, members } : g)))
          log(adGroups.find((g) => g.sam === id)?.name ?? id, 'GROUP_MEMBERS', note)
        } else {
          setM365Groups((groups) => groups.map((g) => (g.id === id ? { ...g, members } : g)))
          log(m365Groups.find((g) => g.id === id)?.name ?? id, 'M365_GROUP_MEMBERS', note)
        }
      },
      assignLicense: (upn, skuId) => {
        setCloudLicenses((m) => ({ ...m, [upn]: Array.from(new Set([...(m[upn] ?? []), skuId])) }))
        const sku = licenseSkus.find((s) => s.skuId === skuId)
        log(users.find((u) => u.upn === upn)?.fullName ?? upn, 'LICENSE_ASSIGN', `Assigned ${sku?.name ?? skuId}`)
      },
      removeLicense: (upn, skuId) => {
        setCloudLicenses((m) => ({ ...m, [upn]: (m[upn] ?? []).filter((s) => s !== skuId) }))
        const sku = licenseSkus.find((s) => s.skuId === skuId)
        log(users.find((u) => u.upn === upn)?.fullName ?? upn, 'LICENSE_REMOVE', `Removed ${sku?.name ?? skuId}`)
      },
      rescheduleTask: (id, runAt) => {
        setScheduled((list) => list.map((t) => (t.id === id ? { ...t, runAt: new Date(runAt).toISOString(), status: 'pending' } : t)))
        const t = scheduled.find((x) => x.id === id)
        if (t) log(t.target, 'TASK_RESCHEDULED', `${t.action} moved to ${new Date(runAt).toLocaleString()}`)
      },
      cancelTask: (id) => {
        setScheduled((list) => list.map((t) => (t.id === id ? { ...t, status: 'cancelled' } : t)))
        const t = scheduled.find((x) => x.id === id)
        if (t) log(t.target, 'TASK_CANCELLED', `${t.action} cancelled`)
      },
      runTask: (id) => {
        const t = scheduled.find((x) => x.id === id)
        if (!t) return
        if (t.action === 'onboard' && t.payload && 'ad' in t.payload) applyOnboard(t.payload)
        else if (t.action === 'offboard' && t.payload && 'userId' in t.payload) applyOffboard(t.payload.userId, t.payload.input)
        else if (t.action === 'license' && t.payload && 'skuId' in t.payload) {
          const { upn, skuId } = t.payload
          setCloudLicenses((m) => ({ ...m, [upn]: Array.from(new Set([...(m[upn] ?? []), skuId])) }))
          setUsers((list) => list.map((u) => (u.upn === upn ? { ...u, entra: 'synced' } : u)))
          log(users.find((u) => u.upn === upn)?.fullName ?? upn, 'LICENSE_ASSIGN', `Assigned ${licenseSkus.find((s) => s.skuId === skuId)?.name ?? skuId} (scheduled task)`)
        } else log(t.target, 'TASK_RUN', `${t.action} executed`)
        setScheduled((list) => list.map((x) => (x.id === id ? { ...x, status: 'done', runAt: nowIso() } : x)))
      },
      setUpnSuffixes: (list) => {
        setUpnSuffixes(list)
        log('UPN suffixes', 'SETTINGS', `Suffixes: ${list.join(', ')}`)
      },
    }
  }, [session, isAdmin, users, adUsers, entraUsers, adGroups, m365Groups, cloudLicenses, scheduled, audit, upnSuffixes, log])

  const active = users.filter((u) => u.status === 'active')
  const offboarded = users.filter((u) => u.status === 'offboarded')
  const recent = active.filter((u) => {
    const d = daysUntil(u.startDate)
    return d !== undefined && d <= 0 && d >= -30
  })

  const tabs: TabDef[] = [
    { id: 'active', label: 'Active', icon: UserCheck },
    { id: 'offboarded', label: 'Offboarded', icon: UserMinus },
    { id: 'adusers', label: 'AD Users', icon: Server },
    { id: 'entra', label: 'Entra ID Users', icon: Cloud },
    { id: 'groups', label: 'Groups', icon: FolderKanban },
    { id: 'licenses', label: 'Licenses', icon: KeyRound },
    { id: 'scheduled', label: 'Scheduled', icon: Clock },
    ...(isAdmin ? [{ id: 'audit', label: 'Audit', icon: ScrollText }] : []),
  ]

  const open = (m: ModalState) => setModal(m)
  const close = () => setModal(null)

  return (
    <DemoShell
      appName={APP_NAME}
      appSub={APP_SUB}
      mark={<Users className="size-5" aria-hidden="true" />}
      tabs={tabs}
      activeTab={tab}
      onTabChange={setTab}
      session={session}
      onSignOut={onSignOut}
      onOpenSettings={isAdmin ? () => open({ type: 'settings' }) : undefined}
      status={
        <div className="hidden items-center gap-3 text-xs text-muted md:flex" aria-label="Connection status">
          <span className="inline-flex items-center gap-1.5" title="Active Directory agent: simulated in the demo">
            <Dot tone="good" /> Local-AD
          </span>
          <span className="inline-flex items-center gap-1.5" title="Microsoft Graph: simulated in the demo">
            <Dot tone="good" /> Entra-ID
          </span>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={users.length} icon={Users} tone="blue" />
        <StatCard label="Active" value={active.length} icon={UserCheck} tone="good" />
        <StatCard label="Offboarded" value={offboarded.length} icon={UserRoundX} tone="critical" />
        <StatCard label="New (30 days)" value={recent.length} icon={UserPlus} tone="warning" />
      </div>

      <div className="surface-card mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-3">
          <h2 className="text-sm font-semibold tracking-tight">{tabs.find((t) => t.id === tab)?.label}</h2>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <SearchInput value={search} onChange={setSearch} placeholder="Search" className="min-w-0 flex-1 sm:w-56 sm:flex-none" />
            <Button onClick={() => open({ type: 'onboard' })}>
              <UserPlus className="size-4" aria-hidden="true" />
              Onboard user
            </Button>
          </div>
        </div>
        <div className="p-3 sm:p-4">
          {tab === 'active' && <ActiveTab store={store} search={search} open={open} />}
          {tab === 'offboarded' && <OffboardedTab store={store} search={search} open={open} />}
          {tab === 'adusers' && <AdUsersTab store={store} search={search} open={open} />}
          {tab === 'entra' && <EntraUsersTab store={store} search={search} />}
          {tab === 'groups' && <GroupsTab store={store} search={search} open={open} />}
          {tab === 'licenses' && <LicensesTab store={store} search={search} open={open} />}
          {tab === 'scheduled' && <ScheduledTab store={store} search={search} open={open} />}
          {tab === 'audit' && isAdmin && <AuditTab store={store} search={search} />}
        </div>
      </div>

      <OnboardModal open={modal?.type === 'onboard'} store={store} onClose={close} />
      <OffboardModal open={modal?.type === 'offboard'} user={modal?.type === 'offboard' ? modal.user : undefined} store={store} onClose={close} />
      <UserDetailsModal open={modal?.type === 'view'} user={modal?.type === 'view' ? modal.user : undefined} store={store} onClose={close} onOffboard={(u) => open({ type: 'offboard', user: u })} />
      <EditAdUserModal open={modal?.type === 'editAd'} adUser={modal?.type === 'editAd' ? modal.adUser : undefined} store={store} onClose={close} />
      <GroupMembersModal open={modal?.type === 'group'} selection={modal?.type === 'group' ? modal : undefined} store={store} onClose={close} />
      <ManageLicensesModal open={modal?.type === 'licenses'} target={modal?.type === 'licenses' ? modal : undefined} store={store} onClose={close} />
      <RescheduleModal open={modal?.type === 'reschedule'} task={modal?.type === 'reschedule' ? modal.task : undefined} store={store} onClose={close} />
      {isAdmin && <UmSettingsModal open={modal?.type === 'settings'} store={store} onClose={close} />}
    </DemoShell>
  )
}
