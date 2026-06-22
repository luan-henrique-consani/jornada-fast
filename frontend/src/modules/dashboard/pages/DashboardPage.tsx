import { Link } from 'react-router-dom'
import {
  FileText, Package, DollarSign, CheckCircle,
  Upload, RefreshCw, LayoutGrid,
  TrendingUp, TrendingDown,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/stores/auth.store'
import { MOCK_PROPOSTAS } from '@/mocks/propostas'

// ─── KPI CARD ──────────────────────────────────────────────────────────────────
interface KpiCardProps {
  icon: React.ReactNode
  iconVariant?: 'default' | 'accent' | 'success' | 'warning'
  label: string
  value: string
  delta: { value: string; up: boolean }
  detail?: string
}

function KpiCard({ icon, iconVariant = 'default', label, value, delta, detail }: KpiCardProps) {
  const iconColors = {
    default: 'bg-primary-50 text-primary-light',
    accent: 'bg-accent-50 text-accent',
    success: 'bg-success-50 text-success',
    warning: 'bg-warning-50 text-warning',
  }

  return (
    <div className="bg-white border border-border rounded-xl p-5 flex flex-col gap-2.5 shadow-sm relative overflow-hidden">
      <div className="flex items-center gap-2 text-tx-3 text-[12.5px] font-medium">
        <span className={cn('w-7 h-7 grid place-items-center rounded-md flex-shrink-0', iconColors[iconVariant])}>
          {icon}
        </span>
        {label}
      </div>
      <div className="font-mono text-[28px] font-bold text-tx tracking-tight leading-none">
        {value}
      </div>
      <div className={cn(
        'inline-flex items-center gap-1 text-[12.5px] font-semibold',
        delta.up ? 'text-success' : 'text-danger'
      )}>
        {delta.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        {delta.value}
        {detail && <span className="text-tx-3 font-normal ml-1">{detail}</span>}
      </div>
    </div>
  )
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
type StatusType = 'Em análise' | 'Aprovada' | 'Calculada' | 'Exportada' | 'Erro'

function StatusBadge({ status }: { status: StatusType }) {
  const map: Record<StatusType, { cls: string }> = {
    'Em análise': { cls: 'bg-warning-50 text-warning border-yellow-200' },
    'Aprovada':   { cls: 'bg-success-50 text-success border-green-200' },
    'Calculada':  { cls: 'bg-primary-50 text-primary-light border-blue-200' },
    'Exportada':  { cls: 'bg-violet-50 text-violet-600 border-violet-200' },
    'Erro':       { cls: 'bg-danger-50 text-danger border-red-200' },
  }
  const { cls } = map[status]
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11.5px] font-semibold px-2 py-0.5 rounded border whitespace-nowrap', cls)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

// ─── BAR CHART ─────────────────────────────────────────────────────────────────
const HEIGHTS = [44,60,38,52,70,64,30,80,56,72,48,65,82,90,55,70,84,76,62,88,95,60,74,92,85,70,88,95,78,100]

function BarChart() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-[3px] h-[180px] pt-3 px-1">
        {HEIGHTS.map((h, i) => (
          <div
            key={i}
            title={`Dia ${i + 1}: ${Math.round(h / 2)} propostas`}
            className={cn(
              'flex-1 rounded-t-sm min-h-[6px] transition-all hover:brightness-110 cursor-default',
              i === HEIGHTS.length - 1
                ? 'bg-gradient-to-b from-orange-400 to-accent'
                : 'bg-gradient-to-b from-primary-light to-primary'
            )}
            style={{ height: `${h * 1.8}px` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10.5px] font-mono text-tx-muted border-t border-border pt-2">
        <span>01/05</span>
        <span>08/05</span>
        <span>15/05</span>
        <span>22/05</span>
        <span>30/05</span>
      </div>
    </div>
  )
}

// ─── DONUT CHART ───────────────────────────────────────────────────────────────
function DonutChart() {
  return (
    <div className="flex items-center gap-6 justify-center py-2">
      <div
        className="w-36 h-36 rounded-full relative grid place-items-center flex-shrink-0"
        style={{ background: 'conic-gradient(#2D5F9E 0 62%, #F97316 62% 100%)' }}
      >
        <div className="absolute inset-7 bg-white rounded-full" />
        <div className="relative text-center">
          <div className="font-mono text-xl font-bold text-tx">62<span className="text-sm">%</span></div>
          <div className="text-[11px] text-tx-3">Caminhão</div>
        </div>
      </div>
      <div className="flex flex-col gap-2 text-[13px]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-primary-light flex-shrink-0" />
          <span className="font-semibold text-tx">Caminhão</span>
          <span className="font-mono text-tx-3 ml-auto pl-4">5.215 m³</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-accent flex-shrink-0" />
          <span className="font-semibold text-tx">Container</span>
          <span className="font-mono text-tx-3 ml-auto pl-4">3.197 m³</span>
        </div>
        <div className="mt-1 pt-2 border-t border-border text-[12px] text-tx-3">
          Conteinerizado cresceu{' '}
          <span className="text-success font-bold">↑ 14%</span> vs abril
        </div>
      </div>
    </div>
  )
}

// ─── DADOS DAS PROPOSTAS MOCK ─────────────────────────────────────────────────
const recentProposals = MOCK_PROPOSTAS.slice(0, 7).map((p) => ({
  oc: p.oc,
  id: p.id,
  cliente: p.cliente,
  date: p.data,
  vol: p.volume,
  status: p.status as StatusType,
}))

const pendingReviews = [
  { initials: 'BP', name: 'OC-2025-00847 · Bom Preço', desc: 'Gôndolas + Checkouts · 33,23 m³', time: '14h08' },
  { initials: 'AT', name: 'OC-2025-00841 · Atacadão',  desc: 'Margem 18% · ocupação 87%',        time: '14h22' },
  { initials: 'CE', name: 'OC-2025-00815 · Cencosud',  desc: 'Carreta extendida · 12,42 m',      time: '15h50' },
]

const topCategories = [
  { name: 'LSG (Gôndolas)', vol: '1.940 m³', pct: 88, colorCls: 'bg-primary-light' },
  { name: 'Checkouts',      vol: '1.420 m³', pct: 65, colorCls: 'bg-accent' },
  { name: 'Mobílias',       vol: '980 m³',   pct: 45, colorCls: 'bg-success' },
  { name: 'Porta Pallets',  vol: '620 m³',   pct: 28, colorCls: 'bg-warning' },
]

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.name?.split(' ')[0] ?? 'Rafael'

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-tx">Bom dia, {firstName}</h1>
          <p className="text-tx-3 text-[13.5px] mt-0.5">Resumo da operação · Quarta, 18 de junho · 2026</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="px-3.5 py-2 rounded-md border border-border text-tx-2 text-[13.5px] font-semibold bg-white hover:bg-surface-2 transition-colors">
            Exportar relatório
          </button>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-md text-[14px] transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            Nova proposta
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<FileText size={14} />} iconVariant="accent"
          label="Propostas hoje" value="47"
          delta={{ value: '↑ 12,5% vs ontem', up: true }} />
        <KpiCard icon={<Package size={14} />}
          label="Volume calculado (mês)" value="8.412 m³"
          delta={{ value: '↑ 6,2% vs abril', up: true }} />
        <KpiCard icon={<DollarSign size={14} />} iconVariant="success"
          label="Frete médio (R$/m linear)" value="R$ 218,40"
          delta={{ value: '↓ 1,8% vs abril', up: false }} />
        <KpiCard icon={<CheckCircle size={14} />} iconVariant="warning"
          label="Taxa de aprovação" value="72,3%"
          delta={{ value: '↑ 4,1 pts vs abril', up: true }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {[
          { icon: <Upload size={16} />, title: 'Subir OC em PDF/Excel', sub: 'Extração automática · 30s', to: '/upload' },
          { icon: <RefreshCw size={16} />, title: 'Reabrir última proposta', sub: 'OC-2025-00847 · Bom Preço · 14h08', to: '/propostas/oc-2025-00847' },
          { icon: <LayoutGrid size={16} />, title: 'Ver todas as propostas', sub: '9 propostas este mês · 4 aprovadas', to: '/propostas' },
        ].map((qa) => (
          <Link key={qa.title} to={qa.to}
            className="flex flex-col gap-1.5 p-3.5 border border-dashed border-border-strong rounded-md bg-white hover:border-accent hover:bg-accent-50 transition-all cursor-pointer"
          >
            <span className="w-7 h-7 rounded-md bg-accent-50 text-accent grid place-items-center flex-shrink-0">{qa.icon}</span>
            <span className="font-semibold text-[13px] text-tx">{qa.title}</span>
            <span className="text-[11.5px] text-tx-3">{qa.sub}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        <div className="bg-white border border-border rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <h3 className="text-[14px] font-bold text-tx">Propostas por dia · últimos 30 dias</h3>
            <span className="text-[12px] text-tx-3">Maio/2026</span>
            <div className="ml-auto flex items-center gap-1.5">
              {['30d', '90d', '1a'].map((p) => (
                <button key={p} className={cn(
                  'px-2.5 py-1 rounded text-[12px] font-semibold border transition-colors',
                  p === '30d' ? 'bg-primary-50 text-primary border-primary-100' : 'border-transparent text-tx-3 hover:bg-surface-2'
                )}>{p}</button>
              ))}
            </div>
          </div>
          <div className="p-5"><BarChart /></div>
        </div>
        <div className="bg-white border border-border rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <h3 className="text-[14px] font-bold text-tx">Distribuição por modal</h3>
            <span className="text-[12px] text-tx-3">Maio</span>
          </div>
          <div className="p-5"><DonutChart /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <h3 className="text-[14px] font-bold text-tx">Últimas propostas</h3>
            <span className="text-[12px] text-tx-3">10 mais recentes</span>
            <Link to="/propostas" className="ml-auto text-[12.5px] font-semibold text-tx-3 hover:text-primary transition-colors">Ver todas →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-surface-2">
                  {['OC', 'Cliente', 'Data', 'Volume', 'Status', ''].map((h) => (
                    <th key={h} className={cn(
                      'px-3.5 py-2.5 text-[11.5px] font-semibold text-tx-3 uppercase tracking-wide border-b border-border text-left',
                      h === 'Volume' && 'text-right',
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentProposals.map((row, i) => (
                  <tr key={row.oc} className={cn(
                    'border-b border-border hover:bg-primary-50 transition-colors',
                    i % 2 === 1 && 'bg-slate-50/40'
                  )}>
                    <td className="px-3.5 py-3 font-mono text-tx">{row.oc}</td>
                    <td className="px-3.5 py-3 text-tx">{row.cliente}</td>
                    <td className="px-3.5 py-3 font-mono text-tx-muted">{row.date}</td>
                    <td className="px-3.5 py-3 font-mono text-right text-tx">{row.vol}</td>
                    <td className="px-3.5 py-3"><StatusBadge status={row.status} /></td>
                    <td className="px-3.5 py-3 text-right">
                      <Link to={`/propostas/${row.id}`} className="text-tx-3 font-semibold text-[12.5px] hover:text-primary transition-colors">Abrir →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white border border-border rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b border-border flex items-center gap-3">
              <h3 className="text-[14px] font-bold text-tx">Pendentes de revisão</h3>
              <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-accent-50 text-accent border border-orange-200">3</span>
            </div>
            <div className="px-5 divide-y divide-border">
              {pendingReviews.map((item) => (
                <div key={item.name} className="flex items-center gap-3 py-3">
                  <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-light grid place-items-center text-[11px] font-bold flex-shrink-0">{item.initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[13.5px] text-tx truncate">{item.name}</div>
                    <div className="text-[12px] text-tx-3 truncate">{item.desc}</div>
                  </div>
                  <div className="font-mono text-[11.5px] text-tx-muted flex-shrink-0">{item.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 p-3.5 bg-warning-50 border border-yellow-200 rounded-md text-warning text-[13px] items-start">
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold mb-0.5">2 transportadoras com vigência expirando</div>
              <div className="text-[12.5px] opacity-90">TransLog SP e Rodofrete PE têm tabelas que vencem nos próximos 7 dias.</div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-[14px] font-bold text-tx">Top categorias da semana</h3>
            </div>
            <div className="p-5 flex flex-col gap-3.5">
              {topCategories.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between mb-1.5">
                    <span className="font-semibold text-[13px] text-tx">{cat.name}</span>
                    <span className="font-mono text-[12px] text-tx-3">{cat.vol}</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', cat.colorCls)} style={{ width: `${cat.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
