import { useMemo, useState } from 'react'
import { Cloud, Download, Eye, Inbox, KeyRound, Pencil, Play, RotateCcw, Trash2, UserMinus, UserRoundCheck, UserRoundX, Users } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { downloadCsv, fmtDate, fmtDateTime } from '../shared/format'
import { Chip, ConfirmDialog, DataTable, EmptyState, Notice, TabBar, useToast, type SortState } from '../shared/ui'
import { entraTone, licenseSkus, taskActionLabels, taskStatusTone, type AdUser, type PortalUser, type ScheduledTask } from './data'
import type { ModalState, UmStore } from './UserDemo'

type Open = (m: ModalState) => void

function matches(q: string, ...fields: (string | undefined)[]) {
  const s = q.trim().toLowerCase()
  return !s || fields.some((f) => f?.toLowerCase().includes(s))
}

function IconButton({ label, onClick, icon: Icon, danger }: { label: string; onClick: () => void; icon: typeof Eye; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      aria-label={label}
      title={label}
      className={`rounded-md p-1.5 transition-colors ${danger ? 'text-muted hover:bg-danger/10 hover:text-danger' : 'text-muted hover:bg-accent-soft hover:text-accent'}`}
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  )
}

/* ------------------------------------------------------------------ */

export function ActiveTab({ store, search, open }: { store: UmStore; search: string; open: Open }) {
  const [sort, setSort] = useState<SortState>({ key: 'fullName', dir: 1 })
  const rows = store.users.filter((u) => u.status === 'active' && matches(search, u.fullName, u.upn, u.department, u.jobTitle))
  return (
    <DataTable
      caption="Active users"
      sort={sort}
      onSort={setSort}
      onRowClick={(u) => open({ type: 'view', user: u })}
      columns={[
        { key: 'fullName', header: 'Name', sortValue: (u) => u.fullName, render: (u) => <span className="font-medium">{u.fullName}</span> },
        { key: 'upn', header: 'UPN', sortValue: (u) => u.upn, render: (u) => <span className="text-muted">{u.upn}</span> },
        { key: 'department', header: 'Department', sortValue: (u) => u.department },
        { key: 'jobTitle', header: 'Job title', sortValue: (u) => u.jobTitle },
        { key: 'startDate', header: 'Start date', sortValue: (u) => u.startDate, render: (u) => fmtDate(u.startDate) },
        { key: 'status', header: 'Status', render: () => <Chip tone="good">Active</Chip> },
        { key: 'entra', header: 'Entra ID', render: (u) => <Chip tone={entraTone[u.entra].tone}>{entraTone[u.entra].label}</Chip> },
        {
          key: 'actions',
          header: 'Actions',
          render: (u) => (
            <span className="flex items-center">
              <IconButton label={`View ${u.fullName}`} icon={Eye} onClick={() => open({ type: 'view', user: u })} />
              <IconButton label={`Manage licenses for ${u.fullName}`} icon={KeyRound} onClick={() => open({ type: 'licenses', upn: u.upn, name: u.fullName })} />
              <IconButton label={`Offboard ${u.fullName}`} icon={UserMinus} danger onClick={() => open({ type: 'offboard', user: u })} />
            </span>
          ),
        },
      ]}
      rows={rows}
      rowKey={(u) => u.id}
      empty={
        <EmptyState icon={Inbox}>No active users found.</EmptyState>
      }
    />
  )
}

