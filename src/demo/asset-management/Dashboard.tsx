import { AlertTriangle, Box, Clock, Layers, ShieldAlert, UserCheck, Wrench } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { daysUntil, fmtDate } from '../shared/format'
import { BarList, Card, Chip, DataTable, Dot, StatCard, type Tone } from '../shared/ui'
import { statusTone, warrantyState, type Asset } from './data'
import type { AssetStore } from './AssetDemo'

function countBy(assets: Asset[], pick: (a: Asset) => string | undefined): Record<string, number> {
  const out: Record<string, number> = {}
  for (const a of assets) {
    const k = pick(a) || 'Unknown'
    out[k] = (out[k] ?? 0) + 1
  }
  return out
}

function toItems(counts: Record<string, number>, order?: string[], tone?: (k: string) => Tone) {
  const keys = order ? [...order.filter((k) => counts[k]), ...Object.keys(counts).filter((k) => !order.includes(k))] : Object.keys(counts).sort((a, b) => counts[b] - counts[a])
  return keys.map((k) => ({ label: k, value: counts[k], tone: tone?.(k) }))
}

export function Dashboard({ store, onViewAssets }: { store: AssetStore; onViewAssets: () => void }) {
  const { assets, refLists } = store
  const total = assets.length
  const byStatus = countBy(assets, (a) => a.status)

  const primary = [
    { label: 'Total assets', value: total, icon: Layers, tone: 'blue' as Tone, caption: 'across all locations' },
    { label: 'Allocated', value: byStatus['Currently Allocated'] ?? 0, icon: UserCheck, tone: 'good' as Tone, caption: 'in use by someone' },
    { label: 'Spare', value: byStatus['Spare'] ?? 0, icon: Box, tone: 'blue' as Tone, caption: 'ready to deploy' },
    { label: 'Need to check', value: byStatus['Need to Check'] ?? 0, icon: AlertTriangle, tone: 'warning' as Tone, caption: 'needs review this week' },
    { label: 'In repair', value: byStatus['In Repair'] ?? 0, icon: Wrench, tone: 'warning' as Tone, caption: 'with vendor or IT' },
    { label: 'Lost / stolen', value: byStatus['Lost/Stolen'] ?? 0, icon: ShieldAlert, tone: 'critical' as Tone, caption: 'flagged for security' },
  ]
  const secondary = Object.keys(byStatus).filter((s) => !['Currently Allocated', 'Spare', 'Need to Check', 'In Repair', 'Lost/Stolen'].includes(s))

  const warrantyCounts = countBy(assets, (a) => {
    const w = warrantyState(a)
    return w.label.startsWith('Expires') ? 'Expiring soon' : w.label
  })
  const agingCounts = countBy(assets, (a) => {
    const d = daysUntil(a.purchaseDate)
    if (d === undefined) return 'Unknown purchase date'
    return -d > 5 * 365.25 ? 'Older than 5 years' : 'Within 5 years'
  })
  const aging = agingCounts['Older than 5 years'] ?? 0

  const expiring = assets
    .map((a) => ({ a, days: daysUntil(a.warrantyExpiry) }))
    .filter((x): x is { a: Asset; days: number } => x.days !== undefined && x.days >= 0 && x.days <= 90 && x.a.warranty === 'Yes')
    .sort((x, y) => x.days - y.days)

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">A quick overview of all IT devices. The numbers update as assets are added or changed.</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {primary.map((p) => (
          <StatCard key={p.label} label={p.label} value={p.value} caption={p.caption} icon={p.icon} tone={p.tone} />
        ))}
      </div>
      {secondary.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {secondary.map((s) => (
            <Chip key={s} tone={statusTone(s)}>
              <Dot tone={statusTone(s)} />
              <strong>{byStatus[s]}</strong> {s}
            </Chip>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={<>Status breakdown <span className="ml-1 font-normal text-faint">what each device's current state is</span></>}>
          <BarList items={toItems(byStatus, refLists.status, statusTone)} total={total} />
        </Card>
        <div className="grid gap-4">
          <Card title={<>Warranty coverage <span className="ml-1 font-normal text-faint">which devices are still covered</span></>}>
            <BarList
              items={toItems(warrantyCounts, ['Covered', 'Expiring soon', 'Expired', 'Not covered', 'Not applicable'], (k) =>
                k === 'Covered' ? 'good' : k === 'Expiring soon' ? 'warning' : k === 'Expired' ? 'critical' : 'neutral',
              )}
              total={total}
            />
          </Card>
          <Card
            title={<>Aging devices <span className="ml-1 font-normal text-faint">bought more than 5 years ago</span></>}
            aside={<span className="text-sm font-semibold tabular-nums text-warning">{aging} of {total}</span>}
          >
            <BarList items={toItems(agingCounts, ['Older than 5 years', 'Within 5 years', 'Unknown purchase date'], (k) => (k.startsWith('Older') ? 'warning' : k.startsWith('Within') ? 'good' : 'neutral'))} total={total} />
          </Card>
        </div>
      </div>

      <h2 className="text-base font-semibold tracking-tight">More breakdowns</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Asset type">
          <BarList items={toItems(countBy(assets, (a) => a.assetType))} total={total} />
        </Card>
        <Card title="Location">
          <BarList items={toItems(countBy(assets, (a) => a.location))} total={total} />
        </Card>
        <Card title="Operating system">
          <BarList items={toItems(countBy(assets, (a) => a.os))} total={total} />
        </Card>
      </div>

      <Card
        title={
          <span className="inline-flex items-center gap-2">
            <Clock className="size-4 text-accent" aria-hidden="true" />
            Warranty expiring within 90 days
          </span>
        }
        aside={
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tabular-nums text-muted">{expiring.length} devices</span>
            <Button variant="ghost" onClick={onViewAssets}>
              View all assets
            </Button>
          </div>
        }
      >
        <DataTable
          caption="Assets whose warranty expires within 90 days"
          dense
          columns={[
            { key: 'device', header: 'Device', render: (r) => <span className="font-medium">{r.a.deviceName}</span> },
            { key: 'serial', header: 'Serial no.', render: (r) => <span className="font-mono text-xs">{r.a.serialNo}</span> },
            { key: 'user', header: 'Current user', render: (r) => r.a.currentUser ?? '-' },
            { key: 'expiry', header: 'Warranty expiry', render: (r) => fmtDate(r.a.warrantyExpiry) },
            {
              key: 'days',
              header: 'Days left',
              render: (r) => <Chip tone={r.days < 7 ? 'critical' : r.days < 30 ? 'warning' : 'neutral'}>{r.days === 0 ? 'Today' : `${r.days} days`}</Chip>,
            },
          ]}
          rows={expiring}
          rowKey={(r) => r.a.id}
          empty="No assets with warranty expiring soon."
        />
      </Card>
    </div>
  )
}
