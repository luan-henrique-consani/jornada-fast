import type { RouteObject } from 'react-router-dom'
import UploadPage from './pages/UploadPage'

const uploadRoutes: RouteObject[] = [
  {
    path: 'upload',
    element: <UploadPage />,
    handle: { crumbs: ['Início', 'Nova Proposta'] },
  },
]

export default uploadRoutes