export function OffboardedTab({ store, search, open }: { store: UmStore; search: string; open: Open }) {
  const toast = useToast()
  const [confirm, setConfirm] = useState<PortalUser | null>(null)
  const rows = store.users.filter((u) => u.status === 'offboarded' && matches(search, u.fullName, u.upn, u.department, u.ticket, u.reason))
  return (
    <>
      <DataTable
        caption="Offboarded users"
        onRowClick={(u) => open({ type: 'view', user: u })}
        columns={[
          { key: 'fullName', header: 'Name', render: (u) => <span className="font-medium">{u.fullName}</span> },
          { key: 'upn', header: 'UPN', render: (u) => <span className="text-muted">{u.upn}</span> },
          { key: 'department', header: 'Department' },
          { key: 'endDate', header: 'End date', render: (u) => fmtDate(u.endDate) },
          { key: 'ticket', header: 'Ticket', render: (u) => <span className="font-mono text-xs">{u.ticket ?? '-'}</span> },
          { key: 'reason', header: 'Reason', render: (u) => u.reason ?? '-' },
          {
            key: 'actions',
            header: 'Actions',
            render: (u) => (
              <span className="flex items-center">
                <IconButton label={`View ${u.fullName}`} icon={Eye} onClick={() => open({ type: 'view', user: u })} />
                <IconButton
                  label={`Re-enable ${u.fullName}`}
                  icon={UserRoundCheck}
                  onClick={() => {
                    store.reactivate(u.id)
                    toast(`${u.fullName} re-enabled`)
                  }}
                />
                {store.isAdmin && <IconButton label={`Delete ${u.fullName}`} icon={Trash2} danger onClick={() => setConfirm(u)} />}
              </span>
            ),
          },
        ]}
        rows={rows}
        rowKey={(u) => u.id}
        empty={<EmptyState icon={Inbox}>No offboarded users found.</EmptyState>}
      />
      <ConfirmDialog
        open={confirm !== null}
        title="Delete user record"
        confirmLabel="Delete"
        danger
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) {
            store.deleteUser(confirm.id)
            toast(`${confirm.fullName} deleted`, 'critical')
          }
        }}
      >
        This deletes the local record for <strong>{confirm?.fullName}</strong>. The AD account and Entra ID user are not touched.
      </ConfirmDialog>
    </>
  )
}

export function AdUsersTab({ store, search, open }: { store: UmStore; search: string; open: Open }) {
  const toast = useToast()
  const [confirm, setConfirm] = useState<AdUser | null>(null)
  const [disable, setDisable] = useState<AdUser | null>(null)
  const rows = store.adUsers.filter((a) => matches(search, a.displayName, a.upn, a.sam, a.department, a.jobTitle))
  return (
    <>
      <DataTable
        caption="Active Directory users"
        columns={[
          {
            key: 'displayName',
            header: 'Name',
            render: (a) => (
              <span>
                <span className="font-medium">{a.displayName}</span> <span className="font-mono text-xs text-faint">{a.sam}</span>
              </span>
            ),
          },
          { key: 'upn', header: 'UPN', render: (a) => <span className="text-muted">{a.upn}</span> },
          { key: 'department', header: 'Department' },
          { key: 'jobTitle', header: 'Job title' },
          { key: 'enabled', header: 'Status', render: (a) => <Chip tone={a.enabled ? 'good' : 'critical'}>{a.enabled ? 'Enabled' : 'Disabled'}</Chip> },
          {
            key: 'actions',
            header: 'Actions',
            render: (a) => (
              <span className="flex items-center">
                <IconButton label={`Edit ${a.displayName}`} icon={Pencil} onClick={() => open({ type: 'editAd', adUser: a })} />
                {a.enabled ? (
                  <IconButton label={`Disable ${a.displayName}`} icon={UserRoundX} danger onClick={() => setDisable(a)} />
                ) : (
                  <IconButton
                    label={`Enable ${a.displayName}`}
                    icon={UserRoundCheck}
                    onClick={() => {
                      store.setAdEnabled(a.sam, true)
                      toast(`${a.sam} enabled`)
                    }}
                  />
                )}
                {store.isAdmin && <IconButton label={`Delete ${a.displayName}`} icon={Trash2} danger onClick={() => setConfirm(a)} />}
              </span>
            ),
          },
        ]}
        rows={rows}
        rowKey={(a) => a.sam}
        empty={<EmptyState icon={Inbox}>No AD users found.</EmptyState>}
      />
      <ConfirmDialog
        open={disable !== null}
        title="Disable AD account"
        confirmLabel="Disable"
        danger
        onClose={() => setDisable(null)}
        onConfirm={() => {
          if (disable) {
            store.setAdEnabled(disable.sam, false)
            toast(`${disable.sam} disabled`, 'warning')
          }
        }}
      >
        <strong>{disable?.displayName}</strong> will no longer be able to sign in to domain-joined devices or on-premises services. You can re-enable the account later.
      </ConfirmDialog>
      <ConfirmDialog
        open={confirm !== null}
        title="Delete AD user"
        confirmLabel="Delete"
        danger
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) {
            store.deleteAdUser(confirm.sam)
            toast(`${confirm.sam} deleted`, 'critical')
          }
        }}
      >
        This permanently deletes <strong>{confirm?.sam}</strong> from Active Directory and removes it from every group. Prefer disabling unless the account is certainly no longer needed.
      </ConfirmDialog>
    </>
  )
}

