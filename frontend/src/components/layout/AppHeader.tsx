import { Bell, Search } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/stores/auth.store'

interface AppHeaderProps {
  crumbs?: string[]
  sync?: 'sync' | 'syncing' | 'error'
}

export default function AppHeader({ crumbs = [], sync = 'sync' }: AppHeaderProps) {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="h-14 bg-white border-b border-border flex items-center px-6 gap-4 sticky top-0 z-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[13px] text-tx-3">
        {crumbs.map((crumb, i) => (
          <span key={crumb} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-tx-muted">/</span>}
            <span className={cn(i === crumbs.length - 1 && 'text-tx font-semibold')}>
              {crumb}
            </span>
          </span>
        ))}
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-md px-3 py-1.5 w-64 text-tx-3 text-[13px]">
        <Search size={14} className="flex-shrink-0" />
        <input
          className="bg-transparent border-0 outline-none flex-1 text-tx placeholder:text-tx-3 text-[13px]"
          placeholder="Buscar proposta, cliente..."
        />
        <kbd className="font-mono text-[10.5px] bg-white border border-border px-1.5 py-0.5 rounded text-tx-3">
          ⌘K
        </kbd>
      </div>

      {/* Sync pill */}
      <SyncPill status={sync} />

      {/* Notification */}
      <button className="relative w-9 h-9 grid place-items-center text-tx-2 hover:bg-surface-2 rounded-md border border-transparent hover:border-border transition-colors">
        <Bell size={18} />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent border-2 border-white" />
      </button>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-light to-accent grid place-items-center text-white font-bold text-[11px] flex-shrink-0 cursor-pointer">
        {user?.name
          ? user.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
          : 'U'}
      </div>
    </header>
  )
}

function SyncPill({ status }: { status: 'sync' | 'syncing' | 'error' }) {
  if (status === 'syncing') {
    return (
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-warning-50 text-warning text-[12px] font-semibold border border-yellow-200">
        <span className="w-1.5 h-1.5 rounded-full bg-warning animate-spin" />
        Sincronizando
      </div>
    )
  }
  if (status === 'error') {
    return (
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-danger-50 text-danger text-[12px] font-semibold border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-danger" />
        Erro de conexão
      </div>
    )
  }
  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-success-50 text-success text-[12px] font-semibold border border-green-200">
      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
      Sincronizado
    </div>
  )
}
