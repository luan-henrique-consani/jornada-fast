import { Outlet, useMatches } from 'react-router-dom'
import AppSidebar from '@/components/layout/AppSidebar'
import AppHeader from '@/components/layout/AppHeader'
import { useUIStore } from '@/stores/theme.store'
import { cn } from '@/lib/cn'

interface RouteHandle {
  crumbs?: string[]
  sync?: 'sync' | 'syncing' | 'error'
}

export default function AppLayout() {
  const { sidebar } = useUIStore()
  const matches = useMatches()

  const handle = matches
    .slice()
    .reverse()
    .find((m) => (m.handle as RouteHandle)?.crumbs) as { handle: RouteHandle } | undefined

  const crumbs = handle?.handle?.crumbs ?? ['Início']
  const sync = handle?.handle?.sync ?? 'sync'

  return (
    <div
      className={cn(
        'flex min-h-screen transition-all duration-200',
      )}
    >
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AppHeader crumbs={crumbs} sync={sync} />
        <main
          className={cn(
            'flex-1',
            sidebar === 'collapsed' ? '' : ''
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