export function EntraUsersTab({ store, search }: { store: UmStore; search: string }) {
  const rows = store.entraUsers.filter((e) => matches(search, e.displayName, e.upn, e.mail, e.department, e.jobTitle))
  return (
    <div className="space-y-3">
      <Notice>
        Users that exist in Entra ID with no on-premises AD sync. They were created directly in the cloud (Microsoft 365 admin center, Entra portal or Graph), not through this portal or on-prem AD.
      </Notice>
      <p className="text-sm text-muted">{rows.length} cloud-only users</p>
      <DataTable
        caption="Cloud-only Entra ID users"
        columns={[
          { key: 'displayName', header: 'Name', render: (e) => <span className="font-medium">{e.displayName}</span> },
          { key: 'upn', header: 'UPN', render: (e) => <span className="break-all text-muted">{e.upn}</span> },
          { key: 'mail', header: 'Email' },
          { key: 'department', header: 'Department' },
          { key: 'jobTitle', header: 'Job title' },
          { key: 'accountEnabled', header: 'Account status', render: (e) => <Chip tone={e.accountEnabled ? 'good' : 'critical'}>{e.accountEnabled ? 'Enabled' : 'Disabled'}</Chip> },
          { key: 'createdAt', header: 'Created', render: (e) => fmtDate(e.createdAt.slice(0, 10)) },
        ]}
        rows={rows}
        rowKey={(e) => e.id}
        empty={<EmptyState icon={Cloud}>No cloud-only Entra ID users found.</EmptyState>}
      />
    </div>
  )
}

export function GroupsTab({ store, search, open }: { store: UmStore; search: string; open: Open }) {
  const [kind, setKind] = useState<'ad' | 'm365'>('ad')
  return (
    <div className="space-y-4">
      <TabBar
        label="Group source"
        tabs={[
          { id: 'ad', label: 'AD Groups' },
          { id: 'm365', label: 'M365 Groups' },
        ]}
        active={kind}
        onChange={(id) => setKind(id as 'ad' | 'm365')}
      />
      {kind === 'ad' ? (
        <DataTable
          caption="Active Directory groups"
          columns={[
            { key: 'name', header: 'Name', render: (g) => <span className="font-medium">{g.name}</span> },
            { key: 'sam', header: 'SAM', render: (g) => <span className="font-mono text-xs">{g.sam}</span> },
            { key: 'type', header: 'Type' },
            { key: 'scope', header: 'Scope' },
            { key: 'description', header: 'Description', render: (g) => <span className="text-muted">{g.description}</span> },
            {
              key: 'actions',
              header: 'Members',
              render: (g) => (
                <Button variant="ghost" size="md" onClick={() => open({ type: 'group', kind: 'ad', group: g })}>
                  <Users className="size-4" aria-hidden="true" />
                  {g.members.length}
                </Button>
              ),
            },
          ]}
          rows={store.adGroups.filter((g) => matches(search, g.name, g.sam, g.description))}
          rowKey={(g) => g.sam}
          empty={<EmptyState icon={Inbox}>No AD groups found.</EmptyState>}
        />
      ) : (
        <DataTable
          caption="Microsoft 365 groups"
          columns={[
            { key: 'name', header: 'Name', render: (g) => <span className="font-medium">{g.name}</span> },
            { key: 'type', header: 'Type' },
            { key: 'mailEnabled', header: 'Mail enabled', render: (g) => <Chip tone={g.mailEnabled ? 'good' : 'neutral'}>{g.mailEnabled ? 'Yes' : 'No'}</Chip> },
            { key: 'description', header: 'Description', render: (g) => <span className="text-muted">{g.description}</span> },
            {
              key: 'actions',
              header: 'Members',
              render: (g) => (
                <Button variant="ghost" size="md" onClick={() => open({ type: 'group', kind: 'm365', group: g })}>
                  <Users className="size-4" aria-hidden="true" />
                  {g.members.length}
                </Button>
              ),
            },
          ]}
          rows={store.m365Groups.filter((g) => matches(search, g.name, g.description))}
          rowKey={(g) => g.id}
          empty={<EmptyState icon={Inbox}>No M365 groups found.</EmptyState>}
        />
      )}
    </div>
  )
}

