import { addDays, nowIso, todayIso, uid } from '../shared/format'
import type { Tone } from '../shared/ui'

/**
 * Sample data for the Asset Management demo. Everything is fictional:
 * people, devices, serial numbers and tickets. The shape mirrors the real
 * application's asset record so the demo screens match it field for field.
 */

export interface Asset {
  id: string
  srNo: number
  deviceName: string
  makeModel: string
  serialNo: string
  currentUser?: string
  team?: string
  previousUser?: string
  assetType: string
  employmentType?: string
  location: string
  purchaseDate?: string
  allocationDate?: string
  os?: string
  ram?: string
  storage?: string
  cpu?: string
  warranty: string
  warrantyExpiry?: string
  status: string
  diagnostic?: string
  remark?: string
  jiraRef?: string
  intuneCompliance?: 'Compliant' | 'Non-compliant' | 'Not enrolled'
  abmEnrolled?: boolean
}

export type AuditAction = 'create' | 'update' | 'delete' | 'delete_all' | 'import' | 'reflist_update' | 'login' | 'sync' | 'restore'

export interface AuditEntry {
  id: string
  createdAt: string
  userName: string
  action: AuditAction
  entityType: string
  entityLabel: string
  details: string
}

export const auditActionLabels: Record<AuditAction, { label: string; tone: Tone }> = {
  create: { label: 'Created', tone: 'good' },
  update: { label: 'Updated', tone: 'blue' },
  delete: { label: 'Deleted', tone: 'critical' },
  delete_all: { label: 'Deleted all', tone: 'critical' },
  import: { label: 'Imported', tone: 'warning' },
  reflist_update: { label: 'Reference list updated', tone: 'blue' },
  login: { label: 'Signed in', tone: 'neutral' },
  sync: { label: 'Synced', tone: 'blue' },
  restore: { label: 'Restored', tone: 'warning' },
}

export type RefListKey = 'status' | 'location' | 'warranty' | 'assetType' | 'employmentType' | 'os' | 'ram' | 'storage'
export type RefLists = Record<RefListKey, string[]>

export const refListLabels: Record<RefListKey, string> = {
  status: 'Status',
  location: 'Location',
  warranty: 'Under warranty',
  assetType: 'Asset type',
  employmentType: 'Employment type',
  os: 'Operating system',
  ram: 'RAM',
  storage: 'Storage',
}

export const defaultRefLists: RefLists = {
  status: ['Currently Allocated', 'Spare', 'Disposed', 'In Repair', 'Need to Check', 'Lost/Stolen'],
  location: ['India', 'UK', 'Australia', 'Bulgaria', 'Unknown'],
  warranty: ['Yes', 'No', 'NA'],
  assetType: ['Laptop', 'Desktop', 'Monitor', 'Printer', 'Server', 'Mobile', 'Tablet', 'Other'],
  employmentType: ['Permanent', 'Contractor', 'Intern'],
  os: ['Windows', 'MacOS', 'Ubuntu/Linux', 'Android', 'iOS', 'iPadOS'],
  ram: ['8 GB', '16 GB', '32 GB', '64 GB', '128 GB'],
  storage: ['256 GB SSD', '512 GB SSD', '1 TB SSD', '2 TB SSD', '500 GB HDD', '1 TB HDD', '2 TB HDD'],
}

export interface LegendRule {
  id: string
  color: string
  flag: string
  field: 'status' | 'diagnostic' | 'remark' | 'purchaseAge'
  matchValue: string
  meaning: string
}

export const defaultLegend: LegendRule[] = [
  { id: 'seed-1', color: '#d03b3b', flag: 'Red', field: 'status', matchValue: 'Disposed', meaning: 'Status is "Disposed"' },
  { id: 'seed-2', color: '#0ca30c', flag: 'Green', field: 'diagnostic', matchValue: 'Working: Ready to Allot', meaning: 'Diagnostic report is "Working: Ready to Allot"' },
  { id: 'seed-3', color: '#7fce7f', flag: 'Light green', field: 'diagnostic', matchValue: 'Working: Ready to Temp-Allot', meaning: 'Diagnostic report is "Working: Ready to Temp-Allot"' },
  { id: 'seed-4', color: '#fab219', flag: 'Yellow', field: 'diagnostic', matchValue: '', meaning: 'Diagnostic report has any other issue noted' },
  { id: 'seed-5', color: '#f5da8a', flag: 'Pale yellow', field: 'remark', matchValue: '', meaning: 'Remark column contains a note' },
  { id: 'seed-6', color: '#fab219', flag: 'Yellow', field: 'purchaseAge', matchValue: '5', meaning: 'Purchase date is more than 5 years old (device aging)' },
]

