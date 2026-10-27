import { useParams } from 'react-router-dom'
import { getApplication } from '../config/applications'
import { AppLaunchPage } from '../components/apps/AppLaunchPage'
import { NotFound } from './NotFound'
import { usePageTitle } from '../lib/usePageTitle'

export function AppDetail() {
  const { slug } = useParams()
  const app = getApplication(slug)
  usePageTitle(app?.name)
  if (!app) return <NotFound />
  return <AppLaunchPage key={app.id} app={app} />
}
