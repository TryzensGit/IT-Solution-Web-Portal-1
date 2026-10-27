/**
 * A small drawn "screenshot" of an error dialog, used wherever the portal
 * illustrates sending a screenshot to the support assistant. Drawn as SVG
 * so it stays crisp and themed, and so no real screen capture is shipped.
 */
export function SampleScreenshot({ kind = 'vpn-error', className = 'w-48' }: { kind?: 'vpn-error' | 'outlook-error'; className?: string }) {
  const title = kind === 'vpn-error' ? 'VPN connection failed' : 'Outlook'
  const line1 = kind === 'vpn-error' ? 'Authentication failed.' : 'Disconnected.'
  const line2 = kind === 'vpn-error' ? 'Check your credentials or contact' : 'Trying to connect...'
  const line3 = kind === 'vpn-error' ? 'your administrator.' : ''
  return (
    <svg viewBox="0 0 240 150" className={`${className} rounded-md border border-line`} role="img" aria-label={`Sample screenshot of a ${title} dialog`}>
      <rect width="240" height="150" fill="#1f2937" />
      <rect x="0" y="0" width="240" height="18" fill="#111827" />
      <circle cx="10" cy="9" r="3" fill="#ef4444" />
      <circle cx="20" cy="9" r="3" fill="#f59e0b" />
      <circle cx="30" cy="9" r="3" fill="#10b981" />
      <rect x="38" y="36" width="164" height="86" rx="6" fill="#f9fafb" />
      <rect x="38" y="36" width="164" height="20" rx="6" fill="#e5e7eb" />
      <text x="48" y="50" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="600" fill="#111827">
        {title}
      </text>
      <circle cx="58" cy="78" r="8" fill="#fee2e2" />
      <text x="54.5" y="81.5" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" fill="#dc2626">
        !
      </text>
      <text x="72" y="74" fontFamily="system-ui, sans-serif" fontSize="7.5" fill="#111827">
        {line1}
      </text>
      <text x="72" y="85" fontFamily="system-ui, sans-serif" fontSize="7" fill="#4b5563">
        {line2}
      </text>
      <text x="72" y="95" fontFamily="system-ui, sans-serif" fontSize="7" fill="#4b5563">
        {line3}
      </text>
      <rect x="148" y="104" width="46" height="12" rx="3" fill="#2563eb" />
      <text x="162" y="112.5" fontFamily="system-ui, sans-serif" fontSize="7" fill="#ffffff">
        OK
      </text>
    </svg>
  )
}