export function LicensesTab({ store, search, open }: { store: UmStore; search: string; open: Open }) {
  const consumed = useMemo(() => {
    const out: Record<string, number> = {}
    for (const list of Object.values(store.cloudLicenses)) for (const s of list) out[s] = (out[s] ?? 0) + 1
    return out
  }, [store.cloudLicenses])
  const rows = store.users.filter((u) => u.status === 'active' && matches(search, u.fullName, u.upn, u.license))
  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-faint">License pool</h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {licenseSkus.map((s) => {
            const used = consumed[s.skuId] ?? 0
            const pct = Math.round((used / s.total) * 100)
            return (
              <div key={s.skuId} className="rounded-md border border-line bg-elevated p-4">
                <p className="text-sm font-medium">{s.name}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {used} <span className="text-sm font-normal text-muted">/ {s.total}</span>
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
                  <div className={`h-full rounded-full ${pct > 90 ? 'bg-danger' : pct > 75 ? 'bg-warning' : 'bg-accent'}`} style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-faint">{s.total - used} available</p>
              </div>
            )
          })}
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-faint">User license assignments</h3>
        <DataTable
          caption="License assignments"
          columns={[
            { key: 'fullName', header: 'User', render: (u) => <span className="font-medium">{u.fullName}</span> },
            { key: 'upn', header: 'UPN', render: (u) => <span className="text-muted">{u.upn}</span> },
            { key: 'license', header: 'License (local record)', render: (u) => u.license || <span className="text-faint">none</span> },
            {
              key: 'cloud',
              header: 'Cloud licenses',
              render: (u) => {
                const list = store.cloudLicenses[u.upn] ?? []
                return list.length ? (
                  <span className="flex flex-wrap gap-1">
                    {list.map((s) => (
                      <Chip key={s} tone="blue">
                        {licenseSkus.find((x) => x.skuId === s)?.name ?? s}
                      </Chip>
                    ))}
                  </span>
                ) : (
                  <Chip tone={u.entra === 'pending' ? 'warning' : 'neutral'}>{u.entra === 'pending' ? 'Waiting for sync' : 'None'}</Chip>
                )
              },
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (u) => (
                <Button variant="ghost" onClick={() => open({ type: 'licenses', upn: u.upn, name: u.fullName })}>
                  <KeyRound className="size-4" aria-hidden="true" />
                  Manage
                </Button>
              ),
            },
          ]}
          rows={rows}
          rowKey={(u) => u.id}
          empty={<EmptyState icon={KeyRound}>No users found.</EmptyState>}
        />
      </div>
    </div>
  )
}