export function legendFieldLabel(field: LegendRule['field']): string {
  return { status: 'Status equals', diagnostic: 'Diagnostic report equals', remark: 'Remark has any note', purchaseAge: 'Purchase date older than (years)' }[field]
}

/** First legend rule, in order, that an asset matches. */
export function rowFlag(asset: Asset, rules: LegendRule[]): LegendRule | undefined {
  for (const r of rules) {
    switch (r.field) {
      case 'status':
        if (asset.status.toLowerCase() === r.matchValue.toLowerCase()) return r
        break
      case 'diagnostic': {
        const d = (asset.diagnostic ?? '').trim()
        if (!d) break
        if (r.matchValue ? d.toLowerCase() === r.matchValue.toLowerCase() : true) return r
        break
      }
      case 'remark':
        if ((asset.remark ?? '').trim()) return r
        break
      case 'purchaseAge': {
        const years = Number(r.matchValue)
        if (asset.purchaseDate && Number.isFinite(years)) {
          const ageMs = Date.now() - new Date(asset.purchaseDate + 'T00:00:00Z').getTime()
          if (ageMs / (365.25 * 86_400_000) > years) return r
        }
        break
      }
    }
  }
  return undefined
}

export function statusTone(status: string): Tone {
  const s = status.toLowerCase()
  if (s === 'currently allocated') return 'good'
  if (s === 'spare') return 'blue'
  if (s === 'in repair' || s === 'need to check') return 'warning'
  if (s === 'disposed' || s.includes('lost')) return 'critical'
  return 'neutral'
}

export function warrantyState(a: Asset): { label: string; tone: Tone } {
  if (a.warranty === 'NA') return { label: 'Not applicable', tone: 'neutral' }
  if (a.warranty === 'No') return { label: 'Not covered', tone: 'neutral' }
  if (!a.warrantyExpiry) return { label: 'Covered', tone: 'good' }
  const days = Math.round((new Date(a.warrantyExpiry + 'T00:00:00Z').getTime() - new Date(todayIso() + 'T00:00:00Z').getTime()) / 86_400_000)
  if (days < 0) return { label: 'Expired', tone: 'critical' }
  if (days === 0) return { label: 'Expires today', tone: 'warning' }
  if (days <= 30) return { label: `Expires in ${days} days`, tone: 'warning' }
  return { label: 'Covered', tone: 'good' }
}

/* ------------------------------------------------------------------
   Seed records. Dates are relative to today so the dashboard always has
   warranty expiries and aging devices to show.
------------------------------------------------------------------- */

const t = todayIso()
const d = (days: number) => addDays(t, days)

type Seed = Omit<Asset, 'id' | 'srNo'>

