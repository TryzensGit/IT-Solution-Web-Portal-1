import { useMemo, useState, type FormEvent } from 'react'
import { Columns3, Download, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { downloadCsv, fmtDate } from '../shared/format'
import {
  Card,
  Checkbox,
  Chip,
  ConfirmDialog,
  DataTable,
  DetailsGrid,
  Field,
  Input,
  Modal,
  SearchInput,
  Select,
  Textarea,
  useToast,
  type Column,
  type SortState,
} from '../shared/ui'
import { emptyAsset, refListLabels, rowFlag, statusTone, warrantyState, type Asset, type RefListKey } from './data'
import type { AssetStore } from './AssetDemo'

type Draft = Omit<Asset, 'id' | 'srNo'>

const allColumns: { key: keyof Asset; label: string; default: boolean }[] = [
  { key: 'srNo', label: 'Sr.No', default: false },
  { key: 'deviceName', label: 'Device / Display name', default: true },
  { key: 'makeModel', label: 'Make / Model', default: true },
  { key: 'serialNo', label: 'Device Sr.No.', default: false },
  { key: 'currentUser', label: 'Current user', default: true },
  { key: 'team', label: 'Team', default: false },
  { key: 'previousUser', label: 'Previous user', default: false },
  { key: 'assetType', label: 'Asset type', default: true },
  { key: 'employmentType', label: 'Employment type', default: false },
  { key: 'location', label: 'Location', default: true },
  { key: 'purchaseDate', label: 'Date of purchase', default: false },
  { key: 'allocationDate', label: 'User allocation date', default: false },
  { key: 'os', label: 'Operating system', default: true },
  { key: 'ram', label: 'Total RAM', default: false },
  { key: 'storage', label: 'Disk storage', default: false },
  { key: 'cpu', label: 'CPU', default: false },
  { key: 'warranty', label: 'Under warranty', default: false },
  { key: 'warrantyExpiry', label: 'Warranty expiry', default: true },
  { key: 'status', label: 'Status', default: true },
  { key: 'diagnostic', label: 'Diagnostic report', default: false },
  { key: 'remark', label: 'Remark', default: false },
  { key: 'jiraRef', label: 'Reference ticket', default: false },
]

const filterKeys: { key: RefListKey; all: string }[] = [
  { key: 'status', all: 'All status' },
  { key: 'location', all: 'All locations' },
  { key: 'assetType', all: 'All asset types' },
  { key: 'os', all: 'All OS' },
  { key: 'warranty', all: 'All warranty' },
]

export function AssetsTab({ store }: { store: AssetStore }) {
  const toast = useToast()
  const { assets, refLists, legend, isAdmin } = store
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Partial<Record<RefListKey, string>>>({})
  const [visible, setVisible] = useState<Set<keyof Asset>>(() => new Set(allColumns.filter((c) => c.default).map((c) => c.key)))
  const [colsOpen, setColsOpen] = useState(false)
  const [sort, setSort] = useState<SortState>({ key: 'srNo', dir: 1 })
  const [editing, setEditing] = useState<{ asset?: Asset } | null>(null)
  const [details, setDetails] = useState<Asset | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Asset | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return assets.filter((a) => {
      for (const f of filterKeys) {
        const v = filters[f.key]
        if (v && (a[f.key] ?? '') !== v) return false
      }
      if (!q) return true
      return [a.deviceName, a.serialNo, a.currentUser, a.makeModel, a.previousUser, a.team, a.jiraRef].some((x) => x?.toLowerCase().includes(q))
    })
  }, [assets, filters, search])

  const columns: Column<Asset>[] = allColumns
    .filter((c) => visible.has(c.key))
    .map((c) => ({
      key: c.key,
      header: c.label,
      sortValue: (a) => a[c.key] as string | number | undefined,
      render: (a) => {
        const v = a[c.key]
        if (c.key === 'status') return <Chip tone={statusTone(a.status)}>{a.status}</Chip>
        if (c.key === 'warrantyExpiry') {
          const w = warrantyState(a)
          return (
            <span className="inline-flex items-center gap-2">
              {fmtDate(a.warrantyExpiry)}
              {a.warranty === 'Yes' && <Chip tone={w.tone}>{w.label}</Chip>}
            </span>
          )
        }
        if (c.key === 'purchaseDate' || c.key === 'allocationDate') return fmtDate(v as string | undefined)
        if (c.key === 'serialNo') return <span className="font-mono text-xs">{String(v)}</span>
        if (c.key === 'deviceName') return <span className="font-medium">{String(v)}</span>
        return v === undefined || v === '' ? <span className="text-faint">-</span> : String(v)
      },
    }))

  const activeFilters = filterKeys.filter((f) => filters[f.key])

  function exportCsv(rows: Asset[]) {
    downloadCsv(
      'assets.csv',
      allColumns.map((c) => c.label),
      rows.map((a) => allColumns.map((c) => a[c.key] as string | number | undefined)),
    )
    toast(`Exported ${rows.length} assets`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search device, serial, user, model" className="w-full sm:w-72" />
        {filterKeys.map((f) => (
          <Select key={f.key} aria-label={refListLabels[f.key]} value={filters[f.key] ?? ''} onChange={(e) => setFilters((s) => ({ ...s, [f.key]: e.target.value || undefined }))} className="w-auto!">
            <option value="">{f.all}</option>
            {refLists[f.key].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </Select>
        ))}
        <div className="relative">
          <Button variant="secondary" onClick={() => setColsOpen((o) => !o)} aria-expanded={colsOpen}>
            <Columns3 className="size-4" aria-hidden="true" />
            Columns
          </Button>
          {colsOpen && (
            <div className="surface-card absolute left-0 z-30 mt-2 w-64 p-3 shadow-card-hover">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium">Show columns</span>
                <span className="flex gap-2">
                  <button type="button" className="text-accent hover:underline" onClick={() => setVisible(new Set(allColumns.map((c) => c.key)))}>
                    All
                  </button>
                  <button type="button" className="text-accent hover:underline" onClick={() => setVisible(new Set(allColumns.filter((c) => c.default).map((c) => c.key)))}>
                    Reset
                  </button>
                </span>
              </div>
              <div className="grid max-h-64 grid-cols-1 gap-1 overflow-y-auto">
                {allColumns.map((c) => (
                  <Checkbox
                    key={c.key}
                    label={c.label}
                    checked={visible.has(c.key)}
                    onChange={(e) =>
                      setVisible((s) => {
                        const n = new Set(s)
                        if (e.target.checked) n.add(c.key)
                        else n.delete(c.key)
                        return n
                      })
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <Button variant="secondary" onClick={() => exportCsv(filtered)}>
          <Download className="size-4" aria-hidden="true" />
          Export
        </Button>
        <Button onClick={() => setEditing({})} className="ml-auto">
          <Plus className="size-4" aria-hidden="true" />
          Add asset
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
        {activeFilters.map((f) => (
          <Chip key={f.key} tone="blue">
            {refListLabels[f.key]}: {filters[f.key]}
            <button type="button" aria-label={`Clear ${refListLabels[f.key]} filter`} onClick={() => setFilters((s) => ({ ...s, [f.key]: undefined }))} className="ml-0.5 hover:text-text">
              x
            </button>
          </Chip>
        ))}
        {activeFilters.length > 0 && (
          <button type="button" onClick={() => setFilters({})} className="text-accent hover:underline">
            Clear all
          </button>
        )}
        <span className="ml-auto tabular-nums">
          {filtered.length} of {assets.length} assets
        </span>
      </div>

      <DataTable
        caption="Asset inventory"
        columns={columns}
        rows={filtered}
        rowKey={(a) => a.id}
        sort={sort}
        onSort={setSort}
        onRowClick={setDetails}
        rowStyle={(a) => {
          const f = rowFlag(a, legend)
          return f ? { boxShadow: `inset 3px 0 0 ${f.color}`, backgroundColor: `color-mix(in srgb, ${f.color} 9%, transparent)` } : undefined
        }}
        empty="No assets match the current filters."
      />

      <Card title="Colour index: row flags">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {legend.map((r) => (
            <li key={r.id} className="flex items-start gap-2.5 text-sm">
              <span className="mt-1 inline-block size-3 shrink-0 rounded-sm border border-black/10" style={{ background: r.color }} aria-hidden="true" />
              <span>
                <span className="font-medium">{r.flag}</span> <span className="text-muted">{r.meaning}</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <AssetFormModal
        key={editing?.asset?.id ?? (editing ? 'new' : 'closed')}
        open={editing !== null}
        asset={editing?.asset}
        store={store}
        onClose={() => setEditing(null)}
      />

      <Modal
        open={details !== null}
        title={details ? `${details.deviceName}` : 'Asset details'}
        onClose={() => setDetails(null)}
        size="lg"
        footer={
          details && (
            <>
              {isAdmin && (
                <Button variant="ghost" className="mr-auto text-danger" onClick={() => setConfirmDelete(details)}>
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete
                </Button>
              )}
              <Button variant="secondary" onClick={() => setDetails(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setEditing({ asset: details })
                  setDetails(null)
                }}
              >
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </Button>
            </>
          )
        }
      >
        {details && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone={statusTone(details.status)}>{details.status}</Chip>
              {details.warranty === 'Yes' && <Chip tone={warrantyState(details).tone}>{warrantyState(details).label}</Chip>}
              {details.intuneCompliance && <Chip tone={details.intuneCompliance === 'Compliant' ? 'good' : details.intuneCompliance === 'Non-compliant' ? 'critical' : 'neutral'}>Intune: {details.intuneCompliance}</Chip>}
              {details.abmEnrolled !== undefined && <Chip tone={details.abmEnrolled ? 'good' : 'neutral'}>{details.abmEnrolled ? 'ABM enrolled' : 'Not in ABM'}</Chip>}
              {rowFlag(details, legend) && (
                <Chip tone="neutral">
                  <span className="inline-block size-2.5 rounded-sm" style={{ background: rowFlag(details, legend)!.color }} aria-hidden="true" />
                  {rowFlag(details, legend)!.flag}
                </Chip>
              )}
            </div>
            <DetailsGrid
              items={[
                { label: 'Sr.No', value: details.srNo },
                { label: 'Make / Model', value: details.makeModel },
                { label: 'Serial number', value: <span className="font-mono">{details.serialNo}</span> },
                { label: 'Asset type', value: details.assetType },
                { label: 'Current user', value: details.currentUser },
                { label: 'Team', value: details.team },
                { label: 'Previous user', value: details.previousUser },
                { label: 'Employment type', value: details.employmentType },
                { label: 'Location', value: details.location },
                { label: 'Date of purchase', value: fmtDate(details.purchaseDate) },
                { label: 'Assigned on', value: fmtDate(details.allocationDate) },
                { label: 'Warranty expires', value: fmtDate(details.warrantyExpiry) },
                { label: 'Operating system', value: details.os },
                { label: 'RAM', value: details.ram },
                { label: 'Storage', value: details.storage },
                { label: 'CPU', value: details.cpu },
                { label: 'Diagnostic report', value: details.diagnostic },
                { label: 'Remark', value: details.remark },
                { label: 'Reference ticket', value: details.jiraRef },
              ]}
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete asset"
        confirmLabel="Delete"
        danger
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            store.deleteAsset(confirmDelete.id)
            setDetails(null)
            toast(`${confirmDelete.deviceName} deleted`, 'critical')
          }
        }}
      >
        This removes <strong>{confirmDelete?.deviceName}</strong> from the inventory. In the demo this cannot be undone except by restoring the sample data from Settings.
      </ConfirmDialog>
    </div>
  )
}

function AssetFormModal({ open, asset, store, onClose }: { open: boolean; asset?: Asset; store: AssetStore; onClose: () => void }) {
  const toast = useToast()
  const { refLists } = store
  const [draft, setDraft] = useState<Draft>(() => (asset ? { ...asset } : emptyAsset()))
  const [error, setError] = useState<string | null>(null)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }))

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!draft.deviceName.trim() || !draft.makeModel.trim() || !draft.serialNo.trim()) {
      setError('Device name, make/model and serial number are required.')
      return
    }
    const dup = store.assets.find((a) => a.serialNo.toLowerCase() === draft.serialNo.trim().toLowerCase() && a.id !== asset?.id)
    if (dup) {
      setError(`Serial number already belongs to ${dup.deviceName}.`)
      return
    }
    const clean: Draft = { ...draft, deviceName: draft.deviceName.trim(), makeModel: draft.makeModel.trim(), serialNo: draft.serialNo.trim() }
    if (asset) {
      store.updateAsset(asset.id, clean)
      toast(`${clean.deviceName} updated`)
    } else {
      store.addAsset(clean)
      toast(`${clean.deviceName} added`)
    }
    onClose()
  }

  const opts = (key: RefListKey, allowEmpty = false) => (
    <>
      {allowEmpty && <option value="">-</option>}
      {refLists[key].map((v) => (
        <option key={v}>{v}</option>
      ))}
    </>
  )

  return (
    <Modal
      open={open}
      title={asset ? 'Edit asset' : 'Add asset'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="asset-form">
            Save asset
          </Button>
        </>
      }
    >
      <form id="asset-form" onSubmit={submit} className="space-y-5">
        <p className="text-sm text-muted">
          Fields marked <span className="text-danger">*</span> are required. Anything else can be left blank and added later.
        </p>
        {error && (
          <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-faint">Basic info</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Device / display name" required>
              <Input value={draft.deviceName} onChange={(e) => set('deviceName', e.target.value)} placeholder="e.g. LT-ALEX-23" />
            </Field>
            <Field label="Make / model" required>
              <Input value={draft.makeModel} onChange={(e) => set('makeModel', e.target.value)} placeholder="e.g. Dell Latitude 5440" />
            </Field>
            <Field label="Serial number" required>
              <Input value={draft.serialNo} onChange={(e) => set('serialNo', e.target.value)} placeholder="Printed on the device" />
            </Field>
          </div>
        </fieldset>
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-faint">Who is using it</legend>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Current user">
              <Input value={draft.currentUser ?? ''} onChange={(e) => set('currentUser', e.target.value)} />
            </Field>
            <Field label="Team">
              <Input value={draft.team ?? ''} onChange={(e) => set('team', e.target.value)} />
            </Field>
            <Field label="Previous user">
              <Input value={draft.previousUser ?? ''} onChange={(e) => set('previousUser', e.target.value)} />
            </Field>
            <Field label="Employment type">
              <Select value={draft.employmentType ?? ''} onChange={(e) => set('employmentType', e.target.value)}>
                {opts('employmentType', true)}
              </Select>
            </Field>
          </div>
        </fieldset>
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-faint">Type and status</legend>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Asset type">
              <Select value={draft.assetType} onChange={(e) => set('assetType', e.target.value)}>
                {opts('assetType')}
              </Select>
            </Field>
            <Field label="Location">
              <Select value={draft.location} onChange={(e) => set('location', e.target.value)}>
                {opts('location')}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={draft.status} onChange={(e) => set('status', e.target.value)}>
                {opts('status')}
              </Select>
            </Field>
            <Field label="Under warranty">
              <Select value={draft.warranty} onChange={(e) => set('warranty', e.target.value)}>
                {opts('warranty')}
              </Select>
            </Field>
          </div>
        </fieldset>
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-faint">Important dates</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Date of purchase">
              <Input type="date" value={draft.purchaseDate ?? ''} onChange={(e) => set('purchaseDate', e.target.value)} />
            </Field>
            <Field label="Assigned to user on">
              <Input type="date" value={draft.allocationDate ?? ''} onChange={(e) => set('allocationDate', e.target.value)} />
            </Field>
            <Field label="Warranty expires on">
              <Input type="date" value={draft.warrantyExpiry ?? ''} onChange={(e) => set('warrantyExpiry', e.target.value)} />
            </Field>
          </div>
        </fieldset>
        <details className="rounded-md border border-line p-3" open={Boolean(asset)}>
          <summary className="cursor-pointer text-sm font-medium">
            Specs <span className="font-normal text-faint">(optional)</span>
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Operating system">
              <Select value={draft.os ?? ''} onChange={(e) => set('os', e.target.value)}>
                {opts('os', true)}
              </Select>
            </Field>
            <Field label="RAM">
              <Select value={draft.ram ?? ''} onChange={(e) => set('ram', e.target.value)}>
                {opts('ram', true)}
              </Select>
            </Field>
            <Field label="Storage">
              <Select value={draft.storage ?? ''} onChange={(e) => set('storage', e.target.value)}>
                {opts('storage', true)}
              </Select>
            </Field>
            <Field label="Processor (CPU)">
              <Input value={draft.cpu ?? ''} onChange={(e) => set('cpu', e.target.value)} placeholder="e.g. Intel Core i5" />
            </Field>
          </div>
        </details>
        <details className="rounded-md border border-line p-3" open={Boolean(asset)}>
          <summary className="cursor-pointer text-sm font-medium">
            Notes and references <span className="font-normal text-faint">(optional)</span>
          </summary>
          <div className="mt-3 grid gap-3">
            <Field label="Condition / issue notes" hint='For example "Working: Ready to Allot". This drives the row colour flags.'>
              <Input value={draft.diagnostic ?? ''} onChange={(e) => set('diagnostic', e.target.value)} />
            </Field>
            <Field label="Additional notes">
              <Textarea value={draft.remark ?? ''} onChange={(e) => set('remark', e.target.value)} />
            </Field>
            <Field label="Reference / ticket ID">
              <Input value={draft.jiraRef ?? ''} onChange={(e) => set('jiraRef', e.target.value)} placeholder="e.g. TIS-1234" />
            </Field>
          </div>
        </details>
      </form>
    </Modal>
  )
}
