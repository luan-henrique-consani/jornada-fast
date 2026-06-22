import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Search, Filter, Plus, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/cn'
import { MOCK_PROPOSTAS, type StatusProposta } from '@/mocks/propostas'

function StatusBadge({ status }: { status: StatusProposta }) {
  const map: Record<StatusProposta, { cls: string }> = {
    'Em análise': { cls: 'bg-warning-50 text-warning border-yellow-200' },
    Aprovada:     { cls: 'bg-success-50 text-success border-green-200' },
    Calculada:    { cls: 'bg-primary-50 text-primary-light border-blue-200' },
    Exportada:    { cls: 'bg-violet-50 text-violet-600 border-violet-200' },
    Erro:         { cls: 'bg-danger-50 text-danger border-red-200' },
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11.5px] font-semibold px-2 py-0.5 rounded border whitespace-nowrap',
        map[status].cls,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

export default function PropostasPage() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_PROPOSTAS.filter(
    (p) =>
      p.oc.toLowerCase().includes(search.toLowerCase()) ||
      p.cliente.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-tx">Propostas</h1>
          <p className="text-tx-3 text-[13.5px] mt-0.5">
            {MOCK_PROPOSTAS.length} propostas geradas este mês
          </p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg text-[13.5px] transition-colors"
        >
          <Plus size={15} />
          Nova proposta
        </Link>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: String(MOCK_PROPOSTAS.length), delta: '↑ 8 vs mês anterior', up: true },
          {
            label: 'Aprovadas',
            value: String(MOCK_PROPOSTAS.filter((p) => p.status === 'Aprovada').length),
            delta: '44% do total',
            up: true,
          },
          {
            label: 'Em análise',
            value: String(MOCK_PROPOSTAS.filter((p) => p.status === 'Em análise').length),
            delta: 'Aguardando revisão',
            up: false,
          },
          {
            label: 'Volume médio',
            value: '42,8 m³',
            delta: '↑ 5,2% vs mês ant.',
            up: true,
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white border border-border rounded-xl p-4 flex flex-col gap-1"
          >
            <div className="text-[12px] text-tx-3 font-medium">{kpi.label}</div>
            <div className="font-bold text-tx text-[22px] font-mono leading-none">{kpi.value}</div>
            <div
              className={cn(
                'text-[12px] font-semibold flex items-center gap-1',
                kpi.up ? 'text-success' : 'text-warning',
              )}
            >
              {kpi.up && <TrendingUp size={11} />}
              {kpi.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tx-muted" />
          <input
            type="text"
            placeholder="Buscar por OC ou cliente…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white border border-border rounded-lg text-[13.5px] text-tx outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 placeholder:text-tx-muted"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-lg text-[13.5px] text-tx-2 font-medium hover:bg-surface-2 transition-colors">
          <Filter size={14} />
          Filtros
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-border bg-surface-1">
                <th className="text-left px-4 py-3 font-semibold text-tx-3 text-[12px] uppercase tracking-wide">
                  OC / Cliente
                </th>
                <th className="text-left px-4 py-3 font-semibold text-tx-3 text-[12px] uppercase tracking-wide hidden md:table-cell">
                  Data
                </th>
                <th className="text-right px-4 py-3 font-semibold text-tx-3 text-[12px] uppercase tracking-wide hidden lg:table-cell">
                  Volume
                </th>
                <th className="text-right px-4 py-3 font-semibold text-tx-3 text-[12px] uppercase tracking-wide hidden lg:table-cell">
                  Mts carroceria
                </th>
                <th className="text-left px-4 py-3 font-semibold text-tx-3 text-[12px] uppercase tracking-wide hidden md:table-cell">
                  Veículo
                </th>
                <th className="text-left px-4 py-3 font-semibold text-tx-3 text-[12px] uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((proposta) => (
                <tr
                  key={proposta.id}
                  className="hover:bg-surface-1 transition-colors group"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 grid place-items-center flex-shrink-0">
                        <FileText size={14} className="text-primary-light" />
                      </div>
                      <div>
                        <div className="font-semibold text-tx">{proposta.oc}</div>
                        <div className="text-[12px] text-tx-3 truncate max-w-[200px]">
                          {proposta.cliente}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-tx-3 hidden md:table-cell whitespace-nowrap">
                    {proposta.data}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-tx hidden lg:table-cell">
                    {proposta.volume}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-tx hidden lg:table-cell">
                    {proposta.metrosCarroceria}
                  </td>
                  <td className="px-4 py-3.5 text-tx-2 hidden md:table-cell whitespace-nowrap">
                    {proposta.veiculo}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={proposta.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      to={`/propostas/${proposta.id}`}
                      className="text-[12px] font-semibold text-primary-light hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-tx-3 text-[14px]">
            Nenhuma proposta encontrada para &quot;{search}&quot;
          </div>
        )}
      </div>
    </div>
  )
}
