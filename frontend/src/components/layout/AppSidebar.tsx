import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Upload,
  Package,
  Truck,
  FileText,
  History,
  ClipboardList,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUIStore } from '@/stores/theme.store'
import { useAuthStore } from '@/stores/auth.store'
import { authService } from '@/modules/auth/services/auth.service'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  badge?: number | string
  adminOnly?: boolean
}

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: 'Operação',
    items: [
      {
        label: 'Dashboard',
        path: '/',
        icon: <LayoutDashboard size={18} />,
      },
      {
        label: 'Nova Proposta',
        path: '/upload',
        icon: <Upload size={18} />,
      },
      {
        label: 'Propostas',
        path: '/propostas',
        icon: <FileText size={18} />,
        badge: 9,
      },
      {
        label: 'Peças',
        path: '/pecas',
        icon: <Package size={18} />,
      },
      {
        label: 'Veículos',
        path: '/veiculos',
        icon: <Truck size={18} />,
      },
    ],
  },
  {
    title: 'Gestão',
    items: [
      {
        label: 'Histórico',
        path: '/historico',
        icon: <History size={18} />,
      },
      {
        label: 'Auditoria',
        path: '/auditoria',
        icon: <ClipboardList size={18} />,
        adminOnly: true,
      },
      {
        label: 'Parâmetros',
        path: '/parametros',
        icon: <Settings size={18} />,
        adminOnly: true,
      },
      {
        label: 'Admin',
        path: '/admin',
        icon: <ShieldCheck size={18} />,
        adminOnly: true,
      },
    ],
  },
]

export default function AppSidebar() {
  const { sidebar, toggleSidebar } = useUIStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const collapsed = sidebar === 'collapsed'

  function handleLogout() {
    authService.logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <aside
      className={cn(
        'flex flex-col bg-primary text-slate-300 min-h-screen sticky top-0 h-screen transition-all duration-200 ease-in-out',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          'flex items-center gap-3 border-b border-white/[0.06]',
          collapsed ? 'px-3 py-[18px] justify-center' : 'px-[18px] py-[18px]'
        )}
      >
        <div className="w-8 h-8 bg-accent rounded-md grid place-items-center text-white font-extrabold text-sm flex-shrink-0">
          LF
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-white font-bold text-[15px] tracking-tight leading-tight">LOGFAST</div>
            <div className="text-[11px] text-slate-400 tracking-widest uppercase">Logística</div>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={toggleSidebar}
            className="ml-auto text-slate-400 hover:text-white hover:bg-white/[0.06] p-1.5 rounded"
            aria-label="Recolher sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={toggleSidebar}
          className="mt-2 mx-auto text-slate-400 hover:text-white hover:bg-white/[0.06] p-1.5 rounded"
          aria-label="Expandir sidebar"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.adminOnly || user?.role === 'ADMIN'
          )
          if (visibleItems.length === 0) return null

          return (
            <div key={group.title}>
              {!collapsed && (
                <div className="px-[18px] pt-[18px] pb-2 text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500">
                  {group.title}
                </div>
              )}
              <div className={cn('px-2.5 flex flex-col gap-0.5', collapsed && 'pt-2')}>
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-md text-[13.5px] font-medium transition-colors duration-100 whitespace-nowrap',
                        collapsed ? 'justify-center p-2.5' : 'px-2.5 py-2.5',
                        isActive
                          ? 'bg-accent/[0.14] text-white shadow-[inset_2px_0_0_theme(colors.accent.DEFAULT)]'
                          : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                      )
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="flex-shrink-0 grid place-items-center w-[18px]">
                      {item.icon}
                    </span>
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="bg-accent text-white text-[11px] font-semibold px-1.5 py-px rounded-full font-mono">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        className={cn(
          'border-t border-white/[0.06] p-3 flex items-center gap-2.5',
          collapsed && 'justify-center'
        )}
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-light to-accent grid place-items-center text-white font-bold text-[13px] flex-shrink-0">
          {initials}
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0 text-[12.5px]">
              <div className="text-white font-semibold truncate">{user?.name ?? 'Usuário'}</div>
              <div className="text-slate-400 text-[11px] truncate">{user?.role === 'ADMIN' ? 'Administrador' : 'Operador'}</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-white/[0.06] flex-shrink-0"
              title="Sair"
            >
              <LogOut size={15} />
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
