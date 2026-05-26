import type { RouteObject } from 'react-router-dom'
import HomePage from './pages/HomePage'

const dashboardRoutes: RouteObject[] = [
  { index: true, element: <HomePage /> },
]

export default dashboardRoutes
