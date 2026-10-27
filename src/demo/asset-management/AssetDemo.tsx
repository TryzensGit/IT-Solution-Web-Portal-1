import { useCallback, useEffect, useMemo, useState } from 'react'
import { ClipboardList, LayoutDashboard, Monitor, ScrollText } from 'lucide-react'
import { usePageTitle } from '../../lib/usePageTitle'
import { DemoLogin } from '../shared/DemoLogin'
import { DemoShell } from '../shared/DemoShell'
import { useDemoSession, type DemoSession } from '../shared/session'
import { ToastProvider, type TabDef } from '../shared/ui'
import {
  defaultLegend,
  defaultRefLists,
  makeAudit,
  seedAssets,
  seedAudit,
  type Asset,
  type AuditAction,
  type AuditEntry,
  type LegendRule,
  type RefLists,
} from './data'
import { Dashboard } from './Dashboard'
import { AssetsTab } from './AssetsTab'
import { AuditTab, SettingsModal } from './panels'

export const ASSET_APP_ID = 'asset-management'
const APP_NAME = 'IT Asset Inventory'
const APP_SUB = 'All locations'

/** Everything the tabs need. Kept in one object so actions stay in one place. */
export interface AssetStore {
  session: DemoSession
  isAdmin: boolean
  assets: Asset[]
  audit: AuditEntry[]
  refLists: RefLists
  legend: LegendRule[]
  lastSync: { intune?: string; abm?: string }
  addAsset: (a: Omit<Asset, 'id' | 'srNo'>) => Asset
  updateAsset: (id: string, patch: Partial<Asset>, note?: string) => void
  deleteAsset: (id: string) => void
  clearAll: () => void
  restoreSeed: () => void
  importAssets: (rows: Omit<Asset, 'id' | 'srNo'>[]) => { created: number; updated: number }
  setRefList: (key: keyof RefLists, values: string[], note: string) => void
  setLegend: (rules: LegendRule[]) => void
  runSync: (which: 'intune' | 'abm') => void
}

export function AssetDemo() {
  usePageTitle(`${APP_NAME} demo`)
  const { session, signIn, signOut } = useDemoSession(ASSET_APP_ID)

  if (!session) {
    return (
      <DemoLogin appId={ASSET_APP_ID} appName={APP_NAME} appSub="Sign in to continue." mark={<Monitor className="size-6" aria-hidden="true" />} onSignIn={signIn} />
    )
  }
  return (
    <ToastProvider>
      <AssetApp key={session.username} session={session} onSignOut={signOut} />
    </ToastProvider>
  )
}

function AssetApp({ session, onSignOut }: { session: DemoSession; onSignOut: () => void }) {
  const isAdmin = session.role === 'admin'
  const [assets, setAssets] = useState<Asset[]>(seedAssets)
  const [audit, setAudit] = useState<AuditEntry[]>(seedAudit)
  const [refLists, setRefLists] = useState<RefLists>(defaultRefLists)
  const [legend, setLegendState] = useState<LegendRule[]>(defaultLegend)
  const [lastSync, setLastSync] = useState<{ intune?: string; abm?: string }>({ intune: new Date(Date.now() - 26 * 3_600_000).toISOString() })
  const [tab, setTab] = useState('dashboard')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const log = useCallback(
    (action: AuditAction, entityType: string, entityLabel: string, details: string) => {
      setAudit((list) => [makeAudit(session.name, action, entityType, entityLabel, details), ...list])
    },
    [session.name],
  )

  useEffect(() => {
    log('login', 'session', session.username, `Signed in as ${session.role}`)
  }, [log, session.username, session.role])

  const store = useMemo<AssetStore>(() => {
    const nextSr = (list: Asset[]) => list.reduce((m, a) => Math.max(m, a.srNo), 0) + 1
    return {
      session,
      isAdmin,
      assets,
      audit,
      refLists,
      legend,
      lastSync,
      addAsset: (a) => {
        const created: Asset = { ...a, id: `asset-${Date.now().toString(36)}`, srNo: nextSr(assets) }
        setAssets((list) => [...list, created])
        log('create', 'asset', created.deviceName, `Added ${created.makeModel} (${created.serialNo})`)
        return created
      },
      updateAsset: (id, patch, note) => {
        const before = assets.find((a) => a.id === id)
        setAssets((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)))
        if (before) {
          const changes =
            note ??
            (Object.keys(patch) as (keyof Asset)[])
              .filter((k) => before[k] !== patch[k])
              .slice(0, 4)
              .join(', ')
          log('update', 'asset', patch.deviceName ?? before.deviceName, changes ? `Changed: ${changes}` : 'Saved without changes')
        }
      },
      deleteAsset: (id) => {
        const a = assets.find((x) => x.id === id)
        setAssets((list) => list.filter((x) => x.id !== id))
        if (a) log('delete', 'asset', a.deviceName, `Removed ${a.makeModel} (${a.serialNo})`)
      },
      clearAll: () => {
        setAssets([])
        log('delete_all', 'assets', 'all', 'Cleared every asset record')
      },
      restoreSeed: () => {
        setAssets(seedAssets())
        log('restore', 'assets', 'sample data', 'Restored the sample inventory')
      },
      importAssets: (rows) => {
        let created = 0
        let updated = 0
        setAssets((list) => {
          const next = [...list]
          for (const r of rows) {
            const idx = r.serialNo ? next.findIndex((a) => a.serialNo.toLowerCase() === r.serialNo.toLowerCase()) : -1
            if (idx >= 0) {
              next[idx] = { ...next[idx], ...r }
              updated += 1
            } else {
              next.push({ ...r, id: `asset-${Date.now().toString(36)}-${created}`, srNo: nextSr(next) })
              created += 1
            }
          }
          return next
        })
        log('import', 'assets', 'CSV import', `${rows.length} rows processed`)
        return { created, updated }
      },
      setRefList: (key, values, note) => {
        setRefLists((r) => ({ ...r, [key]: values }))
        log('reflist_update', 'reference_list', key, note)
      },
      setLegend: (rules) => setLegendState(rules),
      runSync: (which) => {
        const stamp = new Date().toISOString()
        setLastSync((s) => ({ ...s, [which]: stamp }))
        log('sync', 'integration', which === 'intune' ? 'Microsoft Intune' : 'Apple Business Manager', 'Simulated sync completed')
      },
    }
  }, [session, isAdmin, assets, audit, refLists, legend, lastSync, log])

  const tabs: TabDef[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assets', label: 'Assets', icon: ClipboardList },
    ...(isAdmin ? [{ id: 'audit', label: 'Audit Log', icon: ScrollText }] : []),
  ]

  return (
    <DemoShell
      appName={APP_NAME}
      appSub={APP_SUB}
      mark={<Monitor className="size-5" aria-hidden="true" />}
      tabs={tabs}
      activeTab={tab}
      onTabChange={setTab}
      session={session}
      onSignOut={onSignOut}
      onOpenSettings={isAdmin ? () => setSettingsOpen(true) : undefined}
    >
      {tab === 'dashboard' && <Dashboard store={store} onViewAssets={() => setTab('assets')} />}
      {tab === 'assets' && <AssetsTab store={store} />}
      {tab === 'audit' && isAdmin && <AuditTab store={store} />}
      {isAdmin && <SettingsModal store={store} open={settingsOpen} onClose={() => setSettingsOpen(false)} />}
    </DemoShell>
  )
}
