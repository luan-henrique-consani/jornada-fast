import { createBrowserRouter } from 'react-router-dom'
import DashboardLayout from '@/layouts/DashboardLayout'
import AuthLayout from '@/layouts/AuthLayout'
import NotFound from './NotFound'

import authRoutes from '@/modules/auth/routes'
import dashboardRoutes from '@/modules/dashboard/routes'
import estimativasRoutes from '@/modules/estimativas/routes'
import ordensCompraRoutes from '@/modules/ordensCompra/routes'

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: authRoutes,
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      ...dashboardRoutes,
      { path: 'ordens-compra', children: ordensCompraRoutes },
      { path: 'estimativas', children: estimativasRoutes },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export default router
