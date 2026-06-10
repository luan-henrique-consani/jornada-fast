import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import NotFound from './NotFound'

import authRoutes from '@/modules/auth/routes'
import dashboardRoutes from '@/modules/dashboard/routes'
import uploadRoutes from '@/modules/upload/routes'

function Placeholder({ title }: { title: string }) {
  return (
    <div className="p-8 flex flex-col gap-3">
      <h1 className="text-2xl font-bold text-tx tracking-tight">{title}</h1>
      <p className="text-tx-3 text-[14px]">Página em construção.</p>
    </div>
  )
}

const router = createBrowserRouter([
  // Public auth pages (no AppLayout)
  ...authRoutes,

  // Protected app shell
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          ...dashboardRoutes,
          ...uploadRoutes,
          {
            path: 'propostas',
            element: <Placeholder title="Propostas" />,
            handle: { crumbs: ['Início', 'Propostas'] },
          },
          {
            path: 'pecas',
            element: <Placeholder title="Peças" />,
            handle: { crumbs: ['Início', 'Peças'] },
          },
          {
            path: 'veiculos',
            element: <Placeholder title="Veículos" />,
            handle: { crumbs: ['Início', 'Veículos'] },
          },
          {
            path: 'historico',
            element: <Placeholder title="Histórico" />,
            handle: { crumbs: ['Gestão', 'Histórico'] },
          },
          {
            path: 'auditoria',
            element: <Placeholder title="Auditoria" />,
            handle: { crumbs: ['Gestão', 'Auditoria'] },
          },
          {
            path: 'parametros',
            element: <Placeholder title="Parâmetros" />,
            handle: { crumbs: ['Gestão', 'Parâmetros'] },
          },
          {
            path: 'admin',
            element: <Placeholder title="Admin" />,
            handle: { crumbs: ['Gestão', 'Admin'] },
          },
        ],
      },
    ],
  },

  { path: '*', element: <NotFound /> },
])

export default router