export function ScheduledTab({ store, search, open }: { store: UmStore; search: string; open: Open }) {
  const toast = useToast()
  const [cancel, setCancel] = useState<ScheduledTask | null>(null)
  const rows = [...store.scheduled].filter((t) => matches(search, t.target, t.detail, taskActionLabels[t.action])).sort((a, b) => (a.status === 'pending' ? -1 : 1) - (b.status === 'pending' ? -1 : 1) || b.runAt.localeCompare(a.runAt))
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">Scheduled and recent actions. A background worker runs due tasks; in the demo you can run a pending task yourself.</p>
      <DataTable
        caption="Scheduled tasks"
        columns={[
          { key: 'runAt', header: 'When', render: (t) => <span className="whitespace-nowrap tabular-nums">{fmtDateTime(t.runAt)}</span> },
          { key: 'action', header: 'Action', render: (t) => taskActionLabels[t.action] },
          { key: 'target', header: 'Target', render: (t) => <span className="font-medium">{t.target}</span> },
          { key: 'status', header: 'Status', render: (t) => <Chip tone={taskStatusTone[t.status]}>{t.status}</Chip> },
          { key: 'detail', header: 'Detail', render: (t) => <span className="text-muted">{t.detail}</span> },
          {
            key: 'manage',
            header: 'Manage',
            render: (t) =>
              t.status === 'pending' ? (
                <span className="flex items-center">
                  <IconButton
                    label={`Run ${taskActionLabels[t.action]} for ${t.target} now`}
                    icon={Play}
                    onClick={() => {
                      store.runTask(t.id)
                      toast(`${taskActionLabels[t.action]} executed`)
                    }}
                  />
                  <IconButton label={`Reschedule task for ${t.target}`} icon={RotateCcw} onClick={() => open({ type: 'reschedule', task: t })} />
                  <IconButton label={`Cancel task for ${t.target}`} icon={Trash2} danger onClick={() => setCancel(t)} />
                </span>
              ) : t.status === 'failed' ? (
                <Button variant="ghost" onClick={() => open({ type: 'reschedule', task: t })}>
                  Re-queue
                </Button>
              ) : (
                <span className="text-faint">-</span>
              ),
          },
        ]}
        rows={rows}
        rowKey={(t) => t.id}
        empty={<EmptyState icon={Inbox}>No scheduled tasks.</EmptyState>}
      />
      <ConfirmDialog
        open={cancel !== null}
        title="Cancel scheduled task"
        confirmLabel="Cancel task"
        danger
        onClose={() => setCancel(null)}
        onConfirm={() => {
          if (cancel) {
            store.cancelTask(cancel.id)
            toast('Task cancelled', 'warning')
          }
        }}
      >
        The {cancel ? taskActionLabels[cancel.action].toLowerCase() : 'task'} for <strong>{cancel?.target}</strong> will not run.
      </ConfirmDialog>
    </div>
  )
}

export function AuditTab({ store, search }: { store: UmStore; search: string }) {
  const toast = useToast()
  const rows = store.audit.filter((a) => matches(search, a.fullName, a.action, a.details, a.ticket, a.actor))
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          variant="secondary"
          onClick={() => {
            downloadCsv('user-management-audit.csv', ['Timestamp', 'User', 'Action', 'Details', 'Ticket', 'Performed by'], rows.map((a) => [a.timestamp, a.fullName, a.action, a.details, a.ticket, a.actor]))
            toast(`Exported ${rows.length} entries`)
          }}
        >
          <Download className="size-4" aria-hidden="true" />
          Export CSV
        </Button>
      </div>
      <DataTable
        caption="Audit log"
        dense
        columns={[
          { key: 'timestamp', header: 'Timestamp', render: (a) => <span className="whitespace-nowrap tabular-nums">{fmtDateTime(a.timestamp)}</span> },
          { key: 'fullName', header: 'User', render: (a) => <span className="font-medium">{a.fullName}</span> },
          { key: 'action', header: 'Action', render: (a) => <Chip tone={a.action.includes('FAIL') || a.action.includes('DELETE') ? 'critical' : a.action.startsWith('OFFBOARD') || a.action.includes('DISABLE') ? 'warning' : a.action.startsWith('ONBOARD') || a.action.includes('ASSIGN') ? 'good' : 'neutral'}>{a.action}</Chip> },
          { key: 'details', header: 'Details', render: (a) => <span className="text-muted">{a.details}</span> },
          { key: 'ticket', header: 'Ticket', render: (a) => <span className="font-mono text-xs">{a.ticket || '-'}</span> },
          { key: 'actor', header: 'Performed by', render: (a) => <span className="whitespace-nowrap">{a.actor}</span> },
        ]}
        rows={rows}
        rowKey={(a) => a.id}
        empty={<EmptyState icon={Inbox}>No audit entries yet.</EmptyState>}
      />
    </div>
  )
}
