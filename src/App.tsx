import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { Solutions } from './pages/Solutions'
import { Applications } from './pages/Applications'
import { AppDetail } from './pages/AppDetail'
import { NotFound } from './pages/NotFound'

/**
 * Routes. Launch pages are generated from the catalog via /applications/:slug,
 * so adding an application never requires a new route.
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
    </Routes>
  )
}
