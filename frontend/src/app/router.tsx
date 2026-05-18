import { createBrowserRouter } from 'react-router-dom'
import DashboardLayout from '@/layouts/DashboardLayout'
import HomePage from '@/modules/dashboard/pages/HomePage'
import NotFound from './NotFound'

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <HomePage /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export default router
