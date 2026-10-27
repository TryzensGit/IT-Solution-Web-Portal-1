import { Link } from 'react-router-dom'
import { brand } from '../../config/brand'
import { applications } from '../../config/applications'
import { BrandMark } from '../ui/BrandMark'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-x grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div className="max-w-sm">
          <Link to="/" className="inline-flex items-center gap-2.5 rounded-md">
            <BrandMark />
            <span className="font-semibold tracking-tight">{brand.fullName}</span>
          </Link>
          <p className="mt-4 text-[0.92rem] leading-relaxed text-muted">{brand.tagline}</p>
        </div>

        <nav aria-label="Portal">
          <h2 className="text-sm font-semibold">Portal</h2>
          <ul className="mt-3 space-y-2 text-[0.92rem] text-muted">
            <li><Link to="/" className="hover:text-text">Home</Link></li>
            <li><Link to="/solutions" className="hover:text-text">Solutions</Link></li>
            <li><Link to="/applications" className="hover:text-text">Applications</Link></li>
          </ul>
        </nav>

        <nav aria-label="Applications">
          <h2 className="text-sm font-semibold">Applications</h2>
          <ul className="mt-3 space-y-2 text-[0.92rem] text-muted">
            {applications.map((app) => (
              <li key={app.id}>
                <Link to={`/applications/${app.id}`} className="hover:text-text">{app.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} {brand.fullName}</p>
          <p>Each application enforces its own sign-in. This portal is a front door, not a security boundary.</p>
        </div>
      </div>
    </footer>
  )
}
