import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Download, Plus, Trash2, Upload } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { downloadCsv, fmtDateTime, uid } from '../shared/format'
import { Chip, ConfirmDialog, DataTable, DetailsGrid, Field, Input, Modal, Notice, SearchInput, Select, useToast, type SortState } from '../shared/ui'
import { auditActionLabels, legendFieldLabel, refListLabels, type Asset, type AuditAction, type LegendRule, type RefListKey } from './data'
import type { AssetStore } from './AssetDemo'

/* ------------------------------------------------------------------
   Audit log
------------------------------------------------------------------- */

export function AuditTab({ store }: { store: AssetStore }) {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('')
  const [entity, setEntity] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState<SortState>({ key: 'createdAt', dir: -1 })

  const entities = useMemo(() => Array.from(new Set(store.audit.map((a) => a.entityType))).sort(), [store.audit])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return store.audit.filter((e) => {
      if (action && e.action !== action) return false
      if (entity && e.entityType !== entity) return false
      if (from && e.createdAt.slice(0, 10) < from) return false
      if (to && e.createdAt.slice(0, 10) > to) return false
      if (!q) return true
      return [e.userName, e.entityLabel, e.details].some((x) => x.toLowerCase().includes(q))
    })
  }, [store.audit, search, action, entity, from, to])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search user, entity, details" className="w-full sm:w-64" />
        <Select aria-label="Action" value={action} onChange={(e) => setAction(e.target.value)} className="w-auto!">
          <option value="">All actions</option>
          {(Object.keys(auditActionLabels) as AuditAction[]).map((k) => (
            <option key={k} value={k}>
              {auditActionLabels[k].label}
            </option>
          ))}
        </Select>
        <Select aria-label="Entity type" value={entity} onChange={(e) => setEntity(e.target.value)} className="w-auto!">
          <option value="">All entity types</option>
          {entities.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </Select>
        <Field label="From" className="w-auto!">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="To" className="w-auto!">
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
        <Button
          variant="secondary"
          onClick={() => {
            setSearch('')
            setAction('')
            setEntity('')
            setFrom('')
            setTo('')
          }}
        >
          Clear
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            downloadCsv(
              'audit-log.csv',
              ['Timestamp', 'User', 'Action', 'Entity type', 'Entity', 'Details'],
              rows.map((e) => [e.createdAt, e.userName, auditActionLabels[e.action].label, e.entityType, e.entityLabel, e.details]),
            )
            toast(`Exported ${rows.length} entries`)
          }}
        >
          <Download className="size-4" aria-hidden="true" />
          Export CSV
        </Button>
        <span className="ml-auto text-sm tabular-nums text-muted">{rows.length} entries</span>
      </div>
      <DataTable
        caption="Audit log"
        dense
        sort={sort}
        onSort={setSort}
        columns={[
          { key: 'createdAt', header: 'Timestamp', sortValue: (e) => e.createdAt, render: (e) => <span className="whitespace-nowrap tabular-nums">{fmtDateTime(e.createdAt)}</span> },
          { key: 'userName', header: 'User', sortValue: (e) => e.userName },
          { key: 'action', header: 'Action', render: (e) => <Chip tone={auditActionLabels[e.action].tone}>{auditActionLabels[e.action].label}</Chip> },
          {
            key: 'entity',
            header: 'Entity',
            render: (e) => (
              <span>
                <span className="font-medium">{e.entityLabel}</span> <span className="text-faint">({e.entityType})</span>
              </span>
            ),
          },
          { key: 'details', header: 'Details', render: (e) => <span className="text-muted">{e.details}</span> },
        ]}
        rows={rows}
        rowKey={(e) => e.id}
        empty="No audit log entries match."
      />
    </div>
  )
}

/* ------------------------------------------------------------------
   Settings
------------------------------------------------------------------- */

type Pane = 'colorIndex' | 'importExport' | 'reflists' | 'logo' | 'integrations' | 'danger'

const panes: { id: Pane; label: string; danger?: boolean }[] = [
  { id: 'colorIndex', label: 'Colour index' },
  { id: 'importExport', label: 'Import / Export' },
  { id: 'reflists', label: 'Reference lists' },
  { id: 'logo', label: 'Company logo' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'danger', label: 'Danger zone', danger: true },
]

