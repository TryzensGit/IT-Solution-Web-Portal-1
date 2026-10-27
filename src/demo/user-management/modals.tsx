import { useMemo, useState, type FormEvent } from 'react'
import { Clock, KeyRound, Pencil, Settings, UserMinus, UserPlus, UserRound, Users } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { fmtDate, fmtDateTime } from '../shared/format'
import { Checkbox, Chip, DetailsGrid, Field, Input, Modal, Notice, Select, Textarea, useToast } from '../shared/ui'
import { emptyOnboard, entraTone, licenseSkus, offboardReasons, ous, type AdGroup, type AdUser, type M365Group, type OffboardInput, type OnboardInput, type PortalUser, type ScheduledTask } from './data'
import type { UmStore } from './UserDemo'

function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
      {message}
    </p>
  )
}

function ScheduleField({ value, onChange, hint }: { value: string; onChange: (v: string) => void; hint: string }) {
  return (
    <Field
      label={
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5 text-muted" aria-hidden="true" />
          Schedule for later (optional)
        </span>
      }
      hint={hint}
      className="mr-auto"
    >
      <Input type="datetime-local" value={value} onChange={(e) => onChange(e.target.value)} className="max-w-[15rem]" />
    </Field>
  )
}

/* ------------------------------------------------------------------ */

export function OnboardModal({ open, store, onClose }: { open: boolean; store: UmStore; onClose: () => void }) {
  return open ? <OnboardForm store={store} onClose={onClose} /> : null
}

