import { useEffect } from 'react'
import { brand } from '../config/brand'

/** Sets the document title per route, for history entries and screen readers. */
export function usePageTitle(page?: string) {
  useEffect(() => {
    document.title = page ? `${page} | ${brand.fullName}` : brand.fullName
  }, [page])
}