const seeds: Seed[] = [
  { deviceName: 'LT-PRIYA-01', makeModel: 'Dell Latitude 5440', serialNo: 'DL5440-7K2P9', currentUser: 'Priya Natarajan', team: 'Engineering', assetType: 'Laptop', employmentType: 'Permanent', location: 'India', purchaseDate: d(-610), allocationDate: d(-600), os: 'Windows', ram: '16 GB', storage: '512 GB SSD', cpu: 'Intel Core i5-1335U', warranty: 'Yes', warrantyExpiry: d(485), status: 'Currently Allocated', diagnostic: '', remark: '', jiraRef: 'TIS-1042', intuneCompliance: 'Compliant', abmEnrolled: false },
  { deviceName: 'MBP-OLLIE-02', makeModel: 'Apple MacBook Pro 14 (M3)', serialNo: 'C02XK1MBP14A', currentUser: 'Oliver Grant', team: 'Design', assetType: 'Laptop', employmentType: 'Permanent', location: 'UK', purchaseDate: d(-300), allocationDate: d(-295), os: 'MacOS', ram: '32 GB', storage: '1 TB SSD', cpu: 'Apple M3 Pro', warranty: 'Yes', warrantyExpiry: d(795), status: 'Currently Allocated', diagnostic: '', remark: '', jiraRef: 'TIS-1188', intuneCompliance: 'Compliant', abmEnrolled: true },
  { deviceName: 'LT-SPARE-03', makeModel: 'Lenovo ThinkPad T14 Gen 4', serialNo: 'PF4T14G-33K1', assetType: 'Laptop', location: 'UK', purchaseDate: d(-420), os: 'Windows', ram: '16 GB', storage: '512 GB SSD', cpu: 'AMD Ryzen 7 PRO 7840U', warranty: 'Yes', warrantyExpiry: d(675), status: 'Spare', diagnostic: 'Working: Ready to Allot', remark: '', previousUser: 'Hannah Reyes', intuneCompliance: 'Not enrolled', abmEnrolled: false },
  { deviceName: 'LT-MIRA-04', makeModel: 'HP EliteBook 840 G10', serialNo: 'HP840G10-A8Q2', currentUser: 'Mira Petrova', team: 'Finance', assetType: 'Laptop', employmentType: 'Permanent', location: 'Bulgaria', purchaseDate: d(-1_100), allocationDate: d(-1_080), os: 'Windows', ram: '16 GB', storage: '256 GB SSD', cpu: 'Intel Core i7-1355U', warranty: 'Yes', warrantyExpiry: d(21), status: 'Currently Allocated', diagnostic: '', remark: '', intuneCompliance: 'Compliant', abmEnrolled: false },
  { deviceName: 'LT-JAMES-05', makeModel: 'Dell Latitude 7430', serialNo: 'DL7430-Q9W4L', currentUser: 'James Okafor', team: 'Sales', assetType: 'Laptop', employmentType: 'Permanent', location: 'UK', purchaseDate: d(-980), allocationDate: d(-960), os: 'Windows', ram: '16 GB', storage: '512 GB SSD', cpu: 'Intel Core i7-1265U', warranty: 'Yes', warrantyExpiry: d(58), status: 'Currently Allocated', diagnostic: '', remark: 'Battery replaced under warranty', intuneCompliance: 'Compliant', abmEnrolled: false },
  { deviceName: 'LT-REPAIR-06', makeModel: 'Lenovo ThinkPad X1 Carbon Gen 10', serialNo: 'PFX1C10-8R2M', previousUser: 'Daniel Mehta', team: 'Engineering', assetType: 'Laptop', location: 'India', purchaseDate: d(-800), os: 'Windows', ram: '16 GB', storage: '1 TB SSD', cpu: 'Intel Core i7-1260P', warranty: 'Yes', warrantyExpiry: d(290), status: 'In Repair', diagnostic: 'Hinge cracked, sent to vendor', remark: '', jiraRef: 'TIS-1301', intuneCompliance: 'Non-compliant', abmEnrolled: false },
  { deviceName: 'MBA-SOFIA-07', makeModel: 'Apple MacBook Air 13 (M2)', serialNo: 'C02MBA13M2Z7', currentUser: 'Sofia Lindqvist', team: 'Marketing', assetType: 'Laptop', employmentType: 'Contractor', location: 'UK', purchaseDate: d(-520), allocationDate: d(-500), os: 'MacOS', ram: '16 GB', storage: '512 GB SSD', cpu: 'Apple M2', warranty: 'Yes', warrantyExpiry: d(575), status: 'Currently Allocated', diagnostic: '', remark: '', intuneCompliance: 'Compliant', abmEnrolled: true },
  { deviceName: 'DT-RECEPTION-08', makeModel: 'HP ProDesk 400 G9', serialNo: 'HP400G9-M2K8', currentUser: 'Reception (shared)', team: 'Operations', assetType: 'Desktop', location: 'Australia', purchaseDate: d(-1_950), allocationDate: d(-1_940), os: 'Windows', ram: '8 GB', storage: '500 GB HDD', cpu: 'Intel Core i3-12100', warranty: 'No', status: 'Currently Allocated', diagnostic: '', remark: '', intuneCompliance: 'Compliant', abmEnrolled: false },
  { deviceName: 'SRV-BUILD-01', makeModel: 'Dell PowerEdge R650', serialNo: 'DPE650-JX77N', currentUser: 'Platform team', team: 'Engineering', assetType: 'Server', location: 'UK', purchaseDate: d(-1_400), allocationDate: d(-1_390), os: 'Ubuntu/Linux', ram: '128 GB', storage: '2 TB SSD', cpu: '2x Intel Xeon Silver 4314', warranty: 'Yes', warrantyExpiry: d(420), status: 'Currently Allocated', diagnostic: '', remark: '', intuneCompliance: 'Not enrolled', abmEnrolled: false },
  { deviceName: 'SRV-OLD-02', makeModel: 'HPE ProLiant DL380 Gen9', serialNo: 'HPEDL380-G9-K1', assetType: 'Server', location: 'India', purchaseDate: d(-2_600), os: 'Ubuntu/Linux', ram: '64 GB', storage: '2 TB HDD', cpu: '2x Intel Xeon E5-2620 v4', warranty: 'No', status: 'Need to Check', diagnostic: 'Decommission candidate, confirm no workloads', remark: '', jiraRef: 'TIS-0877', intuneCompliance: 'Not enrolled', abmEnrolled: false },
  { deviceName: 'MON-ENG-11', makeModel: 'Dell UltraSharp U2723QE', serialNo: 'DU2723-5F0A1', currentUser: 'Priya Natarajan', team: 'Engineering', assetType: 'Monitor', location: 'India', purchaseDate: d(-610), allocationDate: d(-600), warranty: 'Yes', warrantyExpiry: d(485), status: 'Currently Allocated', diagnostic: '', remark: '' },
  { deviceName: 'MON-SPARE-12', makeModel: 'LG 27UK850', serialNo: 'LG27UK850-R3', assetType: 'Monitor', location: 'UK', purchaseDate: d(-2_100), warranty: 'No', status: 'Spare', diagnostic: 'Working: Ready to Temp-Allot', remark: '' },
  { deviceName: 'PH-ARUN-13', makeModel: 'Samsung Galaxy S23', serialNo: 'SMS23-R58W2', currentUser: 'Arun Krishnan', team: 'Sales', assetType: 'Mobile', employmentType: 'Permanent', location: 'India', purchaseDate: d(-400), allocationDate: d(-398), os: 'Android', ram: '8 GB', storage: '256 GB SSD', warranty: 'Yes', warrantyExpiry: d(330), status: 'Currently Allocated', diagnostic: '', remark: '', intuneCompliance: 'Compliant', abmEnrolled: false },
  { deviceName: 'PH-LUCY-14', makeModel: 'Apple iPhone 15', serialNo: 'IP15-DMQ7X2', currentUser: 'Lucy Adebayo', team: 'Support', assetType: 'Mobile', employmentType: 'Permanent', location: 'UK', purchaseDate: d(-250), allocationDate: d(-248), os: 'iOS', ram: '8 GB', storage: '256 GB SSD', warranty: 'Yes', warrantyExpiry: d(115), status: 'Currently Allocated', diagnostic: '', remark: '', intuneCompliance: 'Compliant', abmEnrolled: true },
  { deviceName: 'TB-FIELD-15', makeModel: 'Apple iPad Air (M2)', serialNo: 'IPADAIR-M2-77Q', currentUser: 'Field engineers (pool)', team: 'Operations', assetType: 'Tablet', location: 'Australia', purchaseDate: d(-180), allocationDate: d(-170), os: 'iPadOS', ram: '8 GB', storage: '256 GB SSD', warranty: 'Yes', warrantyExpiry: d(185), status: 'Currently Allocated', diagnostic: '', remark: '', intuneCompliance: 'Compliant', abmEnrolled: true },
  { deviceName: 'LT-DISPOSED-16', makeModel: 'Dell Latitude 5490', serialNo: 'DL5490-OLD-01', previousUser: 'Former staff', assetType: 'Laptop', location: 'UK', purchaseDate: d(-2_400), os: 'Windows', ram: '8 GB', storage: '256 GB SSD', cpu: 'Intel Core i5-8350U', warranty: 'No', status: 'Disposed', diagnostic: '', remark: 'WEEE collected, certificate on file', jiraRef: 'TIS-0712' },
  { deviceName: 'LT-INTERN-17', makeModel: 'Lenovo ThinkPad E14 Gen 5', serialNo: 'PFE14G5-2A9C', currentUser: 'Tomasz Nowak', team: 'Engineering', assetType: 'Laptop', employmentType: 'Intern', location: 'Bulgaria', purchaseDate: d(-120), allocationDate: d(-110), os: 'Windows', ram: '16 GB', storage: '512 GB SSD', cpu: 'AMD Ryzen 5 7530U', warranty: 'Yes', warrantyExpiry: d(975), status: 'Currently Allocated', diagnostic: '', remark: '', intuneCompliance: 'Compliant', abmEnrolled: false },
  { deviceName: 'LT-CHECK-18', makeModel: 'HP EliteBook 850 G8', serialNo: 'HP850G8-W4N6', previousUser: 'Hannah Reyes', team: 'Design', assetType: 'Laptop', location: 'UK', purchaseDate: d(-1_250), os: 'Windows', ram: '16 GB', storage: '512 GB SSD', cpu: 'Intel Core i7-1165G7', warranty: 'No', status: 'Need to Check', diagnostic: 'Returned by leaver, needs wipe and inspection', remark: '', jiraRef: 'TIS-1322', intuneCompliance: 'Non-compliant', abmEnrolled: false },
  { deviceName: 'PR-OFFICE-19', makeModel: 'Brother MFC-L8900CDW', serialNo: 'BRL8900-U1234', currentUser: 'Office (shared)', team: 'Operations', assetType: 'Printer', location: 'UK', purchaseDate: d(-900), warranty: 'Yes', warrantyExpiry: d(12), status: 'Currently Allocated', diagnostic: '', remark: '' },
  { deviceName: 'LT-SPARE-20', makeModel: 'Dell Latitude 5440', serialNo: 'DL5440-SP-002', assetType: 'Laptop', location: 'India', purchaseDate: d(-200), os: 'Windows', ram: '16 GB', storage: '512 GB SSD', cpu: 'Intel Core i5-1335U', warranty: 'Yes', warrantyExpiry: d(895), status: 'Spare', diagnostic: 'Working: Ready to Allot', remark: '', intuneCompliance: 'Not enrolled', abmEnrolled: false },
  { deviceName: 'LT-LOST-21', makeModel: 'Apple MacBook Air 13 (M1)', serialNo: 'C02MBA13M1L9', previousUser: 'Sam Whitfield', team: 'Sales', assetType: 'Laptop', location: 'Australia', purchaseDate: d(-1_000), os: 'MacOS', ram: '8 GB', storage: '256 GB SSD', cpu: 'Apple M1', warranty: 'No', status: 'Lost/Stolen', diagnostic: 'Reported lost in transit', remark: 'Remote wipe issued', jiraRef: 'TIS-1290', intuneCompliance: 'Non-compliant', abmEnrolled: true },
  { deviceName: 'LT-REPAIR-22', makeModel: 'HP EliteBook 840 G10', serialNo: 'HP840G10-R7T3', previousUser: 'Mira Petrova', team: 'Finance', assetType: 'Laptop', location: 'Bulgaria', purchaseDate: d(-700), os: 'Windows', ram: '16 GB', storage: '512 GB SSD', cpu: 'Intel Core i7-1355U', warranty: 'Yes', warrantyExpiry: d(395), status: 'In Repair', diagnostic: 'Keyboard faulty, awaiting part', remark: '', jiraRef: 'TIS-1333', intuneCompliance: 'Compliant', abmEnrolled: false },
]