export function SettingsModal({ store, open, onClose }: { store: AssetStore; open: boolean; onClose: () => void }) {
  const [pane, setPane] = useState<Pane>('colorIndex')
  return (
    <Modal open={open} title="Settings" onClose={onClose} size="xl">
      <div className="grid gap-5 md:grid-cols-[11rem_1fr]">
        <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto md:flex-col">
          {panes.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPane(p.id)}
              aria-current={pane === p.id ? 'page' : undefined}
              className={`shrink-0 rounded-md px-3 py-1.5 text-left text-sm font-medium ${
                pane === p.id ? 'bg-accent-soft text-accent' : p.danger ? 'text-danger hover:bg-elevated' : 'text-muted hover:bg-elevated hover:text-text'
              }`}
            >
              {p.label}
            </button>
          ))}
        </nav>
        <div className="min-w-0">
          {pane === 'colorIndex' && <ColorIndexPane store={store} />}
          {pane === 'importExport' && <ImportExportPane store={store} />}
          {pane === 'reflists' && <RefListsPane store={store} />}
          {pane === 'logo' && <LogoPane />}
          {pane === 'integrations' && <IntegrationsPane store={store} />}
          {pane === 'danger' && <DangerPane store={store} />}
        </div>
      </div>
    </Modal>
  )
}

function PaneTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold tracking-tight">{children}</h3>
      {hint && <p className="mt-1 text-sm leading-relaxed text-muted">{hint}</p>}
    </div>
  )
}

