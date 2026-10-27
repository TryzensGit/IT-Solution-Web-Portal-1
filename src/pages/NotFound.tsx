import { ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { usePageTitle } from '../lib/usePageTitle'

export function NotFound() {
  usePageTitle('Page not found')
  return (
    <div className="container-x flex flex-col items-start py-24 sm:py-32">
      <p className="text-sm font-medium text-faint">404</p>
      <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.02em]">This page does not exist</h1>
      <p className="mt-3 max-w-md text-[1.02rem] leading-relaxed text-muted">
        The address may be out of date, or the application you are looking for has not been added to the portal yet.
      </p>
      <Button to="/" className="mt-8" variant="secondary">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to portal
      </Button>
    </div>
  )
}
