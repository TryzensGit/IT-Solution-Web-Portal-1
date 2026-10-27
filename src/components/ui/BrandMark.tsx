/** The portal's mark: a core with four connected nodes. */
export function BrandMark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-elevated" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" className="stroke-line" />
      <circle cx="16" cy="16" r="5" className="stroke-accent" strokeWidth="2" />
      <circle cx="16" cy="16" r="2" className="fill-ai" />
      <circle cx="6" cy="16" r="1.5" className="fill-accent" />
      <circle cx="26" cy="16" r="1.5" className="fill-accent" />
      <circle cx="16" cy="6" r="1.5" className="fill-accent" />
      <circle cx="16" cy="26" r="1.5" className="fill-accent" />
      <path d="M7.5 16h3.5M21 16h3.5M16 7.5V11M16 21v3.5" className="stroke-accent" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