export function seedAssets(): Asset[] {
  return seeds.map((s, i) => ({ ...s, id: `asset-${i + 1}`, srNo: i + 1 }))
}

export function seedAudit(): AuditEntry[] {
  const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()
  return [
    { id: uid('audit'), createdAt: hoursAgo(76), userName: 'Demo Administrator', action: 'import', entityType: 'assets', entityLabel: 'inventory.csv', details: '22 rows: 22 created, 0 updated, 0 skipped' },
    { id: uid('audit'), createdAt: hoursAgo(50), userName: 'Demo User', action: 'update', entityType: 'asset', entityLabel: 'LT-JAMES-05', details: 'Remark set: Battery replaced under warranty' },
    { id: uid('audit'), createdAt: hoursAgo(31), userName: 'Demo Administrator', action: 'update', entityType: 'asset', entityLabel: 'LT-REPAIR-06', details: 'Status: Currently Allocated -> In Repair' },
    { id: uid('audit'), createdAt: hoursAgo(26), userName: 'Intune sync', action: 'sync', entityType: 'integration', entityLabel: 'Microsoft Intune', details: '17 devices matched, 2 non-compliant' },
    { id: uid('audit'), createdAt: hoursAgo(9), userName: 'Demo Administrator', action: 'reflist_update', entityType: 'reference_list', entityLabel: 'status', details: 'Added "Lost/Stolen"' },
    { id: uid('audit'), createdAt: hoursAgo(3), userName: 'Demo User', action: 'create', entityType: 'asset', entityLabel: 'LT-SPARE-20', details: 'Added spare Dell Latitude 5440' },
  ]
}

export function makeAudit(userName: string, action: AuditAction, entityType: string, entityLabel: string, details: string): AuditEntry {
  return { id: uid('audit'), createdAt: nowIso(), userName, action, entityType, entityLabel, details }
}

export const emptyAsset = (): Omit<Asset, 'id' | 'srNo'> => ({
  deviceName: '',
  makeModel: '',
  serialNo: '',
  assetType: 'Laptop',
  location: 'UK',
  warranty: 'Yes',
  status: 'Spare',
  employmentType: '',
  os: '',
  ram: '',
  storage: '',
})
