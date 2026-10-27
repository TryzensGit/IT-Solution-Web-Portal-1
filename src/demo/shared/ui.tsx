import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Info, Search, X, type LucideIcon } from 'lucide-react'
import { Button } from '../../components/ui/Button'

/* ------------------------------------------------------------------
   Form primitives. Same tokens as the portal so the demos look native.
------------------------------------------------------------------- */

export const inputClass =
  'w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-text placeholder:text-faint ' +
  'transition-colors focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-60'

export function Field({
  label,
  required,
  hint,
  children,
  className = '',
}: {
  label: ReactNode
  required?: boolean
  hint?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className}`}>
      <span className="font-medium">
        {label}
        {required && (
          <span className="ml-1 text-danger" aria-hidden="true">
            *
          </span>
        )}
      </span>
      {children}
      {hint && <span className="text-xs leading-relaxed text-faint">{hint}</span>}
    </label>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props
  return <input {...rest} className={`${inputClass} ${className}`} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = '', ...rest } = props
  return <select {...rest} className={`${inputClass} ${className}`} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props
  return <textarea {...rest} className={`${inputClass} min-h-[4.5rem] ${className}`} />
}

export function Checkbox({ label, ...rest }: { label: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input type="checkbox" {...rest} className="size-4 rounded border-line-strong accent-[var(--c-accent)]" />
      {label}
    </label>
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search',
  className = '',
  label = 'Search',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  label?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className={`${inputClass} pl-9`}
      />
    </div>
  )
}

/* ------------------------------------------------------------------
   Chips, stats, bars
------------------------------------------------------------------- */

export type Tone = 'good' | 'warning' | 'critical' | 'blue' | 'neutral' | 'ai'

const tones: Record<Tone, string> = {
  good: 'bg-success/12 text-success border-success/30',
  warning: 'bg-warning/12 text-warning border-warning/30',
  critical: 'bg-danger/12 text-danger border-danger/30',
  blue: 'bg-accent-soft text-accent border-accent/30',
  ai: 'bg-ai-soft text-ai border-ai/30',
  neutral: 'bg-elevated text-muted border-line',
}

const fills: Record<Tone, string> = {
  good: 'bg-success',
  warning: 'bg-warning',
  critical: 'bg-danger',
  blue: 'bg-accent',
  ai: 'bg-ai',
  neutral: 'bg-faint',
}

export function Chip({ tone = 'neutral', children, className = '' }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function Dot({ tone }: { tone: Tone }) {
  return <span className={`inline-block size-2 rounded-full ${fills[tone]}`} aria-hidden="true" />
}

export function StatCard({
  label,
  value,
  caption,
  icon: Icon,
  tone = 'blue',
}: {
  label: string
  value: ReactNode
  caption?: string
  icon: LucideIcon
  tone?: Tone
}) {
  const iconTone: Record<Tone, string> = {
    good: 'bg-success/12 text-success',
    warning: 'bg-warning/12 text-warning',
    critical: 'bg-danger/12 text-danger',
    blue: 'bg-accent-soft text-accent',
    ai: 'bg-ai-soft text-ai',
    neutral: 'bg-elevated text-muted',
  }
  return (
    <div className="surface-card flex items-center gap-4 p-4">
      <span className={`inline-flex size-11 shrink-0 items-center justify-center rounded-lg ${iconTone[tone]}`}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-semibold leading-none tracking-tight">{value}</p>
        <p className="mt-1.5 text-sm text-muted">{label}</p>
        {caption && <p className="mt-0.5 text-xs text-faint">{caption}</p>}
      </div>
    </div>
  )
}

export function BarList({ items, total }: { items: { label: string; value: number; tone?: Tone }[]; total: number }) {
  if (items.length === 0) return <p className="text-sm text-faint">No data yet.</p>
  return (
    <ul className="space-y-2.5">
      {items.map((i) => {
        const pct = total ? Math.round((i.value / total) * 100) : 0
        return (
          <li key={i.label} className="text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate">{i.label}</span>
              <span className="shrink-0 tabular-nums text-muted">
                {i.value} <span className="text-faint">({pct}%)</span>
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
              <div className={`h-full rounded-full ${fills[i.tone ?? 'blue']}`} style={{ width: `${pct}%` }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function Card({
  title,
  aside,
  children,
  className = '',
}: {
  title?: ReactNode
  aside?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`surface-card p-5 ${className}`}>
      {(title || aside) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          {title && <h3 className="text-sm font-semibold tracking-tight">{title}</h3>}
          {aside}
        </div>
      )}
      {children}
    </section>
  )
}

export function EmptyState({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
      <Icon className="size-6 text-faint" aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}

export function Notice({ tone = 'blue', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <p className={`flex items-start gap-2 rounded-md border px-3 py-2.5 text-sm leading-relaxed ${tones[tone]}`}>
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}

export function DetailsGrid({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {items.map((i) => (
        <div key={i.label} className="min-w-0">
          <dt className="text-xs font-medium uppercase tracking-wide text-faint">{i.label}</dt>
          <dd className="mt-0.5 break-words text-sm">{i.value ?? '-'}</dd>
        </div>
      ))}
    </dl>
  )
}

/* ------------------------------------------------------------------
   Tabs
------------------------------------------------------------------- */

export interface TabDef {
  id: string
  label: string
  icon?: LucideIcon
}

export function TabBar({
  tabs,
  active,
  onChange,
  label = 'Sections',
}: {
  tabs: TabDef[]
  active: string
  onChange: (id: string) => void
  label?: string
}) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto">
      {tabs.map((t) => {
        const on = t.id === active
        return (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={on}
            onClick={() => onChange(t.id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              on ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-elevated hover:text-text'
            }`}
          >
            {t.icon && <t.icon className="size-4" aria-hidden="true" />}
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------
   Table
