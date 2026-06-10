import type { RouteObject } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'

const dashboardRoutes: RouteObject[] = [
  {
    index: true,
    element: <DashboardPage />,
    handle: { crumbs: ['Início', 'Dashboard'], sync: 'sync' },
  },
]

export default dashboardRoutes