function OnboardForm({ store, onClose }: { store: UmStore; onClose: () => void }) {
  const toast = useToast()
  const [suffix, setSuffix] = useState(store.upnSuffixes[0])
  const [upnUser, setUpnUser] = useState('')
  const [d, setD] = useState<OnboardInput>(() => emptyOnboard(store.upnSuffixes[0]))
  const [schedule, setSchedule] = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const [error, setError] = useState<string | null>(null)
  const set = <K extends keyof OnboardInput>(k: K, v: OnboardInput[K]) => setD((x) => ({ ...x, [k]: v }))
  const setAd = <K extends keyof OnboardInput['ad']>(k: K, v: OnboardInput['ad'][K]) => setD((x) => ({ ...x, ad: { ...x.ad, [k]: v } }))

  function onName(name: string) {
    const parts = name.trim().split(/\s+/)
    const given = parts[0] ?? ''
    const sn = parts.slice(1).join(' ')
    const user = parts.length > 1 ? `${given}.${parts[parts.length - 1]}`.toLowerCase() : given.toLowerCase()
    setUpnUser(user)
    setD((x) => ({
      ...x,
      fullName: name,
      ad: { ...x.ad, displayName: name, givenName: given, surname: sn, sam: (given[0] ?? '').toLowerCase() + (parts[parts.length - 1] ?? '').toLowerCase() },
    }))
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const upn = `${upnUser.trim().toLowerCase()}@${suffix}`
    if (!d.fullName.trim() || !upnUser.trim() || !d.department.trim() || !d.jobTitle.trim() || !d.manager.trim() || !d.country.trim() || !d.ad.sam.trim()) {
      setError('Full name, UPN, department, job title, manager, country and SAM account are required.')
      return
    }
    if (!d.ad.password) {
      setError('A temporary password is required for the AD account.')
      return
    }
    if (store.users.some((u) => u.upn === upn) || store.adUsers.some((a) => a.upn === upn || a.sam === d.ad.sam.trim())) {
      setError('A user with that UPN or SAM account already exists.')
      return
    }
    const input: OnboardInput = { ...d, upn, ad: { ...d.ad, sam: d.ad.sam.trim(), password: undefined } }
    store.onboard(input, store.isAdmin && schedule ? schedule : undefined)
    toast(schedule ? `Onboarding of ${d.fullName} scheduled` : `${d.fullName} onboarded`)
    onClose()
  }

  const groups = store.adGroups.filter((g) => !groupFilter || g.name.toLowerCase().includes(groupFilter.toLowerCase()))

  return (
    <Modal
      open
      title="Onboard new user"
      icon={UserPlus}
      onClose={onClose}
      size="lg"
      footer={
        <>
          {store.isAdmin && <ScheduleField value={schedule} onChange={setSchedule} hint="Leave empty to onboard now." />}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="onboard-form">
            Onboard user
          </Button>
        </>
      }
    >
      <form id="onboard-form" onSubmit={submit} className="space-y-5">
        <ErrorBox message={error} />
        {!store.isAdmin && <Notice>Submitting this creates the on-prem AD account only. The rest of onboarding (local record, scheduling, licence) requires an administrator.</Notice>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name" required>
            <Input value={d.fullName} onChange={(e) => onName(e.target.value)} placeholder="Jordan Smith" />
          </Field>
          <Field label="UPN (email)" required>
            <div className="flex gap-2">
              <Input value={upnUser} onChange={(e) => setUpnUser(e.target.value)} placeholder="jordan.smith" aria-label="UPN user part" />
              <Select value={suffix} onChange={(e) => setSuffix(e.target.value)} aria-label="UPN domain" className="w-auto!">
                {store.upnSuffixes.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </div>
          </Field>
          <Field label="Department" required>
            <Input value={d.department} onChange={(e) => set('department', e.target.value)} placeholder="e.g. Engineering" />
          </Field>
          <Field label="Job title" required>
            <Input value={d.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} placeholder="e.g. Senior Developer" />
          </Field>
          <Field label="Manager" required hint="Email or SAM account">
            <Input value={d.manager} onChange={(e) => set('manager', e.target.value)} placeholder="manager@domain or manager" />
          </Field>
          <Field label="Location / office">
            <Input value={d.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. London HQ" />
          </Field>
          <Field label="Phone">
            <Input type="tel" value={d.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
          </Field>
          <Field label="Mobile">
            <Input type="tel" value={d.mobile ?? ''} onChange={(e) => set('mobile', e.target.value)} />
          </Field>
          <Field label="Country" required hint="2-letter code">
            <Input value={d.country} onChange={(e) => set('country', e.target.value.toUpperCase().slice(0, 2))} placeholder="GB" />
          </Field>
          <Field label="Start date">
            <Input type="date" value={d.startDate} onChange={(e) => set('startDate', e.target.value)} />
          </Field>
          <Field label="Contract end date" hint="If fixed-term">
            <Input type="date" value={d.contractEnd ?? ''} onChange={(e) => set('contractEnd', e.target.value)} />
          </Field>
          <Field label="License" hint="Assigned automatically once the account syncs to Entra ID.">
            <Select value={d.license} onChange={(e) => set('license', e.target.value)}>
              <option value="">None</option>
              {licenseSkus.map((s) => (
                <option key={s.skuId}>{s.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Input value={d.description ?? ''} onChange={(e) => set('description', e.target.value)} placeholder="e.g. Contractor, Project Apollo" />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <Textarea value={d.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
          </Field>
        </div>

        <fieldset className="rounded-md border border-line p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-faint">Active Directory account</legend>
          <p className="mb-3 text-sm text-muted">The account is created in AD when you onboard. SAM, given name and surname are filled in from the details above; adjust them if needed.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Display name" className="sm:col-span-3">
              <Input value={d.ad.displayName} onChange={(e) => setAd('displayName', e.target.value)} />
            </Field>
            <Field label="SAM account" required>
              <Input value={d.ad.sam} onChange={(e) => setAd('sam', e.target.value)} />
            </Field>
            <Field label="Given name">
              <Input value={d.ad.givenName} onChange={(e) => setAd('givenName', e.target.value)} />
            </Field>
            <Field label="Surname">
              <Input value={d.ad.surname} onChange={(e) => setAd('surname', e.target.value)} />
            </Field>
            <Field label="Temporary password" required>
              <Input type="password" value={d.ad.password ?? ''} onChange={(e) => setAd('password', e.target.value)} autoComplete="new-password" />
            </Field>
            <Field label="OU (optional)" className="sm:col-span-2">
              <Select value={d.ad.ou} onChange={(e) => setAd('ou', e.target.value)}>
                <option value="">Domain default</option>
                {ous.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </Select>
            </Field>
            <div className="sm:col-span-3">
              <Checkbox label="Require password change at first logon" checked={d.ad.mustChange} onChange={(e) => setAd('mustChange', e.target.checked)} />
            </div>
            <Field label="Add to AD groups (optional)" className="sm:col-span-3">
              <Input value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} placeholder="Filter groups" />
              <div className="mt-2 grid max-h-36 gap-1 overflow-y-auto rounded-md border border-line bg-elevated p-2 sm:grid-cols-2">
                {groups.map((g) => (
                  <Checkbox
                    key={g.sam}
                    label={g.name}
                    checked={d.ad.groups.includes(g.sam)}
                    onChange={(e) => setAd('groups', e.target.checked ? [...d.ad.groups, g.sam] : d.ad.groups.filter((x) => x !== g.sam))}
                  />
                ))}
              </div>
            </Field>
          </div>
        </fieldset>
      </form>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */

export function OffboardModal({ open, user, store, onClose }: { open: boolean; user?: PortalUser; store: UmStore; onClose: () => void }) {
  return open && user ? <OffboardForm key={user.id} user={user} store={store} onClose={onClose} /> : null
}

function OffboardForm({ user, store, onClose }: { user: PortalUser; store: UmStore; onClose: () => void }) {
  const toast = useToast()
  const [d, setD] = useState<OffboardInput>({ ticket: '', endDate: new Date().toISOString().slice(0, 10), reason: '', notes: '', disableAd: true, removeLicenses: true })
  const [schedule, setSchedule] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!d.ticket.trim() || !d.endDate) {
      setError('Ticket number and end date are required.')
      return
    }
    store.offboard(user.id, { ...d, ticket: d.ticket.trim() }, schedule || undefined)
    toast(schedule ? `Offboarding of ${user.fullName} scheduled` : `${user.fullName} offboarded`, 'warning')
    onClose()
  }

  return (
    <Modal
      open
      title="Offboard user"
      icon={UserMinus}
      onClose={onClose}
      footer={
        <>
          <ScheduleField value={schedule} onChange={setSchedule} hint="Leave empty to offboard now." />
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="offboard-form" className="bg-danger! hover:bg-danger/90! hover:shadow-none">
            Confirm offboard
          </Button>
        </>
      }
    >
      <form id="offboard-form" onSubmit={submit} className="space-y-4">
        <ErrorBox message={error} />
        <p className="text-sm text-muted">
          Offboarding: <strong className="text-text">{user.fullName}</strong> <span className="text-faint">({user.upn})</span>
        </p>
        <fieldset className="space-y-2 rounded-md border border-line p-3">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-faint">Integration actions</legend>
          <div className="flex items-center gap-2">
            <Checkbox label="Disable Active Directory account" checked={d.disableAd} onChange={(e) => setD((x) => ({ ...x, disableAd: e.target.checked }))} />
            <Chip tone="ai">simulated</Chip>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox label="Remove all M365 licenses via Graph" checked={d.removeLicenses} onChange={(e) => setD((x) => ({ ...x, removeLicenses: e.target.checked }))} />
            <Chip tone="ai">simulated</Chip>
          </div>
        </fieldset>
        <Field label="Ticket number" required>
          <Input value={d.ticket} onChange={(e) => setD((x) => ({ ...x, ticket: e.target.value }))} placeholder="e.g. INC0012345" />
        </Field>
        <Field label="End date" required>
          <Input type="date" value={d.endDate} onChange={(e) => setD((x) => ({ ...x, endDate: e.target.value }))} />
        </Field>
        <Field label="Reason">
          <Select value={d.reason} onChange={(e) => setD((x) => ({ ...x, reason: e.target.value }))}>
            <option value="">Select</option>
            {offboardReasons.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
        </Field>
        <Field label="Notes">
          <Textarea value={d.notes ?? ''} onChange={(e) => setD((x) => ({ ...x, notes: e.target.value }))} />
        </Field>
      </form>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */

export function UserDetailsModal({ open, user, store, onClose, onOffboard }: { open: boolean; user?: PortalUser; store: UmStore; onClose: () => void; onOffboard: (u: PortalUser) => void }) {
  if (!open || !user) return null
  const ad = store.adUsers.find((a) => a.upn === user.upn)
  const licenses = store.cloudLicenses[user.upn] ?? []
  return (
    <Modal
      open
      title="User details"
      icon={UserRound}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {user.status === 'active' && (
            <Button className="bg-danger! hover:bg-danger/90! hover:shadow-none" onClick={() => onOffboard(user)}>
              <UserMinus className="size-4" aria-hidden="true" />
              Offboard
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-accent-soft text-base font-semibold text-accent">
            {user.fullName
              .split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2)}
          </span>
          <div>
            <p className="text-lg font-semibold tracking-tight">{user.fullName}</p>
            <p className="text-sm text-muted">{user.upn}</p>
          </div>
          <span className="ml-auto flex flex-wrap gap-2">
            <Chip tone={user.status === 'active' ? 'good' : 'critical'}>{user.status === 'active' ? 'Active' : 'Offboarded'}</Chip>
            <Chip tone={entraTone[user.entra].tone}>{entraTone[user.entra].label}</Chip>
          </span>
        </div>
        <DetailsGrid
          items={[
            { label: 'Department', value: user.department },
            { label: 'Job title', value: user.jobTitle },
            { label: 'Manager', value: user.manager },
            { label: 'Location', value: user.location },
            { label: 'Start date', value: fmtDate(user.startDate) },
            { label: 'End date', value: fmtDate(user.endDate) },
            { label: 'License (local record)', value: user.license || 'None' },
            { label: 'Cloud licenses', value: licenses.length ? licenses.map((s) => licenseSkus.find((x) => x.skuId === s)?.name ?? s).join(', ') : 'None' },
            { label: 'Ticket', value: user.ticket },
            { label: 'Reason', value: user.reason },
            { label: 'Notes', value: user.notes },
            { label: 'Record updated', value: fmtDateTime(user.updatedAt) },
          ]}
        />
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">Active Directory</h3>
          {ad ? (
            <DetailsGrid
              items={[
                { label: 'SAM account', value: <span className="font-mono">{ad.sam}</span> },
                { label: 'Account', value: <Chip tone={ad.enabled ? 'good' : 'critical'}>{ad.enabled ? 'Enabled' : 'Disabled'}</Chip> },
                { label: 'OU', value: <span className="font-mono text-xs">{ad.ou}</span> },
                { label: 'Groups', value: store.adGroups.filter((g) => g.members.includes(ad.sam)).map((g) => g.name).join(', ') || 'None' },
              ]}
            />
          ) : (
            <p className="text-sm text-muted">No matching AD account.</p>
          )}
        </div>
      </div>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */

export function EditAdUserModal({ open, adUser, store, onClose }: { open: boolean; adUser?: AdUser; store: UmStore; onClose: () => void }) {
  return open && adUser ? <EditAdForm key={adUser.sam} adUser={adUser} store={store} onClose={onClose} /> : null
}

function EditAdForm({ adUser, store, onClose }: { adUser: AdUser; store: UmStore; onClose: () => void }) {
  const toast = useToast()
  const [d, setD] = useState({ displayName: adUser.displayName, department: adUser.department, jobTitle: adUser.jobTitle, ou: adUser.ou, description: adUser.description ?? '' })
  const [schedule, setSchedule] = useState('')
  return (
    <Modal
      open
      title="Edit AD user"
      icon={Pencil}
      onClose={onClose}
      footer={
        <>
          <ScheduleField value={schedule} onChange={setSchedule} hint="Leave empty to apply now." />
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-ad-form">
            Save changes
          </Button>
        </>
      }
    >
      <form
        id="edit-ad-form"
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          const patch: Partial<AdUser> = {}
          if (d.displayName !== adUser.displayName) patch.displayName = d.displayName
          if (d.department !== adUser.department) patch.department = d.department
          if (d.jobTitle !== adUser.jobTitle) patch.jobTitle = d.jobTitle
          if (d.ou !== adUser.ou) patch.ou = d.ou
          if (d.description !== (adUser.description ?? '')) patch.description = d.description
          if (Object.keys(patch).length === 0) {
            onClose()
            return
          }
          store.updateAdUser(adUser.sam, patch, schedule || undefined)
          toast(schedule ? 'AD change scheduled' : `${adUser.sam} updated`)
          onClose()
        }}
      >
        <p className="text-sm text-muted sm:col-span-2">
          Editing <span className="font-mono">{adUser.sam}</span> <span className="text-faint">({adUser.upn})</span>
        </p>
        <Field label="Display name" className="sm:col-span-2">
          <Input value={d.displayName} onChange={(e) => setD((x) => ({ ...x, displayName: e.target.value }))} />
        </Field>
        <Field label="Department">
          <Input value={d.department} onChange={(e) => setD((x) => ({ ...x, department: e.target.value }))} />
        </Field>
        <Field label="Job title">
          <Input value={d.jobTitle} onChange={(e) => setD((x) => ({ ...x, jobTitle: e.target.value }))} />
        </Field>
        <Field label="Organizational unit" className="sm:col-span-2">
          <Select value={d.ou} onChange={(e) => setD((x) => ({ ...x, ou: e.target.value }))}>
            {ous.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <Input value={d.description} onChange={(e) => setD((x) => ({ ...x, description: e.target.value }))} />
        </Field>
      </form>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */

type GroupSelection = { kind: 'ad'; group: AdGroup } | { kind: 'm365'; group: M365Group }

export function GroupMembersModal({ open, selection, store, onClose }: { open: boolean; selection?: GroupSelection; store: UmStore; onClose: () => void }) {
  const toast = useToast()
  const [add, setAdd] = useState('')
  const [error, setError] = useState<string | null>(null)
  if (!open || !selection) return null

  const live = selection.kind === 'ad' ? store.adGroups.find((g) => g.sam === selection.group.sam) : store.m365Groups.find((g) => g.id === selection.group.id)
  if (!live) return null
  const id = selection.kind === 'ad' ? (live as AdGroup).sam : (live as M365Group).id
  const members = live.members

  const label = (m: string) => {
    if (selection.kind === 'ad') {
      const a = store.adUsers.find((x) => x.sam === m)
      return a ? `${a.displayName} (${a.sam})` : m
    }
    const u = store.users.find((x) => x.upn === m) ?? store.entraUsers.find((x) => x.upn === m)
    return u ? `${'fullName' in u ? u.fullName : u.displayName} (${m})` : m
  }

  function addMember(e: FormEvent) {
    e.preventDefault()
    const v = add.trim().toLowerCase()
    if (!v) return
    let resolved: string | undefined
    if (selection!.kind === 'ad') {
      resolved = store.adUsers.find((a) => a.sam.toLowerCase() === v || a.upn.toLowerCase() === v)?.sam
    } else {
      const byUpn = store.users.find((u) => u.upn.toLowerCase() === v) ?? store.entraUsers.find((u) => u.upn.toLowerCase() === v)
      const bySam = store.adUsers.find((a) => a.sam.toLowerCase() === v)
      resolved = byUpn?.upn ?? bySam?.upn
    }
    if (!resolved) {
      setError(selection!.kind === 'ad' ? 'No AD user with that SAM or UPN.' : 'No user with that UPN or on-prem SAM.')
      return
    }
    if (members.includes(resolved)) {
      setError('Already a member.')
      return
    }
    store.setGroupMembers(selection!.kind, id, [...members, resolved], `Added ${resolved}`)
    setAdd('')
    setError(null)
    toast('Member added')
  }

  return (
    <Modal open title={`Group members: ${live.name}`} icon={Users} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-muted">{live.description}</p>
        <form onSubmit={addMember} className="flex gap-2">
          <Input value={add} onChange={(e) => setAdd(e.target.value)} placeholder={selection.kind === 'ad' ? 'Add by SAM or UPN' : 'Add by UPN or on-prem SAM'} aria-label="New member" />
          <Button type="submit">Add</Button>
        </form>
        <ErrorBox message={error} />
        <ul className="divide-y divide-line rounded-md border border-line">
          {members.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">No members.</li>}
          {members.map((m) => (
            <li key={m} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span>{label(m)}</span>
              <button
                type="button"
                onClick={() => {
                  store.setGroupMembers(selection.kind, id, members.filter((x) => x !== m), `Removed ${m}`)
                  toast('Member removed', 'warning')
                }}
                className="text-xs font-medium text-muted hover:text-danger"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */

export function ManageLicensesModal({ open, target, store, onClose }: { open: boolean; target?: { upn: string; name: string }; store: UmStore; onClose: () => void }) {
  const toast = useToast()
  const [sku, setSku] = useState('')
  const consumed = useMemo(() => {
    const out: Record<string, number> = {}
    for (const list of Object.values(store.cloudLicenses)) for (const s of list) out[s] = (out[s] ?? 0) + 1
    return out
  }, [store.cloudLicenses])
  if (!open || !target) return null
  const current = store.cloudLicenses[target.upn] ?? []
  const available = licenseSkus.filter((s) => !current.includes(s.skuId))
  return (
    <Modal open title="Manage licenses" icon={KeyRound} onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm text-muted">
          <strong className="text-text">{target.name}</strong> <span className="text-faint">({target.upn})</span>
        </p>
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">Current licenses</h3>
          {current.length === 0 ? (
            <p className="text-sm text-muted">No cloud licenses assigned.</p>
          ) : (
            <ul className="divide-y divide-line rounded-md border border-line">
              {current.map((s) => (
                <li key={s} className="flex items-center justify-between px-3 py-2 text-sm">
                  {licenseSkus.find((x) => x.skuId === s)?.name ?? s}
                  <button
                    type="button"
                    onClick={() => {
                      store.removeLicense(target.upn, s)
                      toast('License removed', 'warning')
                    }}
                    className="text-xs font-medium text-muted hover:text-danger"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!sku) return
            store.assignLicense(target.upn, sku)
            setSku('')
            toast('License assigned')
          }}
        >
          <h3 className="text-xs font-semibold uppercase tracking-wide text-faint">Assign new license</h3>
          <div className="flex gap-2">
            <Select value={sku} onChange={(e) => setSku(e.target.value)} aria-label="License">
              <option value="">Choose a license</option>
              {available.map((s) => (
                <option key={s.skuId} value={s.skuId} disabled={(consumed[s.skuId] ?? 0) >= s.total}>
                  {s.name} ({s.total - (consumed[s.skuId] ?? 0)} available)
                </option>
              ))}
            </Select>
            <Button type="submit" disabled={!sku}>
              Assign
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */

export function RescheduleModal({ open, task, store, onClose }: { open: boolean; task?: ScheduledTask; store: UmStore; onClose: () => void }) {
  const toast = useToast()
  const [when, setWhen] = useState('')
  if (!open || !task) return null
  return (
    <Modal
      open
      title={task.status === 'failed' ? 'Re-queue task' : 'Reschedule task'}
      icon={Clock}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!when}
            onClick={() => {
              store.rescheduleTask(task.id, when)
              toast('Task rescheduled')
              onClose()
            }}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-muted">
          <strong className="text-text">{task.target}</strong>: {task.detail}
        </p>
        <Field label="Run at">
          <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        </Field>
      </div>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */

export function UmSettingsModal({ open, store, onClose }: { open: boolean; store: UmStore; onClose: () => void }) {
  const toast = useToast()
  const [suffix, setSuffix] = useState('')
  if (!open) return null
  return (
    <Modal open title="Organization settings" icon={Settings} onClose={onClose}>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Organization logo</h3>
          <p className="mt-1 text-sm text-muted">Admins can upload a logo shown across the portal and on the login page.</p>
          <div className="mt-2">
            <Notice tone="neutral">Logo upload is switched off in the demo, so the sign-in page and top bar show the neutral mark instead of a company logo.</Notice>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold tracking-tight">
            UPN suffixes <Chip tone="neutral">admin</Chip>
          </h3>
          <p className="mt-1 text-sm text-muted">Domains offered in the onboarding form.</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {store.upnSuffixes.map((s) => (
              <li key={s}>
                <Chip tone="neutral">
                  {s}
                  {store.upnSuffixes.length > 1 && (
                    <button type="button" aria-label={`Remove ${s}`} onClick={() => store.setUpnSuffixes(store.upnSuffixes.filter((x) => x !== s))} className="ml-0.5 hover:text-danger">
                      x
                    </button>
                  )}
                </Chip>
              </li>
            ))}
          </ul>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const v = suffix.trim().toLowerCase()
              if (!v || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(v) || store.upnSuffixes.includes(v)) return
              store.setUpnSuffixes([...store.upnSuffixes, v])
              setSuffix('')
              toast('Suffix added')
            }}
          >
            <Input value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="e.g. apac.demo.example.com" aria-label="New UPN suffix" />
            <Button type="submit">Add</Button>
          </form>
        </div>
      </div>
    </Modal>
  )
}
