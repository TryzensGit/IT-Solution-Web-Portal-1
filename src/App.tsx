import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { Solutions } from './pages/Solutions'
import { Applications } from './pages/Applications'
import { AppDetail } from './pages/AppDetail'
import { NotFound } from './pages/NotFound'

// The demo applications are sizeable and only needed when opened, so they
// load on demand instead of weighing down the portal bundle.
const UserDemo = lazy(() => import('./demo/user-management/UserDemo').then((m) => ({ default: m.UserDemo })))
const AssetDemo = lazy(() => import('./demo/asset-management/AssetDemo').then((m) => ({ default: m.AssetDemo })))
const ChatbotDemo = lazy(() => import('./demo/chatbot/ChatbotDemo').then((m) => ({ default: m.ChatbotDemo })))

function DemoLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas text-muted" role="status">
      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
      <span className="sr-only">Loading demo</span>
    </div>
  )
}

/**
 * Routes. Launch pages are generated from the catalog via /applications/:slug,
 * so adding an application never requires a new route. The demo applications
 * live outside the portal layout so they look and behave like the real,
 * separately hosted applications.
 */
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="solutions" element={<Solutions />} />
        <Route path="applications" element={<Applications />} />
        <Route path="applications/:slug" element={<AppDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route
        path="demo/user-management"
        element={
          <Suspense fallback={<DemoLoading />}>
            <UserDemo />
          </Suspense>
        }
      />
      <Route
        path="demo/asset-management"
        element={
          <Suspense fallback={<DemoLoading />}>
            <AssetDemo />
          </Suspense>
        }
      />
      <Route
        path="demo/tisa-assistant"
        element={
          <Suspense fallback={<DemoLoading />}>
            <ChatbotDemo />
          </Suspense>
        }
      />
    </Routes>
  )
}
