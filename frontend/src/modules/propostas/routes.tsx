import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const PropostasPage = lazy(() => import('./pages/PropostasPage'))
const PropostaDetailPage = lazy(() => import('./pages/PropostaDetailPage'))

const propostasRoutes: RouteObject[] = [
  {
    path: 'propostas',
    element: <PropostasPage />,
    handle: { crumbs: ['Operação', 'Propostas'] },
  },
  {
    path: 'propostas/:id',
    element: <PropostaDetailPage />,
    handle: { crumbs: ['Operação', 'Propostas', 'Detalhe'] },
  },
]

export default propostasRoutes