function ColorIndexPane({ store }: { store: AssetStore }) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<Omit<LegendRule, 'id'>>({ color: '#d03b3b', flag: '', field: 'status', matchValue: '', meaning: '' })
  return (
    <div>
      <PaneTitle hint="Computed automatically from each asset's status, diagnostic report, remark and date of purchase. The first matching rule colours the row.">
        Colour index: row flags
      </PaneTitle>
      <ul className="space-y-2">
        {store.legend.map((r) => (
          <li key={r.id} className="flex items-start gap-3 rounded-md border border-line p-3 text-sm">
            <span className="mt-0.5 inline-block size-4 shrink-0 rounded-sm border border-black/10" style={{ background: r.color }} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {r.flag} <span className="font-normal text-faint">{legendFieldLabel(r.field)}{r.matchValue ? ` "${r.matchValue}"` : ''}</span>
              </p>
              <p className="text-muted">{r.meaning}</p>
            </div>
            <button type="button" aria-label={`Remove ${r.flag} rule`} onClick={() => store.setLegend(store.legend.filter((x) => x.id !== r.id))} className="text-muted hover:text-danger">
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      {adding ? (
        <form
          className="mt-4 grid gap-3 rounded-md border border-line p-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!draft.flag.trim() || !draft.meaning.trim()) return
            store.setLegend([...store.legend, { ...draft, id: uid('legend') }])
            setAdding(false)
            setDraft({ color: '#d03b3b', flag: '', field: 'status', matchValue: '', meaning: '' })
          }}
        >
          <Field label="Flag colour">
            <input type="color" value={draft.color} onChange={(e) => setDraft((d) => ({ ...d, color: e.target.value }))} className="h-9 w-16 cursor-pointer rounded-md border border-line bg-surface" aria-label="Flag colour" />
          </Field>
          <Field label="Flag label" required>
            <Input value={draft.flag} onChange={(e) => setDraft((d) => ({ ...d, flag: e.target.value }))} placeholder="e.g. Orange" />
          </Field>
          <Field label="Match on">
            <Select value={draft.field} onChange={(e) => setDraft((d) => ({ ...d, field: e.target.value as LegendRule['field'] }))}>
              <option value="status">Status equals</option>
              <option value="diagnostic">Diagnostic report equals</option>
              <option value="remark">Remark has any note</option>
              <option value="purchaseAge">Purchase date older than (years)</option>
            </Select>
          </Field>
          <Field label="Value to match">
            <Input value={draft.matchValue} onChange={(e) => setDraft((d) => ({ ...d, matchValue: e.target.value }))} placeholder="Leave blank to match any value" />
          </Field>
          <Field label="Meaning shown in the legend" required className="sm:col-span-2">
            <Input value={draft.meaning} onChange={(e) => setDraft((d) => ({ ...d, meaning: e.target.value }))} />
          </Field>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit">Add rule</Button>
            <Button variant="secondary" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="secondary" className="mt-4" onClick={() => setAdding(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Add rule
        </Button>
      )}
    </div>
  )
}

const csvColumns: { key: keyof Asset; header: string }[] = [
  { key: 'deviceName', header: 'Device/Display Name' },
  { key: 'makeModel', header: 'Make/Model' },
  { key: 'serialNo', header: 'Device Sr.No.' },
  { key: 'currentUser', header: 'Current User' },
  { key: 'team', header: 'Team' },
  { key: 'previousUser', header: 'Previous User' },
  { key: 'assetType', header: 'Asset Type' },
  { key: 'employmentType', header: 'Employment Type' },
  { key: 'location', header: 'Location' },
  { key: 'purchaseDate', header: 'Date of Purchase' },
  { key: 'allocationDate', header: 'User Allocation Date' },
  { key: 'os', header: 'Operating System' },
  { key: 'ram', header: 'Total RAM (GB)' },
  { key: 'storage', header: 'Disk Storage Capacity' },
  { key: 'cpu', header: 'CPU Speed' },
  { key: 'warranty', header: 'Under Warranty' },
  { key: 'warrantyExpiry', header: 'Warranty Expiring Date' },
  { key: 'status', header: 'Status' },
  { key: 'diagnostic', header: 'Diagnostic Report' },
  { key: 'remark', header: 'Remark' },
  { key: 'jiraRef', header: 'Reference Jira ID' },
]

/** Minimal CSV parser: handles quoted fields, escaped quotes and CRLF. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i += 1
        } else quoted = false
      } else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += ch
  }
  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim()))
}

function ImportExportPane({ store }: { store: AssetStore }) {
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [log, setLog] = useState('')

  async function importFile() {
    const file = fileRef.current?.files?.[0]
    if (!file) {
      setLog('Choose a CSV file first.')
      return
    }
    const text = await file.text()
    const [header, ...body] = parseCsv(text)
    if (!header) {
      setLog('The file is empty.')
      return
    }
    const idx = csvColumns.map((c) => header.findIndex((h) => h.trim().toLowerCase() === c.header.toLowerCase()))
    if (idx.every((i) => i < 0)) {
      setLog('No recognised columns. Download the blank template to see the expected headers.')
      return
    }
    const rows: Omit<Asset, 'id' | 'srNo'>[] = []
    const skipped: string[] = []
    body.forEach((r, n) => {
      const get = (k: keyof Asset) => {
        const i = idx[csvColumns.findIndex((c) => c.key === k)]
        return i >= 0 ? (r[i] ?? '').trim() : ''
      }
      const deviceName = get('deviceName')
      const makeModel = get('makeModel')
      const serialNo = get('serialNo')
      if (!deviceName || !makeModel) {
        skipped.push(`Row ${n + 2}: missing device name or make/model`)
        return
      }
      rows.push({
        deviceName,
        makeModel,
        serialNo: serialNo || `IMPORT-${Date.now().toString(36)}-${n}`,
        currentUser: get('currentUser'),
        team: get('team'),
        previousUser: get('previousUser'),
        assetType: get('assetType') || 'Other',
        employmentType: get('employmentType'),
        location: get('location') || 'Unknown',
        purchaseDate: get('purchaseDate'),
        allocationDate: get('allocationDate'),
        os: get('os'),
        ram: get('ram'),
        storage: get('storage'),
        cpu: get('cpu'),
        warranty: get('warranty') || 'NA',
        warrantyExpiry: get('warrantyExpiry'),
        status: get('status') || 'Spare',
        diagnostic: get('diagnostic'),
        remark: get('remark'),
        jiraRef: get('jiraRef'),
      })
    })
    const result = store.importAssets(rows)
    setLog([`${rows.length} rows read: ${result.created} created, ${result.updated} updated (matched by serial number).`, ...skipped].join('\n'))
    toast('Import finished')
  }

  return (
    <div className="space-y-6">
      <div>
        <PaneTitle hint="Download the full inventory as CSV, or a blank template with the expected column headers.">Export</PaneTitle>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              downloadCsv('assets-all.csv', csvColumns.map((c) => c.header), store.assets.map((a) => csvColumns.map((c) => a[c.key] as string | undefined)))
              toast(`Exported ${store.assets.length} assets`)
            }}
          >
            <Download className="size-4" aria-hidden="true" />
            Export all assets (CSV)
          </Button>
          <Button variant="secondary" onClick={() => downloadCsv('assets-template.csv', csvColumns.map((c) => c.header), [])}>
            Download blank template
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const blob = new Blob([JSON.stringify({ assets: store.assets, refLists: store.refLists, legend: store.legend }, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'assets-backup.json'
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            Export as JSON (backup)
          </Button>
        </div>
      </div>
      <div>
        <PaneTitle hint="Import a CSV using the template's column headers. Rows with a matching serial number update the existing asset; new rows are added.">Import</PaneTitle>
        <div className="flex flex-wrap items-center gap-2">
          <input ref={fileRef} type="file" accept=".csv,text/csv" aria-label="CSV file" className="text-sm file:mr-3 file:rounded-md file:border file:border-line file:bg-surface file:px-3 file:py-1.5 file:text-sm file:text-text" />
          <Button onClick={importFile}>
            <Upload className="size-4" aria-hidden="true" />
            Import CSV
          </Button>
        </div>
        {log && <pre className="mt-3 whitespace-pre-wrap rounded-md border border-line bg-elevated p-3 text-xs text-muted">{log}</pre>}
      </div>
    </div>
  )
}

function RefListsPane({ store }: { store: AssetStore }) {
  const [key, setKey] = useState<RefListKey>('status')
  const [value, setValue] = useState('')
  const list = store.refLists[key]
  return (
    <div>
      <PaneTitle hint="These populate every dropdown in the add/edit asset form and the filter bar.">Dropdown reference lists</PaneTitle>
      <Field label="List" className="max-w-xs">
        <Select value={key} onChange={(e) => setKey(e.target.value as RefListKey)}>
          {(Object.keys(refListLabels) as RefListKey[]).map((k) => (
            <option key={k} value={k}>
              {refListLabels[k]}
            </option>
          ))}
        </Select>
      </Field>
      <ul className="mt-4 flex flex-wrap gap-2">
        {list.map((v) => (
          <li key={v}>
            <Chip tone="neutral">
              {v}
              <button
                type="button"
                aria-label={`Remove ${v}`}
                onClick={() =>
                  store.setRefList(
                    key,
                    list.filter((x) => x !== v),
                    `Removed "${v}"`,
                  )
                }
                className="ml-0.5 hover:text-danger"
              >
                x
              </button>
            </Chip>
          </li>
        ))}
      </ul>
      <form
        className="mt-4 flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const v = value.trim()
          if (!v || list.some((x) => x.toLowerCase() === v.toLowerCase())) return
          store.setRefList(key, [...list, v], `Added "${v}"`)
          setValue('')
        }}
      >
        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Add value" aria-label="New value" />
        <Button type="submit">Add</Button>
      </form>
    </div>
  )
}

function LogoPane() {
  return (
    <div>
      <PaneTitle hint="In the real application an administrator uploads a light and a dark logo here, and they appear on the sign-in page and the top bar.">Company logo</PaneTitle>
      <Notice tone="neutral">Logo upload is switched off in the demo, so the sign-in page and top bar show the neutral mark instead of a company logo.</Notice>
    </div>
  )
}

function IntegrationsPane({ store }: { store: AssetStore }) {
  const toast = useToast()
  const enrolled = store.assets.filter((a) => a.intuneCompliance && a.intuneCompliance !== 'Not enrolled').length
  const nonCompliant = store.assets.filter((a) => a.intuneCompliance === 'Non-compliant').length
  const abm = store.assets.filter((a) => a.abmEnrolled).length
  return (
    <div className="space-y-6">
      <div>
        <PaneTitle hint="Device inventory pulled from Microsoft Intune runs on a schedule and fills in the compliance, current user and OS columns.">Microsoft Intune</PaneTitle>
        <DetailsGrid
          items={[
            { label: 'Connection', value: <Chip tone="ai">Simulated</Chip> },
            { label: 'Last sync', value: fmtDateTime(store.lastSync.intune) },
            { label: 'Devices matched', value: enrolled },
            { label: 'Non-compliant', value: nonCompliant },
          ]}
        />
        <Button
          variant="secondary"
          className="mt-3"
          onClick={() => {
            store.runSync('intune')
            toast('Intune sync simulated')
          }}
        >
          Sync now
        </Button>
      </div>
      <div>
        <PaneTitle hint="Checks which serial numbers are registered in Apple Business Manager. No schedule; use Sync now to refresh.">Apple Business Manager</PaneTitle>
        <DetailsGrid
          items={[
            { label: 'Connection', value: <Chip tone="ai">Simulated</Chip> },
            { label: 'Last sync', value: fmtDateTime(store.lastSync.abm) },
            { label: 'Devices enrolled', value: abm },
          ]}
        />
        <Button
          variant="secondary"
          className="mt-3"
          onClick={() => {
            store.runSync('abm')
            toast('ABM check simulated')
          }}
        >
          Sync now
        </Button>
      </div>
    </div>
  )
}

function DangerPane({ store }: { store: AssetStore }) {
  const toast = useToast()
  const [confirm, setConfirm] = useState(false)
  return (
    <div>
      <PaneTitle hint="Restore the sample inventory or clear every asset record. In the real application both actions are permanent.">Danger zone</PaneTitle>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            store.restoreSeed()
            toast('Sample inventory restored')
          }}
        >
          Restore sample data
        </Button>
        <Button className="bg-danger! hover:bg-danger/90! hover:shadow-none" onClick={() => setConfirm(true)}>
          Clear all data
        </Button>
      </div>
      <ConfirmDialog
        open={confirm}
        title="Clear all data"
        confirmLabel="Clear everything"
        danger
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          store.clearAll()
          toast('All asset records cleared', 'critical')
        }}
      >
        This removes all {store.assets.length} asset records from the demo. You can bring the sample data back with Restore sample data.
      </ConfirmDialog>
    </div>
  )
}