------------------------------------------------------------------- */

export interface Column<T> {
  key: string
  header: ReactNode
  render?: (row: T) => ReactNode
  /** Value used for sorting; omit to make the column unsortable. */
  sortValue?: (row: T) => string | number | undefined
  className?: string
  headerClassName?: string
}

export interface SortState {
  key: string
  dir: 1 | -1
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  sort,
  onSort,
  onRowClick,
  rowClassName,
  rowStyle,
  empty,
  caption,
  dense,
}: {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  sort?: SortState
  onSort?: (s: SortState) => void
  onRowClick?: (row: T) => void
  rowClassName?: (row: T) => string
  rowStyle?: (row: T) => CSSProperties | undefined
  empty?: ReactNode
  caption: string
  dense?: boolean
}) {
  const sorted = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    if (!col?.sortValue) return rows
    const sv = col.sortValue
    return [...rows].sort((a, b) => {
      const va = sv(a)
      const vb = sv(b)
      if (va === vb) return 0
      if (va === undefined || va === '') return 1
      if (vb === undefined || vb === '') return -1
      return (va < vb ? -1 : 1) * sort.dir
    })
  }, [rows, sort, columns])

  const pad = dense ? 'px-3 py-2' : 'px-3 py-2.5'

  return (
    <div className="overflow-x-auto rounded-md border border-line">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-elevated text-left text-xs uppercase tracking-wide text-faint">
          <tr>
            {columns.map((c) => {
              const sortable = Boolean(c.sortValue && onSort)
              const active = sort && sort.key === c.key ? sort : undefined
              const ariaSort = active ? (active.dir === 1 ? 'ascending' : 'descending') : 'none'
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={sortable ? ariaSort : undefined}
                  className={`${pad} font-medium ${c.headerClassName ?? ''}`}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort?.({ key: c.key, dir: active && active.dir === 1 ? -1 : 1 })}
                      className="inline-flex items-center gap-1 whitespace-nowrap uppercase hover:text-text"
                    >
                      {c.header}
                      {active ? (
                        active.dir === 1 ? (
                          <ArrowUp className="size-3" aria-hidden="true" />
                        ) : (
                          <ArrowDown className="size-3" aria-hidden="true" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3 opacity-50" aria-hidden="true" />
                      )}
                    </button>
                  ) : (
                    <span className="whitespace-nowrap">{c.header}</span>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-10 text-center text-muted">
                {empty ?? 'Nothing to show.'}
              </td>
            </tr>
          ) : (
            sorted.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={rowStyle?.(row)}
                className={`border-t border-line transition-colors ${onRowClick ? 'cursor-pointer hover:bg-elevated' : ''} ${rowClassName?.(row) ?? ''}`}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`${pad} align-middle ${c.className ?? ''}`}>
                    {c.render ? c.render(row) : ((row as Record<string, unknown>)[c.key] as ReactNode) ?? '-'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------
   Modal and confirm dialog
------------------------------------------------------------------- */

export function Modal({
  open,
  title,
  icon: Icon,
  onClose,
  children,
  footer,
  size = 'md',
}: {
  open: boolean
  title: ReactNode
  icon?: LucideIcon
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const titleId = useId()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const first = ref.current?.querySelector<HTMLElement>('input:not([type=hidden]), select, textarea, button')
    first?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null
  const width = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }[size]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`flex max-h-[92dvh] w-full ${width} flex-col overflow-hidden rounded-t-xl border border-line bg-surface shadow-card-hover sm:rounded-xl`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 id={titleId} className="flex items-center gap-2 text-base font-semibold tracking-tight">
            {Icon && <Icon className="size-4 text-accent" aria-hidden="true" />}
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-muted hover:bg-elevated hover:text-text">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={danger ? 'bg-danger! hover:bg-danger/90! hover:shadow-none' : ''}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm leading-relaxed text-muted">{children}</div>
    </Modal>
  )
}

/* ------------------------------------------------------------------
   Toasts
------------------------------------------------------------------- */

interface ToastItem {
  id: number
  message: string
  tone: Tone
}

const ToastContext = createContext<(message: string, tone?: Tone) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const show = useCallback((message: string, tone: Tone = 'good') => {
    const id = Date.now() + Math.random()
    setItems((list) => [...list, { id, message, tone }])
    window.setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 3200)
  }, [])
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-2 rounded-md border bg-surface px-3.5 py-2 text-sm shadow-card ${tones[t.tone]}`}>
            {t.tone === 'good' && <Check className="size-4" aria-hidden="true" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
