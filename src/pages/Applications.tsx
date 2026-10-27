import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { applications, getApplication, populatedCategories } from '../config/applications'
import { ApplicationGrid } from '../components/home/ApplicationGrid'
import { SectionHeading } from '../components/ui/SectionHeading'
import { AppIcon } from '../components/ui/AppIcon'
import { getRecentApps } from '../lib/recent'
import { usePageTitle } from '../lib/usePageTitle'

export function Applications() {
  usePageTitle('Applications')
  const [recent, setRecent] = useState<string[]>([])
  useEffect(() => {
    setRecent(getRecentApps())
  }, [])

  const recentApps = recent.map(getApplication).filter((a): a is NonNullable<typeof a> => Boolean(a))
  const groups = populatedCategories()
  // Group by category only once it adds structure: more than one category
  // and at least one category holding several applications.
  const grouped =
    groups.length > 1 && groups.some((c) => applications.filter((a) => a.category === c.id).length > 1)

  return (
    <div className="container-x py-12 sm:py-16">
      <SectionHeading
        as="h1"
        title="Applications"
        lead="Everything available from the portal. Each application opens in its own tab and asks for its own sign-in."
      />

      {recentApps.length > 0 && (
        <section className="mb-12" aria-labelledby="recent">
          <h2 id="recent" className="inline-flex items-center gap-2 text-sm font-semibold text-muted">
            <Clock className="size-4" aria-hidden="true" />
            Recently opened
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {recentApps.map((app) => (
              <li key={app.id}>
                <Link
                  to={`/applications/${app.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium transition-colors hover:border-line-strong hover:bg-elevated"
                >
                  <AppIcon name={app.icon} className="size-4 text-accent" />
                  {app.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {grouped ? (
        <div className="space-y-14">
          {groups.map((cat) => {
            const apps = applications.filter((a) => a.category === cat.id)
            return (
              <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
                <h2 id={`cat-${cat.id}`} className="mb-5 text-lg font-semibold tracking-tight">
                  {cat.label}
                </h2>
                <ApplicationGrid apps={apps} />
              </section>
            )
          })}
        </div>
      ) : (
        <ApplicationGrid apps={applications} aria-label="Applications" />
      )}
    </div>
  )
}
